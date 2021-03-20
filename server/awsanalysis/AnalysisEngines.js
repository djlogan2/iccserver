import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { EventEmitter } from "events";
import { Logger } from "../../lib/server/Logger";
import { Picker } from "meteor/meteorhacks:picker";
import { Mongo } from "meteor/mongo";
import AWS from "aws-sdk";
import { HTTP } from "meteor/http";
import ssh2 from "ssh2";
import { Users } from "../../imports/collections/users";

const log = new Logger("server/AnalysisEngine_js");
//const log = { debug: msg => console.log("D: " + msg), error: msg => console.log("E: " + msg) };

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
//   needs_engine_load - Should be installed and ready to load engine data
//   loading_engines - Getting information on all of the engines
//   ready - Ready to go!
//   interrupted - AWS has notified us that the instance is going to go away
//   terminating - We have asked AWS to terminate this instance
//   stopping - AWS has notified us that the instance is stopping, but it isn't gone yet
//

const DOWN_STATUSES = ["interrupted", "termination_delay", "terminating", "stopping", "terminated"];

export const AnalysisEngines = {
  instance_collection: new Mongo.Collection("aws_stockfish_instances"),
  engine_collection: new Mongo.Collection("aws_stockfish_engines"),
  my_ip: process.env.MY_IP_ADDRESS,
  my_port: process.env.MY_PORT,
  spot_fleet_id: "sfr-f70183ef-0954-44dc-83d5-53c10d83067e",
  ec2: new AWS.EC2(),
  sns: new AWS.SNS(),
  sns_topic: {},
  engine_promises: {},
  intervalWait: 60000,
  events: new EventEmitter(),
  waiting_allocations: [],
  allocation_requested: 0
};

process.on("uncaughtException", function(err) {
  log.error("uncaughtException", err);
  debugger;
});

process.on("unhandledRejection", error => {
  log.error("unhandledRejection", error);
  debugger;
});

Meteor.publishComposite("developer_analysis_engines", {
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return AnalysisEngines.instance_collection.find();
      }
    },
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return AnalysisEngines.engine_collection.find();
      }
    }
  ]
});

//*****************************************************************************
//**    These are the methods that get called when spot instances change     **
//*****************************************************************************
AnalysisEngines.spotInterruption = Meteor.bindEnvironment((action, instance_id) => {
  AnalysisEngines.events.emit("spotInterruption", action, instance_id);
  // action can be "hibernate", "stop", or "terminate"
  log.debug("::spotInterruption action=" + action + ", instance_id=" + instance_id);
  AnalysisEngines.instance_collection.update(
    { instance_id: instance_id },
    { $set: { status: "interrupted" } }
  );
});

