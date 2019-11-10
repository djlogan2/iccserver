import legacy from "legacyicc";
import { decrypt } from "./encrypt";
import { Meteor } from "meteor/meteor";
import { GameRequests } from "../../server/GameRequest";
import { Logger } from "./Logger";
import {Mongo} from "meteor/mongo";

const log = new Logger("server/LegacyUsers");

const LegacyUsersCollection = new Mongo.Collection("legacyUsers");

export const LegacyUser = {};
const legacy_users = {};

function login_failed(data) {
  log.error("login_failed=", data);
}

function loggedin(data) {
  log.debug("Logged in to legacy", data);
}

function error_function(data) {
  log.error(data);
}

function seek(data) {
  GameRequests.addLegacyGameSeek(
    "server",
    data.index,
    data.name,
    data.titles,
    data.rating,
    data.provisional_status,
    data.wild,
    data.rating_type,
    data.time,
    data.inc,
    data.rated,
    data.color,
    data.minrating,
    data.maxrating,
    data.autoaccept,
    data.fancy_time_control
  );
}

function seek_removed(data) {
  GameRequests.removeLegacySeek("server", data.index, data.reasoncode);
}

function debugpackets(data) {
  log.debug("PACKETS=", data);
}

function debugrawdata(databuffer) {
  log.debug("RAW=", databuffer);
}

function debugsentcommands(databuffer) {
  log.debug("SENT=", databuffer);
}

function player_arrived(data) {
  console.log(data);
}

function player_left(data) {
  console.log(data);
}

LegacyUser.login = function(user) {
  legacy_users[user._id] = new legacy.LegacyICC({
    username: user.profile.legacy.username,
    password: decrypt(user.profile.legacy.password),
    error_function: Meteor.bindEnvironment(error_function),
    loggedin: Meteor.bindEnvironment(loggedin),
    login_failed: Meteor.bindEnvironment(login_failed),
    seek: Meteor.bindEnvironment(seek),
    seek_removed: Meteor.bindEnvironment(seek_removed),
    preprocessor: Meteor.bindEnvironment(debugpackets),
    preparser: Meteor.bindEnvironment(debugrawdata),
    sendpreprocessor: Meteor.bindEnvironment(debugsentcommands),
    player_arrived:  Meteor.bindEnvironment(player_arrived),
    player_left:  Meteor.bindEnvironment(player_left),
  });
  legacy_users[user._id].login();
};

LegacyUser.logout = function(user) {
  const legacy = legacy_users[user._id];
  if (!!legacy) {
    legacy.logout();
    delete legacy_users[user._id];
  }
};
