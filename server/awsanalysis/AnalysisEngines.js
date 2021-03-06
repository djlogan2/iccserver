import { Meteor } from "meteor/meteor";
import { Logger } from "../../lib/server/Logger";
import ResourceManager from "./ResourceManager";
import { Picker } from "meteor/meteorhacks:picker";

const log = new Logger("server/AnalysisEngine_js");
const meteordebug = Meteor.bindEnvironment((message, data) => log.debug(message, data));
const meteorerror = Meteor.bindEnvironment((message, data) => log.error(message, data));

//*****************************************************************************
//**    These are the methods that get called when spot instances change     **
//*****************************************************************************
const confirmSubscriptionCallback = Meteor.bindEnvironment((sns_topic, token) => {
  meteordebug("::confirmSubscriptionCallback");
});

const spotInterruption = Meteor.bindEnvironment((action, instance_id) => {
  meteordebug("::spotInterruption action=" + action + ", instance_id=" + instance_id);
});

const instanceChanged = Meteor.bindEnvironment((state, instance_id) => {
  meteordebug("::instanceChanged state=" + state + ", intance_id=" + instance_id);
});

//*****************************************************************************
//** Set up the subscriptions to be notified by AWS if we are losing a spot  **
//** instance                                                                **
//*****************************************************************************
function setupSNS() {
  meteordebug("Awsmanager::setupSNS");
  getOurTopics().then(() => {
    initiateEndpoint("InstanceChanged", "/aws_instance_changed");
    initiateEndpoint("SpotWarning", "/aws_spot_interruption");
  });
}

function getOurTopics() {
  meteordebug("Awsmanager::getOurTopics");

  return new Promise((resolve, reject) => {
    const params = {};
    sns.listTopics(params, (err, data) => {
      if (err) reject(err);
      data.Topics.forEach(topic => {
        const arn = topic.TopicArn;
        const pieces = arn.split(":");
        const name = pieces[pieces.length - 1];
        sns_topic[name] = arn;
      });
      resolve();
    });
  });
}

function initiateEndpoint(sns_topic, path) {
  meteordebug("Awsmanager::initiateEndpoint");
  var params = {
    Protocol: "http",
    TopicArn: sns_topic[sns_topic],
    Endpoint: "http://" + my_ip + ":" + my_port + path,
    ReturnSubscriptionArn: true
  };
  sns.subscribe(params, err => {
    if (err) meteorerror("Error subscribing to " + sns_topic + ": " + err.toString());
  });
}

function confirmSubscription(sns_topic, token) {
  meteordebug("Awsmanager::confirmSubscription");
  sns.confirmSubscription({ TopicArn: sns_topic[sns_topic], Token: token }, err => {
    if (err) meteorerror("Error confirming subscription to " + sns_topic + ": " + err.toString());
  });
}

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

//*****************************************************************************
//** These are the AWS routines to obtain info and modify the spot instances **
//*****************************************************************************

//*****************************************************************************
//** These are called by the resource manager to create or destroy engines   **
//*****************************************************************************
function create_function(count) {
  return new Promise((resolve, reject) => {});
}

function destroy_function(instance_array) {
  return new Promise((resolve, reject) => {});
}

const resourcemanager = new ResourceManager(create_function, destroy_function);