AnalysisEngines.instanceChanged = function(state, instance_id) {
  AnalysisEngines.events.emit("instanceChanged", state, instance_id);
  log.debug("instanceChanged state=" + state + ", intance_id=" + instance_id);
  // Called by SNS when an instance is started or stopped (or any other state)
  // The possible states:
  // pending, running, shutting-down, stopped, stopping, terminated
  const record = AnalysisEngines.instance_collection.findOne({ instance_id: instance_id });
  if (!record) {
    AnalysisEngines.getInitialInstanceState();
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
  AnalysisEngines.instance_collection.update({ _id: record._id }, { $set: { status: status } });
};

//*****************************************************************************
//** Set up the subscriptions to be notified by AWS if we are losing a spot  **
//** instance                                                                **
//*****************************************************************************
AnalysisEngines.setupSNS = function() {
  log.debug("setupSNS");
  this.getOurTopics().then(() => {
    this.initiateEndpoint("InstanceChanged", "/aws_instance_changed");
    this.initiateEndpoint("SpotWarning", "/aws_spot_interruption");
  });
};

AnalysisEngines.getOurTopics = function() {
  return new Promise((resolve, reject) => {
    const params = {};
    this.sns.listTopics(
      params,
      Meteor.bindEnvironment((err, data) => {
        if (err) reject();
        data.Topics.forEach(topic => {
          const arn = topic.TopicArn;
          const pieces = arn.split(":");
          const name = pieces[pieces.length - 1];
          this.sns_topic[name] = arn;
        });
        resolve();
      })
    );
  });
};

AnalysisEngines.initiateEndpoint = function(sns_topic_key, path) {
  log.debug("initiateEndpoint");
  var params = {
    Protocol: "http",
    TopicArn: this.sns_topic[sns_topic_key],
    Endpoint: "http://" + this.my_ip + ":" + this.my_port + path,
    ReturnSubscriptionArn: true
  };
  this.sns.subscribe(params, err => {
    if (err) log.error("Error subscribing to " + this.sns_topic + ": " + err.toString());
  });
};

AnalysisEngines.confirmSubscription = function(sns_topic_key, token) {
  log.debug("confirmSubscription");
  this.sns.confirmSubscription({ TopicArn: this.sns_topic[sns_topic_key], Token: token }, err => {
    if (err) log.error("Error confirming subscription to " + sns_topic_key + ": " + err.toString());
  });
};

Picker.route("/aws_instance_changed", function(params, req, res) {
  log.debug("/aws_instance_changed");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on(
    "end",
    Meteor.bindEnvironment(() => {
      const payload = JSON.parse(post_data);
      if (payload.Type === "SubscriptionConfirmation") {
        AnalysisEngines.confirmSubscription("InstanceChanged", payload.Token);
      } else {
        const message = JSON.parse(payload.Message);
        AnalysisEngines.instanceChanged(message.detail["state"], message.detail["instance-id"]);
      }
      res.end("ok");
    })
  );
});

Picker.route("/aws_spot_interruption", function(params, req, res) {
  log.debug("/aws_spot_interruption");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      AnalysisEngines.confirmSubscription("SpotWarning", payload.Token);
    } else {
      const message = JSON.parse(payload.Message);
      AnalysisEngines.spotInterruption(
        message.detail["instance-action"],
        message.detail["instance-id"]
      );
    }
    res.end("ok");
  });
});

//*****************************************************************************
//** These are the AWS routines to obtain info and modify the spot instances **
//*****************************************************************************

AnalysisEngines.describeInstances = function(instance_ids) {
  log.debug("describeInstances");
  if (!instance_ids || !instance_ids.length) return;
  this.ec2.describeInstances(
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
          this.instance_collection.update(
            { instance_id: i.InstanceId },
            { $set: { aws_instance: i, status: status } }
          );
        });
      });
    })
  );
};

AnalysisEngines.getInitialInstanceState = function() {
  log.debug("getInitialInstanceState");
  this.ec2.describeSpotFleetInstances(
    { SpotFleetRequestId: this.spot_fleet_id },
    Meteor.bindEnvironment((err, data) => {
      log.debug("getInitialInstanceState callback");
      const instance_ids = [];
      if (err) log.error(err);
      if (!data) return;
      data.ActiveInstances.forEach(ai => {
        instance_ids.push(ai.InstanceId);
        this.instance_collection.upsert(
          { instance_id: ai.InstanceId },
          { $set: { spot_fleet_instance: ai }, $setOnInsert: { status: "spot" } }
        );
      });
      this.instance_collection.remove({ instance_id: { $nin: instance_ids } });
      this.engine_collection.remove({ instance_id: { $nin: instance_ids } });
      this.describeInstances(instance_ids);
    })
  );
};

AnalysisEngines.modifySpotFleetRequest = function(newcount) {
  log.debug("modifySpotFleetRequest");
  this.ec2
    .modifySpotFleetRequest({
      SpotFleetRequestId: this.spot_fleet_id,
      TargetCapacity: newcount
    })
    .promise();
};

AnalysisEngines.terminateInstances = function(instance_ids, newcount) {
  log.debug("terminateInstances");
  this.ec2.terminateInstances(
    { InstanceIds: instance_ids },
    Meteor.bindEnvironment((err, data) => {
      this.modifySpotFleetRequest(newcount);
    })
  );
};

