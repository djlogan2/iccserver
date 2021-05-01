import { Mongo } from "meteor/mongo";
import AWS from "aws-sdk";
import { EventEmitter } from "events";
import { Meteor } from "meteor/meteor";
import { Users } from "../../imports/collections/users";
//import { check } from "meteor/check";
//import { Logger } from "../../lib/server/Logger";
import { Picker } from "meteor/meteorhacks:picker";
//import { HTTP } from "meteor/http";
//import ssh2 from "ssh2";

//const log = new Logger("server/AnalysisEngine_js");
const log = { debug: msg => console.log("D: " + msg), error: msg => console.log("E: " + msg) };

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
  const record = AnalysisEngines.instance_collection.findOne({ instance_id: instance_id });
  if (!!record) AnalysisEngines.setStatus(record._id, "interrupted");
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
      status = "needs_check";
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
  AnalysisEngines.setStatus(record._id, status);
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
  return new Promise((resolve, reject) => {
    log.debug("describeInstances");
    if (!instance_ids || !instance_ids.length) return;
    this.ec2.describeInstances({ InstanceIds: instance_ids }, (err, data) => {
      log.debug("describeInstances callback");
      if (err) {
        log.error("Unable to describeInstance", err);
        reject(err);
        return;
      }
      // Create an array of instances from this
      const instances = [];
      data.Reservations.forEach(r =>
        r.Instances.forEach(i =>
          instances.push({ instance_id: i.InstanceId, aws_instance: i, status: i.State.Name })
        )
      );
      resolve(instances);
    });
  });
};

AnalysisEngines.describeSpotFleetInstances = function() {
  return new Promise((resolve, reject) => {
    log.debug("describeSpotFleetInstances");
    this.ec2.describeSpotFleetInstances({ SpotFleetRequestId: this.spot_fleet_id }, (err, data) => {
      if (err) {
        log.error("describeSpotFleetInstances error", err);
        reject(err);
        return;
      }
      if (!data) {
        log.error("No data");
        reject(new Error("No data"));
        return;
      }
      const instances = [];
      data.ActiveInstances.forEach(ai => {
        instances.push({ instance_id: ai.InstanceId, spot_fleet_instance: ai, status: "spot" });
      });
      resolve(instances);
    });
  });
};

AnalysisEngines.modifySpotFleetRequest = function(newcount) {
  return new Promise((resolve, reject) => {
    log.debug("modifySpotFleetRequest newcount=" + newcount);
    this.ec2.modifySpotFleetRequest(
      {
        SpotFleetRequestId: this.spot_fleet_id,
        TargetCapacity: newcount
      },
      (err, result) => {
        if (!!err) {
          log.error("modifySpotFleetRequest error", err);
          reject(err);
        } else resolve(result);
      }
    );
  });
};

AnalysisEngines.terminateInstances = function(instance_ids, newcount) {
  return new Promise((resolve, reject) => {
    log.debug("terminateInstances");
    this.ec2.terminateInstances({ InstanceIds: instance_ids }, (err, data) => {
      if (!!err) {
        log.error("terminateInstances error", err);
        reject(err);
      } else resolve(data);
    });
  });
};

AnalysisEngines.cancelSpotInstanceRequests = function(
  spot_instance_request_ids,
  instance_ids,
  newcount
) {
  return new Promise((resolve, reject) => {
    log.debug("cancelSpotInstanceRequests");
    this.ec2.cancelSpotInstanceRequests(
      { SpotInstanceRequestIds: spot_instance_request_ids },
      (err, data) => {
        log.debug("cancelSpotInstanceRequests callback");
        if (!!err) {
          log.error("cancelSpotInstanceRequests error", err);
          reject(err);
        } else resolve(data);
      }
    );
  });
};
//*****************************************************************************
//** Promisify EVERY meteor collection call                                  **
//*****************************************************************************
AnalysisEngines.insertInstanceRecords = function(record_array) {
  return Promise.all(
    record_array.map(record => {
      return new Promise((resolve, reject) => {
        this.instance_collection.insert(record, (error, result) => {
          if (!!error) reject(error);
          else resolve(result);
        });
      });
    })
  );
};

AnalysisEngines.updateInstance = function(selector, modifier) {
  return new Promise((resolve, reject) => {
    this.instance_collection.update(selector, modifier, err => {
      if (!!err) reject(err);
      else resolve();
    });
  });
};

AnalysisEngines.removeInstanceRecords = function(selector) {
  return new Promise((resolve, reject) => {
    this.instance_collection.remove(selector, err => {
      if (!!err) reject(err);
      else resolve();
    });
  });
};

