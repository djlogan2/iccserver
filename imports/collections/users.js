import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { LegacyUser } from "../../server/LegacyUser";
import { fields_viewable_by_account_owner } from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";

let log = new Logger("server/users_js");

Meteor.publish("loggedOnUsers", function() {
  return Meteor.users.find({});
});

//
// The fields an average user will see of his own record
//
Meteor.publish("userData", function() {
  if (!this.userId) return Meteor.users.find({ _id: null });

  const self = this;

  this.onStop(function() {
   // log.debug("User left");
    LegacyUser.logout(self.userId);
  });

  //log.debug("User has arrived");
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
  return user;
});

Accounts.onLogin(function(user_parameter) {
  const user = user_parameter.user;

  //log.debug("user record", user);
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