AnalysisEngines.cancelSpotInstanceRequests = function(
  spot_instance_request_ids,
  instance_ids,
  newcount
) {
  log.debug("cancelSpotInstanceRequests");
  this.ec2.cancelSpotInstanceRequests(
    { SpotInstanceRequestIds: spot_instance_request_ids },
    Meteor.bindEnvironment((err, data) => {
      log.debug("cancelSpotInstanceRequests callback");
      if (!!err) log.error("Error in cancelSpotInstanceRequest: " + err);
      this.terminateInstances(instance_ids, newcount);
    })
  );
};

AnalysisEngines.removeInstances = function(instanceArray) {
  log.debug("removeInstances " + JSON.stringify(instanceArray));
  const count = this.instance_collection.find({}).count();
  const spot_instance_request_ids = [];
  const instance_ids = [];
  this.instance_collection.find({ _id: { $in: instanceArray } }).forEach(rec => {
    spot_instance_request_ids.push(rec.spot_fleet_instance.SpotInstanceRequestId);
    instance_ids.push(rec.aws_instance.InstanceId);
  });
  const newcount = count - spot_instance_request_ids.length;
  this.cancelSpotInstanceRequests(spot_instance_request_ids, instance_ids, newcount);
};

AnalysisEngines.getInstallationStatusFromInstance = function(record) {
  log.debug("getInstallationStatusFromInstance instance=" + record._id);
  return new Promise((resolve, reject) => {
    this.httpGet(record, "/ok")
      .then(response => {
        log.debug("getInstallationStatusFromInstance resolving 'running'");
        resolve("running");
      })
      .catch(error => {
        log.debug("getInstallationStatusFromInstance error=" + error.message);
        if (error.errno === "ECONNREFUSED") {
          log.debug("getInstallationStatusFromInstance returning 'refused'");
          resolve("refused");
        } else {
          log.error("getInstallationStatusFromInstance rejecting on error=" + error.message);
          reject(error);
        }
      });
  });
};

AnalysisEngines.checkInstanceInstallationStatus = function(record) {
  log.debug("checkInstanceInstallationStatus instance=" + record._id);
  this.instance_collection.update(
    { _id: record._id },
    { $set: { status: "checking", check_count: (record.check_count || 0) + 1 } }
  );

  return this.getInstallationStatusFromInstance(record)
    .then(instance_status => {
      log.debug(
        "checkInstanceInstallationStatus promise return from getInstallationStatusFromInstance, instance_status=" +
          instance_status
      );
      if (instance_status === "running") {
        this.instance_collection.update(
          { _id: record._id },
          { $set: { status: "needs_engine_load" }, $unset: { check_count: 1 } }
        );
      } else if (instance_status === "refused") {
        this.instance_collection.update({ _id: record._id }, { $set: { status: "needs_install" } });
      } else {
        log.error("Check returned unknown status: " + instance_status);
        this.instance_collection.update({ _id: record._id }, { $set: { status: "check_failed" } });
      }
    })
    .catch(error => {
      log.error("getInstallationStatusFromInstance error=" + error.message);
      this.instance_collection.update({ _id: record._id }, { $set: { status: "check_failed" } });
    });
};

AnalysisEngines.sshReadyFunction = function(sshConn) {
  log.debug("sshReadyFunction");
  return new Promise((resolve, reject) => {
    try {
      sshConn.exec(
        "curl -sL https://raw.githubusercontent.com/djlogan2/stockfish2/master/install.sh | sudo /bin/bash ; exit",
        (err, stream) => {
          if (err) {
            reject(err);
            return;
          }
          stream
            .on("close", () => {
              log.debug("Closing ssh from stockfish install");
              sshConn.end();
              resolve();
            })
            .on("data", data => {
              // Just ignore this
              log.debug("ssh stockfish install stdout: " + data);
            })
            .stderr.on("data", data => {
              // Just ignore this too
              log.debug("ssh stockfish install STDERR: " + data);
            });
        }
      );
    } catch (e) {
      log.error("ssh stockfish install ssh exec failed: " + e);
      reject(e);
    }
  });
};

AnalysisEngines.getSSHClient = function() {
  return new ssh2.Client.Client();
};