AnalysisEngines.updateEngine = function(selector, modifier) {
  return new Promise((resolve, reject) => {
    this.engine_collection.update(selector, modifier, (err, result) => {
      if (!!err) reject(err);
      else resolve(result);
    });
  });
};

AnalysisEngines.removeEngineRecords = function(selector) {
  return new Promise((resolve, reject) => {
    this.engine_collection.remove(selector, (err, result) => {
      if (!!err) reject(err);
      else resolve(result);
    });
  });
};
//*****************************************************************************
//** Load the initial instances and engines                                  **
//*****************************************************************************
// instances in database
//   AWS       DB
//   pending   no  - Add as "pending"
//   pending   yes - No action
//   running   no  - Add as "needs checking"
//   running   yes - No action
//   --no--    yes - Delete
//
//   Instances in database vs engines in database
//   Instance       Engine   Allocated
//         no           yes         no   - delete
//         no           yes         yes  - Move to another engine, then delete
//        yes           no          no   - Set instance to "needs_checking"
//        yes           yes         no   - No action
//        yes           yes         yes  - No action
//
// engines in database - any allocated ones have to be moved, otherwise delete old ones,
AnalysisEngines._initialEngineLoad = async function() {
  const instances = this.instance_collection.find().fetch();
  const all_instance_ids = instances.map(r => r.instance_id);
  const defunct_engines = this.engine_collection
    .find({ intance_id: { $nin: all_instance_ids } })
    .fetch();

  defunct_engines.forEach(eng => {
    if (eng.status !== "waiting")
      promises.push(
        this.moveFailingEngine(eng).then(() => this.removeEngineRecords({ _id: eng._id }))
      );
    else promises.push(this.removeEngineRecords({ _id: eng._id }));
  });

  instances.forEach(ndi => {
    if (!this.engine_collection.find({ instance_id: ndi._id }).count())
      promises.push(this.checkAndInstallStockfish(ndi));
  });

  await Promise.all(promises);
};

AnalysisEngines._initialInstanceLoad = async function() {
  //{"InstanceId": "uCcARPanpkQQNjnL7", "SpotInstanceRequestId": "6FGPP9ZfPn5uswccG"}
  const spot_instances = await this.describeSpotFleetInstances();
  //{"InstanceId": "uCcARPanpkQQNjnL7", "PublicIpAddress": "1.2.3.0", "State": {"Name": "pending"}, "SpotInstanceRequestId": "6FGPP9ZfPn5uswccG"}
  const aws_instances = await this.describeInstances(spot_instances);
  const db_instances = this.instance_collection
    .find({}, { fields: { instance_id: 1 } })
    .fetch()
    .map(r => r.instance_id);
  const promises = [];
  aws_instances.forEach(awsi => {
    const aws_state = awsi.State.Name;
    const indb = db_instances.indexOf(awsi.InstanceId) !== -1;
    const sfi = spot_instances.filter(si => si.InstanceId === awsi.InstanceId)[0];
    if (aws_state === "pending" && !indb)
      promises.push(
        this.insertInstanceRecords({
          instance_id: awsi.InstanceId,
          status: awsi.State.Name,
          aws_instance: awsi,
          spot_fleet_instance: sfi
        })
      );
    else if (aws_state === "running" && !indb)
      promises.push(
        this.insertInstanceRecords({
          instance_id: awsi.InstanceId,
          status: awsi.State.Name,
          aws_instance: awsi,
          spot_fleet_instance: sfi
        }).then(() => this.checkIfStockfishInstalled(awsi.InstanceId))
      );
  });
  const not_defunct_instances = db_instances.filter(dbi =>
    spot_instances.some(si => si.InstanceId === dbi.instance_id)
  );
  promises.push(this.removeInstanceRecords({ instance_id: { $nin: not_defunct_instances } }));
  await Promise.all(promises);
}

AnalysisEngines.initialInstanceLoad = async function() {
  await this._initialInstanceLoad();
  await this._initialEngineLoad();
};

AnalysisEngines.moveFailingEngine = async function(engine) {
};

AnalysisEngines.checkAndInstallStockfish = function(instance) {
}

AnalysisEngines.checkIfStockfishInstalled = function(instance) {
}
AnalysisEngines.setAllocateRemoteEngine = function(engine, ourid) {

}

AnalysisEngines.allocateEngine = async function(ourid) {
  const engine = this.engine_collection.findOne({ status: "busy" });
  if (!engine) {
    await this.setAllocateRemoteEngine(engine, ourid);
    await this.updateEngine({ _id: engine._id }, { $set: { ourid: ourid, status: "busy" } });
    return engine;
  }
};
