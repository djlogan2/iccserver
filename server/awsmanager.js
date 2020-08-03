import { Mongo } from "meteor/mongo";

import { Picker } from "meteor/meteorhacks:picker";
import AWS from "aws-sdk";
import { Logger } from "../lib/server/Logger";

const log = new Logger("server/awsmanager_js");
//
//  OK, so we need support classes here:
// class Instance {} -- One per instance
// class InstanceEngine {} -- One for each running stockfish in an instance
// class ChessEngine {} -- One for each request -- this is the bridge between the entity wants to run an engine, and an engine
//                         If we have to change engines, it will install a new InstanceEngine into ChessEngine
//

// eslint-disable-next-line no-unused-vars

if (process.env.AWSPRODUCTION === "true" && !process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

class Awsmanager {
  constructor() {
    log.debug("Awsmanager::constructor");
    this.collection = new Mongo.Collection("aws_stockfish_instances");
    this.my_ip = "71.211.240.210";
    this.my_port = 3000;
    this.spot_fleet_id = "aws:ec2spot:fleet-request-id";
    this.ec2 = new AWS.EC2();
    this.sns = new AWS.SNS();
    Meteor.startup(() => {
      this.setupSNS();
      this.getCurrentInstances();
      this.watchUsersAndGames();
    });
  }

  setupSNS() {
    log.debug("Awsmanager::setupSNS");
    this.getOurTopics().then(() => {
      this.initiateEndpoint("InstanceChanged", "/aws_instance_changed");
      this.initiateEndpoint("SpotWarning", "/aws_spot_interruption");
    });
  }

  getOurTopics() {
    log.debug("Awsmanager::getOurTopics");
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
    log.debug("Awsmanager::initiateEndpoint");
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
    this.sns.subscribe(params, (err, data) => {
      if (err) log.error("Error subscribing to " + sns_topic + ": " + err.toString());
    });
  }

  confirmSubscription(sns_topic, token) {
    log.debug("Awsmanager::confirmSubscription");
    this.sns.confirmSubscription(
      { TopicArn: this.sns_topic[sns_topic], Token: token },
      (err, data) => {
        if (err) {
          log.error("Error confirming subscription to " + sns_topic + ": " + err.toString());
          return;
        }
        //console.log(data);
      }
    );
  }

  getCurrentInstances() {
    log.debug("Awsmanager::getCurrentInstances");
    Meteor.startup(() => {
      log.debug("Awsmanager::getCurrentInstances/1");
      this.collection.remove();
      this.ec2.describeInstances(
        {},
        Meteor.bindEnvironment((err, data) => {
          if (err) {
            log.error("Unable to describeInstances, err=" + err.toString());
            return;
          }
          // Create an array of instances from this
          data.Reservations.forEach(r => {
            r.Instances.forEach(i => {
              const spotfleettag = data.Reservations[0].Instances[0].Tags.find(
                tag => tag.Key === this.spot_fleet_id
              );
              if (
                !!spotfleettag &&
                spotfleettag.Value === "sfr-fdf03ce6-b92c-4581-8a06-53a6845dca01"
              ) {
                if (this.collection.find({ InstanceId: i.InstanceId }).count() === 0) {
                  i.icc_instance_state = "check";
                  this.collection.insert(i);
                }
              }
            });
          });
        })
      );
    });
  }

  watchUsersAndGames() {
    log.debug("Awsmanager::watchUsersAndGames");
    // this will increase/decrease instance count based on hour, day, # users, # games, etc.
  }

  instanceChanged(state, instance_id) {
    log.debug("Awsmanager::instanceChanged state=" + state + ", instance_id=" + instance_id);
    // Called by SNS when an instance is started or stopped (or any other state)
    // The possible states:
    // pending, running, shutting-down, stopped, stopping, terminated
    // if it's in shutting-down, stopping, stopped, or terminated, call instanceStopped()
    // if it's in running, call instanceStarted()
  }

  instanceStarted() {
    log.debug("Awsmanager::instanceStarted");
    // If it's not in the list, add it.
  }

  spotInstanceWarning(action, instance_id) {
    log.debug("Awsmanager::spotInstanceWarning action=" + action + ", instance_id=" + instance_id);
    // Remove the instance from contention
    // If there are any engines in use, move them all to other instances
    //    Both the above removal, and the moving of these engines to other
    //    instances should trigger new instance builds (as is in getEngine)
    //    if we are now low on waiting engines.
  }

  instanceStopped() {
    log.debug("Awsmanager::instanceStopped");
    // If it's in the list, remove it
    // If there are any any engines active, move them, exactly like "spotInstanceWarning"
  }

  changeInstanceCount(count) {
    log.debug("Awsmanager::changeInstanceCount");
    this.ec2
      .modifySpotFleetRequest({
        SpotFleetRequestId: this.spot_fleet_id,
        TargetCapacity: count
      })
      .promise();
  }

  getEngine() {
    log.debug("Awsmanager::getEngine");
    // get a free engine from the instance with the fewest number of free instances left
    // If there aren't any, or if we are low on waiting engines, start another instance
    // return whatever we found
  }

  releaseEngine(engine_object) {
    log.debug("Awsmanager::releaseEngine");
    // Mark the engine as free
    // Resort the list fewest -> most
    // If we have too many free instances, shut down any excesses
    //   probably best to put a time delay on it
  }
}

if (process.env.AWSPRODUCTION === "true" && !global._awsObject) {
  log.debug("Create global Awsmanager");
  global._awsObject = new Awsmanager();
}

const confirmSubscriptionCallback = Meteor.bindEnvironment((sns_topic, token) => {
  log.debug("::confirmSubscriptionCallback");
  global._awsObject.confirmSubscription(sns_topic, token);
});

const spotInterruption = Meteor.bindEnvironment((action, instance_id) => {
  log.debug("::spotInterruption action=" + action + ", instance_id=" + instance_id);
  global._awsObject.spotInstanceWarning(action, instance_id);
});

const instanceChanged = Meteor.bindEnvironment((state, instance_id) => {
  log.debug("::instanceChanged state=" + state + ", intance_id=" + instance_id);
  global._awsObject.instanceChanged(state, instance_id);
});

Picker.route("/aws_instance_changed", function(params, req, res) {
  log.debug("::aws_instance_changed");
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
  log.debug("::aws_spot_interruption");
  let post_data = "";
  req.on("data", data => (post_data += data));
  req.on("end", () => {
    const payload = JSON.parse(post_data);
    if (payload.Type === "SubscriptionConfirmation") {
      if (!!global._awsObject) confirmSubscriptionCallback("SpotWarning", payload.Token);
      else
        log.error("Received SpotWarning confirmation request, but our AWS object does not exist");
    } else {
      // ARGH!!!
      const message = JSON.parse(payload.Message);
      spotInterruption(message.detail["instance-action"], message.detail["instance-id"]);
    }
    res.end("ok");
  });
});

module.exports.Awsmanager = global._awsObject;