AnalysisEngines.installStockfish = function(record) {
  const self = this;
  log.debug("installStockfish");
  this.instance_collection.update(
    { _id: record._id },
    { $set: { status: "installing", install_count: (record.install_count || 0) + 1 } }
  );
  const sshConn = this.getSSHClient();
  const creds = {
    host: record.aws_instance.PublicIpAddress,
    port: 22,
    username: "ubuntu",
    privateKey: require("fs").readFileSync("/Users/davidlogan/.ssh/id_rsa")
  };
  sshConn.on("ready", () =>
    self
      .sshReadyFunction(sshConn)
      .then(() => {
        log.debug("installStockfish promise return");
        this.instance_collection.update(
          { _id: record._id },
          { $set: { status: "installed" }, $unset: { install_count: 1 } }
        );
      })
      .catch(() => {
        log.debug("installStockfish promise reject");
        this.instance_collection.update(
          { _id: record._id },
          { $set: { status: "install_failed" } }
        );
      })
  );
  sshConn.on("error", err => {
    log.error(
      "installStockfish unable to connect to instance " +
        record.instance_id +
        ", err=" +
        err.message
    );
    this.instance_collection.update({ _id: record._id }, { $set: { status: "install_failed" } });
  });
  sshConn.connect(creds);
};

AnalysisEngines.httpGet = function(record, endpoint) {
  log.debug("httpGet instance=" + record._id + ", endpoint=" + endpoint);
  return new Promise((resolve, reject) => {
    // Could be an instance or an engine
    const ip_address = !!record.aws_instance
      ? record.aws_instance.PublicIpAddress
      : record.ip_address;
    const url = "http://" + ip_address + endpoint;
    HTTP.call("GET", url, (error, response) => {
      if (!!error) reject(error);
      else resolve();
    });
  });
};

AnalysisEngines.load3 = function(engine) {
  log.debug("load3 engine=" + engine._id);
  if (!this.waiting_allocations.length) return Promise.resolve();
  return new Promise((resolve1, reject) => {
    const resolve2 = this.waiting_allocations.shift();
    this.allocateEngineInstance(engine, resolve2.ourid)
      .then(engine_id => {
        log.debug("Sending a free engine to a one of our wait-ors. id=" + engine_id);
        resolve2.resolve(engine_id);
        resolve1();
      })
      .catch(error => {
        log.error("Unable to allocate engine instance " + engine._id + " : " + error.message);
        this.waiting_allocations.unshift(resolve2);
        reject(error);
      });
  });
};

AnalysisEngines.load2 = function(record, engine) {
  log.debug("load2 instance=" + record._id + ", engine=" + engine.id);
  return new Promise((resolve, reject) => {
    const selector = { instance_id: record.instance_id, engine_id: engine.id };
    delete engine.id;
    engine.ip_address = record.aws_instance.PublicIpAddress;
    engine.when = new Date();
    this.engine_collection.upsert(selector, { $set: engine }, (error, result) => {
      if (!!error) {
        reject(error);
        return;
      }
      engine = this.engine_collection.findOne(selector);
      this.load3(engine)
        .then(resolve)
        .catch(reject);
    });
  });
};

