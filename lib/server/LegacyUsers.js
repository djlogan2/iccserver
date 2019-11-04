import legacy from "legacyicc";
import { decrypt } from "./encrypt";
import { Meteor } from "meteor/meteor";
import {GameRequests} from "../../server/GameRequest";

export const LegacyUser = {};
const legacy_users = {};

function login_failed(data) {
  console.log(data);
}

function loggedin(data) {
  console.log(data);
}

function error_function(data) {
  console.log("ERROR=");
  console.log(data);
}

function seek(data) {
    GameRequests.addLegacyGameSeek("server", data.index, data.name, data.titles, data.rating, data.provisional_status, data.wild, data.rating_type, data.time, data.inc, data.rated, data.color, data.minrating, data.maxrating, data.autoaccept, data.fancy_time_control);
}

function seek_removed(data) {
    GameRequests.removeLegacySeek("server", data.index, data.reasoncode);
}

function debugpackets(data) {
    console.log("PACKETS=");
    console.log(data);
}

function debugrawdata(databuffer) {
     console.log("RAW=" + encodeURIComponent(databuffer));
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
