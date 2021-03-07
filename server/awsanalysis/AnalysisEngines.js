import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Logger } from "../../lib/server/Logger";
import ResourceManager from "./ResourceManager";
import { Picker } from "meteor/meteorhacks:picker";
import { Mongo } from "meteor/mongo";
import AWS from "aws-sdk";
import { HTTP } from "meteor/http";
import ssh2 from "ssh2";
import { Users } from "../../imports/collections/users";

//
// instance statuses:
//   spot - We have the spot information, but not the instance information yet
//   starting - We know it's out there, but AWS has not yet notified us that the instance is ready to use
//   active - AWS has notified us that the instance is ready to use, but we have not done anything with it yet
//   checking - We are trying to discern whether or not stockfish has been installed
//   check_failed - We were unable to get a valid check
//   needs_install - Check determined we need a stockfish install
//   installing - We are installing stockfish
//   installed - It should now be installed, and ready for another check
//   install_failed - We were unable to install stockfish
//   ready - Checks have passed, and it is now ready to provide engines
//   interrupted - AWS has notified us that the instance is going to go away
//   termination_delay - Marked for termination after a delay
//   terminating - We have asked AWS to terminate this instance
//   stopping - AWS has notified us that the instance is stopping, but it isn't gone yet
//
const collection = new Mongo.Collection("aws_stockfish_instances");
const my_ip = process.env.MY_IP_ADDRESS;
const my_port = process.env.MY_PORT;
const spot_fleet_id = "sfr-f70183ef-0954-44dc-83d5-53c10d83067e";
const ec2 = new AWS.EC2();
const sns = new AWS.SNS();
const sns_topic = {};

const log = new Logger("server/AnalysisEngine_js");
process.on("uncaughtException", function(err) {
  console.log("help!");
});

Meteor.publishComposite("developer_analysis_engines", {
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return collection.find();
      }
    }
  ]
});

//*****************************************************************************
//**    These are the methods that get called when spot instances change     **
//*****************************************************************************
const spotInterruption = Meteor.bindEnvironment((action, instance_id) => {
  // action can be "hibernate", "stop", or "terminate"
  log.debug("::spotInterruption action=" + action + ", instance_id=" + instance_id);
  collection.update({ instance_id: instance_id }, { $set: { status: "interrupted" } });
});

const instanceChanged = Meteor.bindEnvironment((state, instance_id) => {
  log.debug("instanceChanged state=" + state + ", intance_id=" + instance_id);
  // Called by SNS when an instance is started or stopped (or any other state)
  // The possible states:
  // pending, running, shutting-down, stopped, stopping, terminated
  const record = collection.findOne({ instance_id: instance_id });
  if (!record) {
    getInitialInstanceState();
    return;
  }
  let status = "unknown";
  switch (state) {
    case "running":
      status = "active";
      break;
    case "pending":
      status = "starting";
      break;
    case "stopping":
    case "shutting-down":
      status = "stopping";
      break;
    case "stopped":
    case "terminated":
      status = "terminated";
      break;
    default:
      log.error("Unknown status from instanceChanged: " + state);
      break;
  }
  collection.update({ _id: record._id }, { $set: { status: status } });
});

//*****************************************************************************
//** Set up the subscriptions to be notified by AWS if we are losing a spot  **
//** instance                                                                **
//*****************************************************************************
function setupSNS() {
  log.debug("setupSNS");
  getOurTopics(() => {
    initiateEndpoint("InstanceChanged", "/aws_instance_changed");
    initiateEndpoint("SpotWarning", "/aws_spot_interruption");
  });
}

const getOurTopics = Meteor.wrapAsync(callback => {
  const params = {};
  sns.listTopics(params, (err, data) => {
    if (err) callback(err);
    data.Topics.forEach(topic => {
      const arn = topic.TopicArn;
      const pieces = arn.split(":");
      const name = pieces[pieces.length - 1];
      sns_topic[name] = arn;
    });
    callback();
  });
});