AnalysisEngines.load_engines = function(record) {
  log.debug("load_engines instance=" + record._id);
  this.instance_collection.update({ _id: record._id }, { $set: { status: "loading_engines" } });
  this.httpGet(record, "/engines")
    .then(instresp => {
      if (!!instresp.content) instresp.content = JSON.parse(instresp.content);
      if (instresp.content.status !== "success") {
        this.instance_collection.update(
          { _id: record._id },
          { $set: { status: "engine_load_failed" } }
        );
        log.error("Engine load failed");
        return;
      }
      const promises = instresp.content.engines.map(engine => this.load2(record, engine));
      return Promise.all(promises);
    })
    .then(() => {
      this.instance_collection.update(
        { _id: record._id },
        { $set: { status: "ready" } },
        (error, result) => this.events.emit("instanceReady", record._id, error, result)
      );
      if (!!this.allocation_requested) this.allocation_requested--;
    })
    .catch(error => {
      this.instance_collection.update(
        { _id: record._id },
        { $set: { status: "engine_load_failed" } }
      );
      log.error("Engine load failed: " + error.message);
    });
};
//*****************************************************************************
//** ???   **
//*****************************************************************************
Picker.route("/analysis/:engine_id", function(params, req, res) {
  log.debug("analysis callback from engine");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    log.debug("analysis callback from engine, payload=" + payload);
    res.end("ok");
    // {engine_id: xxx, our_id: yyy, command: aaa, response: bbb}
    const record = this.engine_collection.findOne({
      _id: payload.engine_id,
      our_id: payload.our_id
    });
    const promise = this.engine_promises[payload.engine_id];
    if (!promise) {
      log.error("Unable to find a promise for: " + JSON.stringify(payload));
      return;
    } else delete this.engine_promises[payload.engine_id];
    if (!record) {
      promise.reject(
        new Error(
          "Unable to successfully execute " + payload.command,
          "Unable to find engine record for this request"
        )
      );
    } else if (record.status !== payload.command) {
      promise.reject(
        new Error(
          "Unable to successfully execute " + payload.command,
          "Database record shows command " + record.status + ", engine returned " + payload.command
        )
      );
    } else {
      promise.resolve(payload.response);
      AnalysisEngines.engine_collection.update(
        { _id: payload.engine_id },
        { $set: { status: "busy" } }
      );
    }
  });
});

AnalysisEngines.allocateEngineInstance = function(engine, ourid) {
  log.debug("allocateEngineInstance engine=" + engine._id + ", ourid=" + ourid);
  return new Promise((resolve, reject) => {
    this.httpGet(
      engine,
      "/start/" +
        engine.engine_id +
        "/" +
        ourid +
        "?callback=" +
        encodeURI("http://" + this.my_ip + ":" + this.my_port + "/analysis/" + engine.engine_id)
    )
      .then(response => {
        if (response?.status !== "success") {
          log.error(
            "Failure allocating engine instance, engine=" +
              engine._id +
              ", ourid=" +
              ourid +
              ", error=" +
              JSON.stringify(response)
          );
          reject(
            new Error(
              "Engine allocation failed",
              "No response, or status, or status is not success"
            )
          );
          return;
        }
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "busy", when: new Date(), ourid: ourid } },
          (error, result) => {
            if (!!error) reject(error);
            else resolve(engine._id);
          }
        );
      })
      .catch(reject);
  });
};

AnalysisEngines.freeEngineInstance = function(engine) {
  log.debug("freeEngineInstance engine=" + engine._id);
  return new Promise((resolve, reject) => {
    this.httpGet(engine, "/end/" + engine.engine_id + " / " + engine.ourid)
      .then(response => {
        if (response?.status === "success") {
          reject(
            new Error("Engine free failed", "No response, or status, or status is not success")
          );
          return;
        }
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "free", when: new Date() }, $unset: { ourid: 1 } }
        );
        resolve();
      })
      .catch(reject);
  });
};

AnalysisEngines.allocateEngine = function(ourid) {
  log.debug("allocateEngine " + ourid);
  //
  // Make sure we continue to use the same instances as much as possible
  // Not really even so concerned about the most recently used engine, but hey, why not
  return new Promise((resolve, reject) => {
    const engine = this.engine_collection.findOne(
      { status: "waiting" },
      { sort: [["instance_id", "asc"], ["when", "desc"]] }
    );

    if (!!engine) {
      log.debug("Found an engine to return");
      this.allocateEngineInstance(engine, ourid)
        .then(resolve)
        .catch(reject);
      return;
    }

    log.debug("Have to wait for a new instance");
    this.waiting_allocations.push({ resolve: resolve, reject: reject, ourid: ourid });

    const required_instances = Math.ceil(this.waiting_allocations.length / 8);
    if (this.allocation_requested < required_instances) {
      this.allocation_requested = required_instances;
      const newcount =
        this.instance_collection.find({ status: { $nin: DOWN_STATUSES } }).count() +
        required_instances;
      log.debug("Requesting new instance count of " + newcount);
      this.modifySpotFleetRequest(newcount);
    }
  });
};

