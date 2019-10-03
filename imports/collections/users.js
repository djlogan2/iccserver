import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { LegacyUser } from "../../server/LegacyUser";
import {
  fields_viewable_by_account_owner,
  viewable_logged_on_user_fields
} from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";

let log = new Logger("server/users_js");

Meteor.publish("loggedOnUsers", function() {
  return Meteor.users.find(
    { loggedOn: true },
    { fields: viewable_logged_on_user_fields }
  );
});

// TODO: Add a method that is draining the server (i.e. not allowing anyone to login)
// and add this to the login attempt method below.

Meteor.publish("userData", function() {
  if (!this.userId) return Meteor.users.find({ _id: null });

  const self = this;

  this.onStop(function() {
    log.debug("User left");
    LegacyUser.logout(self.userId);
  });

  log.debug("User has arrived");
  return Meteor.users.find(
    { _id: this.userId },
    { fields: fields_viewable_by_account_owner }
  );
});

Accounts.onCreateUser(function(options, user) {
  if (options.profile) {
    user.profile = {
      firstname: options.profile.firstname || "?",
      lastname: options.profile.lastname || "?"
    };

    if (
      options.profile.legacy &&
      (options.profile.legacy.username || options.profile.legacy.password)
    )
      user.profile.legacy = {
        username: options.profile.legacy.username,
        password: encrypt(options.profile.legacy.password),
        autologin: true
      };
  }
  user.settings = {
    autoaccept: true
  };
  user.loggedOn = false;
  user.rating = user.rating || user.profile.rating || 2000;
  return user;
});

Accounts.onLogin(function(user_parameter) {
  const user = user_parameter.user;

  Meteor.users.update({ _id: user._id }, { $set: { loggedOn: true } });

  log.debug("user record", user);
  log.debug(
    "User is in leagy_login role",
    Roles.userIsInRole(user, "legacy_login")
  );

  if (
    Roles.userIsInRole(user, "legacy_login") &&
    user.profile &&
    user.profile.legacy &&
    user.profile.legacy.username &&
    user.profile.legacy.password &&
    user.profile.legacy.autologin
  ) {
    LegacyUser.login(user);
  }
});

Accounts.onLogout(function(user_parameter) {
  const user = user_parameter.user;
  Meteor.users.update({ _id: user._id }, { $set: { loggedOn: false } });
});

Accounts.validateLoginAttempt(function(params) {
  // params.type = service name
  // params.allowed = t/f
  // params.user
  // params.connection
  // params.methodName
  // params.methodArguments
  if (!params.user) return false;
  // Pretty simple so far. Allow the user to login if they are in the role allowing them to do so.
  if (Roles.userIsInRole(params.user, "login")) return true;
  else throw new Meteor.Error("Administrators are not allowing you to login"); // TODO: i8n
});