function initiateEndpoint(sns_topic_key, path) {
  log.debug("initiateEndpoint");
  var params = {
    Protocol: "http",
    TopicArn: sns_topic[sns_topic_key],
    Endpoint: "http://" + my_ip + ":" + my_port + path,
    ReturnSubscriptionArn: true
  };
  sns.subscribe(params, err => {
    if (err) log.error("Error subscribing to " + sns_topic + ": " + err.toString());
  });
}

const confirmSubscription = Meteor.bindEnvironment((sns_topic_key, token) => {
  log.debug("confirmSubscription");
  sns.confirmSubscription({ TopicArn: sns_topic[sns_topic_key], Token: token }, err => {
    if (err) log.error("Error confirming subscription to " + sns_topic_key + ": " + err.toString());
  });
});

Picker.route("/aws_instance_changed", function(params, req, res) {
  log.debug("/aws_instance_changed");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      confirmSubscription("InstanceChanged", payload.Token);
    } else {
      const message = JSON.parse(payload.Message);
      instanceChanged(message.detail["state"], message.detail["instance-id"]);
    }
    res.end("ok");
  });
});

Picker.route("/aws_spot_interruption", function(params, req, res) {
  log.debug("/aws_spot_interruption");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      confirmSubscription("SpotWarning", payload.Token);
    } else {
      const message = JSON.parse(payload.Message);
      spotInterruption(message.detail["instance-action"], message.detail["instance-id"]);
    }
    res.end("ok");
  });
});

//*****************************************************************************
//** These are the AWS routines to obtain info and modify the spot instances **
//*****************************************************************************

const describeInstances = instance_ids => {
  log.debug("describeInstances");
  ec2.describeInstances(
    { InstanceIds: instance_ids },
    Meteor.bindEnvironment((err, data) => {
      log.debug("describeInstances callback");
      if (err) {
        log.error("Unable to describeInstances, err=" + err.toString());
        return;
      }
      // Create an array of instances from this
      data.Reservations.forEach(r => {
        r.Instances.forEach(i => {
          let status = "unknown";
          switch (i.State.Name) {
            case "running":
              status = "active";
              break;
            case "pending":
              status = "starting";
              break;
            case "stopping":
            case "shutting-down":
              status = "stopping";
              break;
            case "stopped":
            case "terminated":
              status = "terminated";
              break;
            default:
              log.error("Unknown status from describeInstances: " + i.State.Name);
              break;
          }
          collection.update(
            { instance_id: i.InstanceId },
            { $set: { aws_instance: i, status: status } }
          );
        });
      });
    })
  );
};

const getInitialInstanceState = () => {
  log.debug("getInitialInstanceState");
  ec2.describeSpotFleetInstances(
    { SpotFleetRequestId: spot_fleet_id },
    Meteor.bindEnvironment((err, data) => {
      log.debug("getInitialInstanceState callback");
      const instance_ids = [];
      if (err) log.error(err);
      if (!data) return;
      data.ActiveInstances.forEach(ai => {
        instance_ids.push(ai.InstanceId);
        collection.upsert(
          { instance_id: ai.InstanceId },
          { $set: { spot_fleet_instance: ai }, $setOnInsert: { status: "spot" } }
        );
      });
      collection.remove({ instance_id: { $nin: instance_ids } });
      describeInstances(instance_ids);
    })
  );
};

function modifySpotFleetRequest(newcount) {
  log.debug("modifySpotFleetRequest");
  ec2
    .modifySpotFleetRequest({
      SpotFleetRequestId: spot_fleet_id,
      TargetCapacity: newcount
    })
    .promise();
}

function terminateInstances(instance_ids, newcount) {
  log.debug("terminateInstances");
  ec2.terminateInstances(
    { InstanceIds: instance_ids },
    Meteor.bindEnvironment((err, data) => {
      modifySpotFleetRequest(newcount);
    })
  );
}