AnalysisEngines.freeEngine = function(engine) {
  this.freeEngineInstance(engine)
    .then(() => {
      if (!!this.waiting_allocations.length) {
        const resolve = this.waiting_allocations.shift();
        this.allocateEngineInstance(engine, resolve.ourid)
          .then(() => resolve.resolve())
          .catch(error => {
            log.error("Unable to free engine: " + error.message);
            resolve.resolve();
          });
      }
    })
    .catch(error => {
      log.error("What to do about this engine free failure: " + error.message);
    });
};

AnalysisEngines.startNewGame = function(engine) {
  return new Promise((resolve, reject) => {
    this.httpGet(engine, "/startnewgame/" + engine.engine_id + "/" + engine.ourid)
      .then(response => {
        if (response?.status === "success") {
          reject(
            new Error("Engine free failed", "No response, or status, or status is not success")
          );
          return;
        }
        this.engine_promises[engine._id] = {
          resolve: resolve,
          reject: reject
        };
        this.engine_collection.update(
          { _id: engine._id },
          { $set: { status: "startnewgame", when: new Date() }, $unset: { ourid: 1 } }
        );
      })
      .catch(reject);
  });
};

AnalysisEngines.analysisPositionForever = function(engine, fen) {
  // ucinewgame
  // setoption MultiPV 4
  // setoption Threads 4
  // position [fen]
  // goinfinite
  //       await engines[engine_id].ucinewgame();
  //       await engines[engine_id].setoption("MultiPV", 4);
  //       await engines[engine_id].setoption("Threads", threads);
  //       await engines[engine_id].position(fen);
  //       engines[engine_id].goInfinite();
};

AnalysisEngines.analysisPositionForMillis = function(engine, fen, millis) {};

AnalysisEngines.handleStatus = function(id, status) {
  log.debug("handleStatus instance=" + id + ", status=" + status);
  const record = this.instance_collection.findOne({ _id: id });
  let interval;
  log.debug("Instance " + id + " in status " + status + " is being transitioned");
  switch (status) {
    case "starting":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "active":
      this.checkInstanceInstallationStatus(record);
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
        this.checkInstanceInstallationStatus(record);
      }, this.intervalWait);
      //removeInstances([id]);
      break;
    case "needs_install":
      this.installStockfish(record);
      break;
    case "installing":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "installed":
      this.checkInstanceInstallationStatus(record);
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
        this.installStockfish(record);
      }, this.intervalWait);
      break;
    case "needs_engine_load":
      this.load_engines(record);
      break;
    case "engine_load_failed":
      this.installStockfish(record);
      break;
    case "loading_engines":
      break;
    case "ready":
      log.error("Handle status " + status + " or get rid of this case statement");
      break;
    case "interrupted":
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
};

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    AnalysisEngines.setupSNS();
    AnalysisEngines.getInitialInstanceState();
  }
  AnalysisEngines.observeChangesHandle = AnalysisEngines.instance_collection.find().observeChanges({
    added(id, fields) {
      log.debug("observeChanges added id=" + id + ", status=" + fields.status);
      AnalysisEngines.handleStatus(id, fields.status);
    },
    changed(id, fields) {
      log.debug("observeChanges changed id=" + id + ", status=" + fields.status);
      if ("status" in fields) {
        AnalysisEngines.handleStatus(id, fields.status);
      }
    }
  });
});

Meteor.methods({
  developer_allocateengine: () => {
    check(Meteor.user(), Object);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to allocate an engine", "Not a developer");
    return AnalysisEngines.allocateEngine(Meteor.userId()).catch(error => err => log.error(err));
  },
  developer_freeEngine: engine_id => {
    check(Meteor.user(), Object);
    check(engine_id, String);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to free an engine", "Not a developer");
    AnalysisEngines.freeEngine(engine_id);
  },
  developer_removeInstance: id => {
    check(Meteor.user(), Object);
    check(id, String);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to modify fleet request", "Not a developer");
    AnalysisEngines.removeInstances([id]);
  },
  developer_modifySpotFleetRequest: newcount => {
    check(Meteor.user(), Object);
    check(newcount, Number);
    if (!Users.isAuthorized(Meteor.user(), "developer"))
      throw new Error("Unable to modify fleet request", "Not a developer");
    AnalysisEngines.modifySpotFleetRequest(newcount);
  }
});
