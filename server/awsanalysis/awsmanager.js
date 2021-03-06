import { Mongo } from "meteor/mongo";
import { HTTP } from "meteor/http";
import { Picker } from "meteor/meteorhacks:picker";
import AWS from "aws-sdk";
import { Logger } from "../../lib/server/Logger";
import ssh2 from "ssh2";
import { Meteor } from "meteor/meteor";
import { Singular } from "../singular";

const log = new Logger("server/awsmanager_js");
// eslint-disable-next-line no-unused-vars

if (!!process.env.AWS_SPOT_FLEET_ID && !process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

// This has to be global because we are going to pass engines to other people,
// and we need control over them when AWS makes changes
const engine_connectors = {};

class Awsmanager {
  constructor() {
    meteordebug("Awsmanager::constructor");
    this.collection = new Mongo.Collection("aws_stockfish_instances");
    this.my_ip = process.env.MY_IP_ADDRESS;
    this.my_port = process.env.MY_PORT;
    this.spot_fleet_id = "aws:ec2spot:fleet-request-id";
    this.ec2 = new AWS.EC2();
    this.sns = new AWS.SNS();
    Meteor.startup(() => {
      Singular.addTask(() => {
        this.setupSNS();
        this.getCurrentInstances();
        this.watchUsersAndGames();
      });
    });
  }


  getCurrentInstances() {
    meteordebug("Awsmanager::getCurrentInstances");
    Meteor.startup(() => {
      meteordebug("Awsmanager::getCurrentInstances/1");
      this.ec2.describeSpotFleetInstances(
        { SpotFleetRequestId: this.spot_fleet_id },
        (err, data) => {
          const instance_ids = [];
          data.ActiveInstances.forEach(ai => {
            instance_ids.push(ai.InstanceId);
            this.collection.upsert(
              { instance_id: ai.InstanceId },
              {
                $set: {
                  instance_health: ai.InstanceHealth,
                  instance_type: ai.InstanceType,
                  spot_instance_request_id: ai.SpotInstanceRequestId
                }
              }
            );
          });
          this.collection.remove({instance_id: {$nin: instance_ids}});
          //---
          this.ec2.describeInstances(
            {InstanceIds: instance_ids},
            Meteor.bindEnvironment((err, data) => {
              if (err) {
                meteorerror("Unable to describeInstances, err=" + err.toString());
                return;
              }
              // Create an array of instances from this
              data.Reservations.forEach(r => {
                r.Instances.forEach(i => {
                  ...
                    if (this.collection.find({ InstanceId: i.InstanceId }).count() === 0) {
                      const awsi = new AWSInstance(this.collection, i);
                      awsi.check();
                    }
                });
              });
            })
          );
          //---
        }
      );
    });
  }

  instanceChanged(state, instance_id) {
    meteordebug("Awsmanager::instanceChanged state=" + state + ", instance_id=" + instance_id);
    // Called by SNS when an instance is started or stopped (or any other state)
    // The possible states:
    // pending, running, shutting-down, stopped, stopping, terminated
    // if it's in shutting-down, stopping, stopped, or terminated, call instanceStopped()
    // if it's in running, call instanceStarted()
  }

  instanceStarted() {
    meteordebug("Awsmanager::instanceStarted");
    // If it's not in the list, add it.
  }

  spotInstanceWarning(action, instance_id) {
    meteordebug(
      "Awsmanager::spotInstanceWarning action=" + action + ", instance_id=" + instance_id
    );
    // Remove the instance from contention
    // If there are any engines in use, move them all to other instances
    //    Both the above removal, and the moving of these engines to other
    //    instances should trigger new instance builds (as is in getEngine)
    //    if we are now low on waiting engines.
  }

  instanceStopped() {
    meteordebug("Awsmanager::instanceStopped");
    // If it's in the list, remove it
    // If there are any any engines active, move them, exactly like "spotInstanceWarning"
  }

  changeInstanceCount(count) {
    meteordebug("Awsmanager::changeInstanceCount");
    this.ec2
      .modifySpotFleetRequest({
        SpotFleetRequestId: this.spot_fleet_id,
        TargetCapacity: count
      })
      .promise();
  }

  getEngine(game_id) {
    meteordebug("Awsmanager::getEngine");

    //
    // If the game already has an engine, return that
    //
    if (!!engine_connectors[game_id]) return engine_connectors[game_id];

    //
    // Find the instance with the fewest number of open slots
    //
    const instance = this.collection.findOne(
      { icc_instance_state: "running", running_engines: { $gt: 0 } },
      { sort: { running_engines: -1 } }
    );

    //
    // If we have an instance that qualifies, use that
    //
    if (!!instance) {
      const engine = new AWSInstance(this.collection, instance).getEngine(game_id);
      engine_connectors[game_id] = engine;
      return engine;
    }

    //
    // At this point, we have to fire up new instance, and/or wait for one that's
    // currently being fired up

    return this.newOrCreatingInstance().getEngine(game_id);
  }

  newOrCreatingInstance() {}

  releaseEngine(game_id) {
    meteordebug("Awsmanager::releaseEngine");
  }
}

if (!!process.env.AWS_SPOT_FLEET_ID && !global._awsObject) {
  meteordebug("Create global Awsmanager");
  global._awsObject = new Awsmanager();
}

const confirmSubscriptionCallback = Meteor.bindEnvironment((sns_topic, token) => {
  meteordebug("::confirmSubscriptionCallback");
  global._awsObject.confirmSubscription(sns_topic, token);
});

const spotInterruption = Meteor.bindEnvironment((action, instance_id) => {
  meteordebug("::spotInterruption action=" + action + ", instance_id=" + instance_id);
  global._awsObject.spotInstanceWarning(action, instance_id);
});

const instanceChanged = Meteor.bindEnvironment((state, instance_id) => {
  meteordebug("::instanceChanged state=" + state + ", intance_id=" + instance_id);
  global._awsObject.instanceChanged(state, instance_id);
});

class AWSInstance {
  constructor(collection, instance) {
    this.collection = collection;
    this.instance = instance;
    this.instance.icc_instance_state = "check";
    this.instance.running_engines = 0;
    if (!this.instance._id) {
      this.instance._id = this.collection.insert(this.instance);
      for (let x = 0; x < 8; x++) {
        const engine = new AWSEngine(this);
      }
    }
    this.sshReadyFunction = Meteor.bindEnvironment(done => this._sshReadyFunction(done));
  }

  setstatus(status) {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::setstatus " + status);
    this.instance.icc_instance_state = status;
    this.collection.update({ _id: this.id }, { $set: { icc_instance_state: status } });
  }

  check_get() {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::check_get");
    return new Promise((resolve, reject) => {
      const url = "http://" + this.instance.PublicIpAddress + "/ok";
      HTTP.get(url, {}, async (error, result) => {
        if (error) {
          if (error.errno === "ECONNREFUSED") {
            meteordebug("AWSInstance(" + this.instance.InstanceId + ")::check_get ECONNREFUSED");
            resolve("setup");
          } else {
            meteordebug(
              "AWSInstance(" + this.instance.InstanceId + ")::check_get failed " + error.errno
            );
            throw error;
          }
        } else {
          meteordebug("AWSInstance(" + this.instance.InstanceId + ")::check_get succeeded");
          resolve("running");
        }
      });
    });
  }

  async check() {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::check");
    for (let tries = 0; tries < 5 && this.instance.icc_instance_state !== "running"; tries++) {
      this.setstatus("checking");
      const newstatus = await this.check_get();
      try {
        if (newstatus === "setup") await this.setup();
        else this.setstatus(newstatus);
      } catch (e) {
        log.error("Error in setup: " + e);
      }
    }
    if (this.instance.icc_instance_state !== "running") {
      log.error(
        "Unable to get instance running! instanceid=" +
          this.instance.InstanceId +
          ", _id=" +
          this.instance._id
      );
      this.setstatus("error");
    }
  }

  _sshReadyFunction(done) {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::_sshReadyFunction ");
    // argh
    this.sshConn.exec(
      "curl -sL https://raw.githubusercontent.com/djlogan2/stockfish2/master/install.sh | sudo /bin/bash",
      (err, stream) => {
        if (err) throw err;
        stream
          .on("close", (code, signal) => {
            this.sshConn.end();
            delete this.sshConn;
            meteordebug(
              "AWSInstance(" + this.instance.InstanceId + ")::_sshReadyFunction completed"
            );
            done();
          })
          .on("data", data => {
            // Just ignore this
            meteordebug(
              "AWSInstance(" + this.instance.InstanceId + ")::_sshReadyFunction stdout: " + data
            );
          })
          .stderr.on("data", data => {
            // Just ignore this too
            meteordebug(
              "AWSInstance(" + this.instance.InstanceId + ")::_sshReadyFunction failed with " + data
            );
            // done(data);
          });
      }
    );
  }

  async setup() {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::setup");
    this.setstatus("setup");
    this.sshConn = new ssh2.Client.Client();
    const creds = {
      host: this.instance.PublicIpAddress,
      port: 22,
      username: "ubuntu",
      privateKey: require("fs").readFileSync("/Users/davidlogan/.ssh/id_rsa")
    };
    return new Promise((resolve, reject) => {
      this.sshConn
        .on("ready", () =>
          this.sshReadyFunction(data => {
            if (!data) resolve();
            else reject(data);
          })
        )
        .connect(creds);
    });
  }
}

class AWSEngine {
  constructor(parent_engine) {
    this.parent_engine = parent_engine;
    this.collection = this.parent_engine.collection;
    this.status = "waiting";
    this.id = this.collection.insert({
      // _id: is going to be the random value that identifies the engine
      instance: this.parent_instance.instance._id,
      status: "waiting"
    });
  }
}

class AWSEngineConnector {
  constructor(game_id, engine) {
    this.engine = engine;
    this.game_id = game_id;
    this.collection = this.engine.collection;
    this.collection.insert({ game_id: game_id, engine_id: engine.id });
  }
}

module.exports.Awsmanager = global._awsObject;
//module.exports.awsinstance = AWSInstance;
//module.exports.awsengine = AWSEngine;
//module.exports.awsengine_connector = AWSEngineConnector;
