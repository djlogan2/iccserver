import { Mongo } from "meteor/mongo";
import AWS from "aws-sdk";
import { Logger } from "../../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Singular } from "../../imports/server/singular";

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

  _sshReadyFunction(done) {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::_sshReadyFunction ");
    // argh
  }

  async setup() {
    meteordebug("AWSInstance(" + this.instance.InstanceId + ")::setup");
    this.setstatus("setup");
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