function cancelSpotInstanceRequests(spot_instance_request_ids, instance_ids, newcount) {
  log.debug("cancelSpotInstanceRequests");
  ec2.cancelSpotInstanceRequests(
    { SpotInstanceRequestIds: spot_instance_request_ids },
    Meteor.bindEnvironment((err, data) => {
      log.debug("cancelSpotInstanceRequests callback");
      if (!!err) log.error("Error in cancelSpotInstanceRequest: " + err);
      terminateInstances(instance_ids, newcount);
    })
  );
}

function removeInstances(instanceArray) {
  log.debug("removeInstances");
  const count = collection.find({}).count();
  const spot_instance_request_ids = [];
  const instance_ids = [];
  collection.find({ _id: { $in: instanceArray } }).forEach(rec => {
    spot_instance_request_ids.push(rec.spot_fleet_instance.SpotInstanceRequestId);
    instance_ids.push(rec.aws_instance.InstanceId);
  });
  const newcount = count - spot_instance_request_ids.length;
  cancelSpotInstanceRequests(spot_instance_request_ids, instance_ids, newcount);
}

const getInstallationStatusFromInstance = Meteor.wrapAsync((record, callback) => {
  const url = "http://" + record.aws_instance.PublicIpAddress + "/ok";
  HTTP.get(
    url,
    {},
    Meteor.bindEnvironment(error => {
      log.debug("getInstallationStatusFromInstance response");
      if (error) {
        log.debug("getInstallationStatusFromInstance error=" + error);
        if (error.errno === "ECONNREFUSED") {
          log.debug("getInstallationStatusFromInstance returning 'refused'");
          callback(null, "refused");
        } else {
          log.error("getInstallationStatusFromInstance rejecting on error=" + error);
          callback(error);
        }
      } else {
        log.debug("getInstallationStatusFromInstance resolving 'running'");
        callback(null, "running");
      }
    })
  );
});

function checkInstanceInstallationStatus(record) {
  log.debug("checkInstanceInstallationStatus");
  collection.update(
    { _id: record._id },
    { $set: { status: "checking", check_count: (record.check_count || 0) + 1 } }
  );

  getInstallationStatusFromInstance(record, (err, instance_status) => {
    if (!!err) {
      log.error("getInstallationStatusFromInstance error=" + err);
      collection.update({ _id: record._id }, { $set: { status: "check_failed" } });
      return;
    }
    log.debug(
      "checkInstanceInstallationStatus promise return from getInstallationStatusFromInstance, instance_status=" +
        instance_status
    );
    if (instance_status === "running") {
      collection.update(
        { _id: record._id },
        { $set: { status: "ready" }, $unset: { check_count: 1 } }
      );
    } else if (instance_status === "refused") {
      collection.update({ _id: record._id }, { $set: { status: "needs_install" } });
    } else {
      log.error("Check returned unknown status: " + instance_status);
      collection.update({ _id: record._id }, { $set: { status: "check_failed" } });
    }
  });
}

const sshReadyFunction = Meteor.bindEnvironment((sshConn, callback) => {
  log.debug("sshReadyFunction in promise");
  try {
    sshConn.exec(
      "curl -sL https://raw.githubusercontent.com/djlogan2/stockfish2/master/install.sh | sudo /bin/bash ; exit",
      Meteor.bindEnvironment((err, stream) => {
        if (err) {
          callback(err);
          return;
        }
        stream
          .on(
            "close",
            Meteor.bindEnvironment(() => {
              log.debug("Closing ssh from stockfish install");
              sshConn.end();
              callback();
            })
          )
          .on(
            "data",
            Meteor.bindEnvironment(data => {
              // Just ignore this
              log.debug("ssh stockfish install stdout: " + data);
            })
          )
          .stderr.on(
            "data",
            Meteor.bindEnvironment(data => {
              // Just ignore this too
              log.debug("ssh stockfish install STDERR: " + data);
            })
          );
      })
    );
  } catch (e) {
    log.error("ssh stockfish install ssh exec failed: " + e);
    callback(e);
  }
});

