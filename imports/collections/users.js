import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { LegacyUser } from "../../server/LegacyUser";
import {
  fields_viewable_by_account_owner,
  standard_member_roles,
  viewable_logged_on_user_fields
} from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";
import { i18n } from "./i18n";

let log = new Logger("server/users_js");

Meteor.publish("loggedOnUsers", function() {
  return Meteor.users.find(
    { loggedOn: true },
    { fields: viewable_logged_on_user_fields }
  );
});

// TODO: Add a method that is draining the server (i.e. not allowing anyone to login)
//       and add this to the login attempt method below.
// TODO: legacy username has to be "pending" until it's validated.
//       The problem: Anyone can set themselves to any legacy username and instantly start getting all of the legacy messages, and even play games, chat, etc.(!!)
//       I'm thinking that we don't write legacy.username, but we write legacy.pending_username
//       In the L2.WHO_AM_I, if we have a pending, we change it to just username.

Meteor.publish("userData", function() {
  if (!this.userId) return [];

  const self = this;

  this.onStop(function() {
    log.debug("User left: " + self.userId);
    LegacyUser.logout(self.userId);

    Meteor.users.update({ _id: self.userId }, { $set: { loggedOn: false } });
    runLogoutHooks(this, self.userId);
  });

  log.debug("User has arrived");
  return Meteor.users.find(
    { _id: this.userId },
    { fields: fields_viewable_by_account_owner }
  );
});

export const startingRatingObject = {
  rating: 1600,
  need: 0,
  won: 0,
  draw: 0,
  lost: 0,
  best: 0
};

export const user_ratings_object = {
  bullet: startingRatingObject,
  blitz: startingRatingObject,
  standard: startingRatingObject,
  wild: startingRatingObject,
  bughouse: startingRatingObject,
  losers: startingRatingObject,
  crazyhouse: startingRatingObject,
  fiveminute: startingRatingObject,
  oneminute: startingRatingObject,
  correspondence: startingRatingObject,
  fifteenminute: startingRatingObject,
  threeminute: startingRatingObject,
  computerpool: startingRatingObject,
  chess960: startingRatingObject
};

export const default_settings = {
  autoaccept: true
};

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
        validated: false,
        password: encrypt(options.profile.legacy.password),
        autologin: true
      };
  }

  // TODO: Change this to load types from ICC configuraation, and to set ratings also per ICC configuration
  user.ratings = user_ratings_object;
  user.settings = default_settings;
  user.loggedOn = false;
  user.locale = "unknown";
  user.board_css = "developmentcss"; // TODO: Get this from the ICC configuration collection!
  user.roles = { __global_roles__: standard_member_roles };

  return user;
});

Accounts.onLogin(function(user_parameter) {
  const user = user_parameter.user;

  Meteor.users.update({ _id: user._id }, { $set: { loggedOn: true } });

  log.debug("user record", user);
  log.debug(
    "User is in legacy_login role",
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

  runLoginHooks();
});

const loginHooks = [];
const logoutHooks = [];

export function addLoginHook(f) {
  Meteor.startup(function() {
    loginHooks.push(f);
  });
}

export function addLogoutHook(f) {
  Meteor.startup(function() {
    logoutHooks.push(f);
  });
}

function runLoginHooks(context, user) {
  loginHooks.forEach(f => f.call(context, user));
}

function runLogoutHooks(context, user) {
  logoutHooks.forEach(f => f.call(context, user));
}

Accounts.validateLoginAttempt(function(params) {
  // params.type = service name
  // params.allowed = t/f
  // params.user
  // params.connection
  // params.methodName
  // params.methodArguments
  if (!params.user) return false;
  // Pretty simple so far. Allow the user to login if they are in the role allowing them to do so.
  if (!params.user.locale || params.user.locale === "unknown") {
    const httpHeaders = params.connection.httpHeaders || {};
    const acceptLanguage = (httpHeaders["accept-language"] || "en-us")
      .split(/[,;]/)[0]
      .toLocaleLowerCase()
      .replace("_", "-");
    Meteor.users.update(
      { _id: params.user._id },
      { $set: { locale: acceptLanguage } }
    );
    params.user.locale = acceptLanguage;
  }

  if (!Roles.userIsInRole(params.user, "login")) {
    const message = i18n.localizeMessage(
      params.user.locale || "en-us",
      "LOGIN_FAILED_12"
    );
    throw new Meteor.Error(message);
  }

  return true;
});
