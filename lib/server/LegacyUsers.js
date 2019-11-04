import legacy from "legacyicc";
import { decrypt } from "./encrypt";
import { Meteor } from "meteor/meteor";

export const LegacyUser = {};

const legacy_users = {};

function error_function(error) {
    console.log(error);
}

function loggedin(data) {
    if(data.successful) {

    } else {

    }
}

LegacyUser.login = function(user) {
  legacy_users[user._id] = new legacy.LegacyICC({
    username: user.profile.legacy.username,
    password: decrypt(user.profile.legacy.password),
    error_function: Meteor.bindEnvironment(error_function),
    login: Meteor.bindEnvironment(loggedin)
  });
  legacy.login();
};

LegacyUser.logout = function(user) {
  const legacy = legacy_users[user._id];
  if (!!legacy) {
    legacy.logout();
    delete legacy_users[user._id];
  }
};