const installStockfish = record => {
  log.debug("installStockfish");
  collection.update(
    { _id: record._id },
    { $set: { status: "installing", install_count: (record.install_count || 0) + 1 } }
  );
  const sshConn = new ssh2.Client.Client();
  const creds = {
    host: record.aws_instance.PublicIpAddress,
    port: 22,
    username: "ubuntu",
    privateKey: require("fs").readFileSync("/Users/davidlogan/.ssh/id_rsa")
  };
  sshConn.on("ready", () =>
    sshReadyFunction(sshConn, () => {
      log.debug("installStockfish promise return");
      collection.update(
        { _id: record._id },
        { $set: { status: "installed" }, $unset: { install_count: 1 } }
      );
    })
  );
  sshConn.on(
    "error",
    Meteor.bindEnvironment(err => {
      log.error(
        "installStockfish unable to connect to instance " +
          record.instance_id +
          ", err=" +
          err.messsage
      );
      collection.update({ _id: record._id }, { $set: { status: "install_failed" } });
    })
  );
  sshConn.connect(creds);
};

//*****************************************************************************
//** ???   **
//*****************************************************************************
const allocateEngineInInstance = () => {};

const freeEngineInInstance = () => {};

//*****************************************************************************
//** These are called by the resource manager to create or destroy engines   **
//*****************************************************************************
const create_function = Meteor.wrapAsync((count, callback) => {});

const destroy_function = Meteor.wrapAsync((instance_array, callback) => {});

const resourcemanager = new ResourceManager({
  create_resource: create_function,
  destroy_resource: destroy_function
});

function handleStatus(id, status) {
  log.debug("handleStatus");
  const record = collection.findOne({ _id: id });
  let interval;
  log.debug("Instance " + id + " in status " + status + " is being transitioned");
  switch (status) {
    case "starting":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "active":
      checkInstanceInstallationStatus(record);
      break;
    case "checking":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "check_failed":
      if (!!record.check_count && record.check_count >= 5) {
        log.error("Unable to check instance " + record._id + " -- Too many failed checks");
        //removeInstances([id]);
        return;
      }
      interval = Meteor.setInterval(() => {
        Meteor.clearInterval(interval);
        checkInstanceInstallationStatus(record);
      }, 60000);
      //removeInstances([id]);
      break;
    case "needs_install":
      installStockfish(record);
      break;
    case "installing":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "installed":
      checkInstanceInstallationStatus(record);
      break;
    case "install_failed":
      if (!!record.install_count && record.install_count >= 5) {
        log.error(
          "Unable to install stockfish for instance " + record._id + " -- Too many failed attempts"
        );
        //removeInstances([id]);
        return;
      }
      interval = Meteor.setInterval(() => {
        Meteor.clearInterval(interval);
        installStockfish(record);
      }, 60000);
      break;
    case "ready":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "termination_delay":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "terminating":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "stopping":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "spot":
      break;
    default:
      log.error("Unknown status found in observeChanges for id " + id + ", status=" + status);
      break;
  }
}

Meteor.startup(() => {
  setupSNS();
  getInitialInstanceState();

  collection.find().observeChanges({
    added(id, fields) {
      log.debug("observeChanges added id=" + id + ", status=" + fields.status);
      handleStatus(id, fields.status);
    },
    changed(id, fields) {
      log.debug("observeChanges changed id=" + id + ", status=" + fields.status);
      if ("status" in fields) {
        handleStatus(id, fields.status);
      }
    }
  });
});

Meteor.methods({
  developer_modifySpotFleetRequest: newcount => {
    check(Meteor.user(), Object);
    check(newcount, Number);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to modify fleet request", "Not a developer");
    modifySpotFleetRequest(newcount);
  }
});
