import { Mongo } from "meteor/mongo";
import { HTTP } from "meteor/http";
import { Picker } from "meteor/meteorhacks:picker";
import AWS from "aws-sdk";
import { Logger } from "../lib/server/Logger";
import ssh2 from "ssh2";
import { Game } from "./Game";
import legacy from "icclegacy";
import { Meteor } from "meteor/meteor";
import { Singular } from "./singular";

const log = new Logger("server/awsmanager_js");
//
//  OK, so we need support classes here:
// class Instance {} -- One per instance
// class InstanceEngine {} -- One for each running stockfish in an instance
// class ChessEngine {} -- One for each request -- this is the bridge between the entity wants to run an engine, and an engine
//                         If we have to change engines, it will install a new InstanceEngine into ChessEngine
//

// when an instance is discovered to be running:
// (1) Check to see if it's been configured        [state: "check"]
// (2) Configure it -- loop to #1 -- Maybe count?  [state: "configuring"]
// (3) Set it to ready                             [state: "ready"]
//
// when an instance is discovered to be on its way down:
// (4) Move engines from this instance to another  [state: "quiescing"]
// (5) Wait for shutdown                           [state: "quiesced"]

// eslint-disable-next-line no-unused-vars

if (!!process.env.AWS_SPOT_FLEET_ID && !process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

const meteordebug = Meteor.bindEnvironment((message, data) => log.debug(message, data));
const meteorerror = Meteor.bindEnvironment((message, data) => log.error(message, data));
// This has to be global because we are going to pass engines to other people,
// and we need control over them when AWS makes changes
const engine_connectors = {};

class Awsmanager {
  constructor() {
    meteordebug("Awsmanager::constructor");
    this.collection = new Mongo.Collection("aws_stockfish_instances");
    this.my_ip = process.env.MY_IP_ADDRESS;
    this.my_port = process.env.MY_PORT;
    this.ott_username = process.env.OTT_USERNAME;
    this.ott_password = process.env.OTT_PASSWORD;
    this.spot_fleet_id = "aws:ec2spot:fleet-request-id";
    this.ec2 = new AWS.EC2();
    this.sns = new AWS.SNS();
    Meteor.startup(() => {
      Singular.addTask(() => {
        this.collection.remove({ type: { $ne: "trainingdata" } }); // Remove all instances
        this.setupSNS();
        this.getCurrentInstances();
        this.watchUsersAndGames();
        if (!!this.ott_username && !!this.ott_password) this.oneTimeTrain();
        // temp
        const loggedOnUsers = Meteor.users.find({ "status.online": true }).count();
        const activeGames = Game.GameCollection.find().count();
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        this.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
        // temp
      });
    });
  }

  setupSNS() {
    meteordebug("Awsmanager::setupSNS");
    this.getOurTopics().then(() => {
      this.initiateEndpoint("InstanceChanged", "/aws_instance_changed");
      this.initiateEndpoint("SpotWarning", "/aws_spot_interruption");
    });
  }

  getOurTopics() {
    meteordebug("Awsmanager::getOurTopics");
    const self = this;
    this.sns_topic = {};

    return new Promise((resolve, reject) => {
      const params = {};
      this.sns.listTopics(params, (err, data) => {
        if (err) reject(err);
        data.Topics.forEach(topic => {
          const arn = topic.TopicArn;
          const pieces = arn.split(":");
          const name = pieces[pieces.length - 1];
          self.sns_topic[name] = arn;
        });
        resolve();
      });
    });
  }

  initiateEndpoint(sns_topic, path) {
    meteordebug("Awsmanager::initiateEndpoint");
    var params = {
      Protocol: "http",
      TopicArn: this.sns_topic[sns_topic],
      /*
        Attributes: {
          '<attributeName>': 'STRING_VALUE',
          /* '<attributeName>': ...
        },
        */
      Endpoint: "http://" + this.my_ip + ":" + this.my_port + path,
      ReturnSubscriptionArn: true
    };
    this.sns.subscribe(params, err => {
      if (err) meteorerror("Error subscribing to " + sns_topic + ": " + err.toString());
    });
  }

  confirmSubscription(sns_topic, token) {
    meteordebug("Awsmanager::confirmSubscription");
    this.sns.confirmSubscription({ TopicArn: this.sns_topic[sns_topic], Token: token }, err => {
      if (err) {
        meteorerror("Error confirming subscription to " + sns_topic + ": " + err.toString());
        return;
      }
      //console.log(data);
    });
  }

  getCurrentInstances() {
    meteordebug("Awsmanager::getCurrentInstances");
    Meteor.startup(() => {
      meteordebug("Awsmanager::getCurrentInstances/1");
      this.collection.remove();
      this.ec2.describeInstances(
        {},
        Meteor.bindEnvironment((err, data) => {
          if (err) {
            meteorerror("Unable to describeInstances, err=" + err.toString());
            return;
          }
          // Create an array of instances from this
          data.Reservations.forEach(r => {
            r.Instances.forEach(i => {
              const spotfleettag = data.Reservations[0].Instances[0].Tags.find(
                tag => tag.Key === this.spot_fleet_id
              );
              if (!!spotfleettag && spotfleettag.Value === process.env.AWS_SPOT_FLEET_ID) {
                if (this.collection.find({ InstanceId: i.InstanceId }).count() === 0) {
                  const awsi = new AWSInstance(this.collection, i);
                  awsi.check();
                }
              }
            });
          });
        })
      );
    });
  }

  updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour) {
    // const data = {
    //   lou: loggedOnUsers / 10000,
    //   ag: activeGames / 10000,
    //   cd: currentDay / 7,
    //   ch: currentHour / 24,
    //   louag: !loggedOnUsers ? 0 : activeGames / loggedOnUsers
    // };
    // const pctOfLoggedOnUsers = 0 /* # of stockfishes */ / loggedOnUsers;
    // const output = this.net.run(data);
    // if (!output) {
    //   this.net.train([{ input: data, output: { pctOfLoggedOnUsers: data.louag } }]);
    // }
  }

  watchUsersAndGames() {
    let loggedOnUsers = 0;
    let activeGames = 0;
    let currentDay;
    let currentHour;
    let self = this;

    meteordebug("Awsmanager::watchUsersAndGames");
    this.usersHandle = Meteor.users.find().observeChanges({
      added(id, fields) {
        if (fields.status.online) loggedOnUsers++;
        self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
      },
      changed(id, fields) {
        if (fields.status !== undefined && fields.status.online !== undefined) {
          if (!!fields.status.online) loggedOnUsers++;
          else loggedOnUsers--;
        }
        self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
      },
      removed(id) {
        loggedOnUsers = Meteor.users.find({ "status.online": true }).count();
        self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
      }
    });

    this.gameHandle = Game.GameCollection.find().observeChanges({
      added(id, fields) {
        activeGames++;
        self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
      },
      changed(id, fields) {},
      removed(id) {
        activeGames--;
        self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
      }
    });

    this.intervalHandle = Meteor.setInterval(() => {
      const now = new Date();
      currentDay = now.getDay();
      currentHour = now.getHours();
      self.updateInstancesFromModel(loggedOnUsers, activeGames, currentDay, currentHour);
    }, 60000);
  }

  oneTimeTrainTrain() {
    const now = new Date();
    if (!this.onetimetrain.start) {
      this.onetimetrain.start = new Date(now.getTime() + 30000);
    } else if (this.onetimetrain.start < now) {
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const data = this.collection.findOne({
        type: "trainingdata",
        currentDay: currentDay,
        currentHour: currentHour,
        currentUsers: this.onetimetrain.currentUsers
      });
      if (!data) {
        this.collection.insert({
          type: "trainingdata",
          currentHour: currentHour,
          currentDay: currentDay,
          currentUsers: this.onetimetrain.currentUsers,
          minGames: this.onetimetrain.currentGames,
          maxGames: this.onetimetrain.currentGames,
          count: 1,
          averageGames: this.onetimetrain.currentGames
        });
      } else {
        this.collection.update(
          {
            type: "trainingdata",
            currentDay: currentDay,
            currentHour: currentHour,
            currentUsers: this.onetimetrain.currentUsers
          },
          {
            $set: {
              minGames: Math.min(this.onetimetrain.currentGames, data.minGames),
              maxGames: Math.max(this.onetimetrain.currentGames, data.maxGames),
              count: data.count + 1,
              averageGames:
                (data.averageGames * data.count + this.onetimetrain.currentGames) / (data.count + 1)
            }
          }
        );
      }
    }
  }

  player_arrived(packet) {
    this.onetimetrain.currentUsers++;
    this.oneTimeTrainTrain();
  }

  player_left(packet) {
    this.onetimetrain.currentUsers--;
    this.oneTimeTrainTrain();
  }

  game_started(packet) {
    if (this.onetimetrain.games.some(gamenumber => gamenumber === packet.gamenumber)) {
      meteorerror("We already have game number " + packet.gamenumber);
    } else {
      this.onetimetrain.games.push(packet.gamenumber);
      this.onetimetrain.currentGames++;
      this.oneTimeTrainTrain();
    }
  }

  game_ended(packet) {
    if (packet.become_examined) return; // It's not gone if it's being examined
    if (this.onetimetrain.games.some(gamenumber => gamenumber === packet.gamenumber)) {
      this.onetimetrain.games = this.onetimetrain.games.filter(
        gamenumber => gamenumber !== packet.gamenumber
      );
      this.onetimetrain.currentGames--;
      this.oneTimeTrainTrain();
    } else {
      meteorerror("Unable to find game number " + packet.gamenumber);
    }
  }

  oneTimeTrain() {
    const self = this;
    this.onetimetrain = new legacy.LegacyICC({
      username: this.ott_username,
      password: this.ott_password,
      player_arrived: Meteor.bindEnvironment(data => self.player_arrived(data)),
      player_left: Meteor.bindEnvironment(data => self.player_left(data)),
      game_started: Meteor.bindEnvironment(data => self.game_started(data)),
      game_result: Meteor.bindEnvironment(data => self.game_ended(data)),
      examined_game_is_gone: Meteor.bindEnvironment(data => self.game_ended(data)),
      loggedin: () => this.onetimetrain.noautologout("noautologout", true)
    });
    this.onetimetrain.currentUsers = 0;
    this.onetimetrain.currentGames = 0;
    this.onetimetrain.games = [];
    this.onetimetrain.login();
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
      //
      // Since we have just allocated a new engine, we need to adjust, and possibly
      // bring up another instance
      //
      this.dynamicallyUpdateWaitingEngines();
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
    // Mark the engine as free
    // Resort the list fewest -> most
    // If we have too many free instances, shut down any excesses
    //   probably best to put a time delay on it
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

Picker.route("/aws_instance_changed", function(params, req, res) {
  meteordebug("::aws_instance_changed");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      if (!!global._awsObject) confirmSubscriptionCallback("InstanceChanged", payload.Token);
      else
        log.error(
          "Received InstanceChanged confirmation request, but our AWS object does not exist"
        );
    } else {
      const message = JSON.parse(payload.Message);
      instanceChanged(message.detail["state"], message.detail["instance-id"]);
    }
    res.end("ok");
  });
});

Picker.route("/aws_spot_interruption", function(params, req, res) {
  meteordebug("::aws_spot_interruption");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      if (!!global._awsObject) confirmSubscriptionCallback("SpotWarning", payload.Token);
      else
        log.error("Received SpotWarning confirmation request, but our AWS object does not exist");
    } else {
      const message = JSON.parse(payload.Message);
      spotInterruption(message.detail["instance-action"], message.detail["instance-id"]);
    }
    res.end("ok");
  });
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
module.exports.awsmanager_class = Awsmanager;
module.exports.awsinstance_class = AWSInstance;
module.exports.awsengine_class = AWSEngine;
module.exports.awsengine_connector_class = AWSEngineConnector;
