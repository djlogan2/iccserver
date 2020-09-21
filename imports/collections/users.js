import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import {
  all_roles,
  fields_viewable_by_account_owner,
  standard_member_roles,
  viewable_logged_on_user_fields
} from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";
import { i18n } from "./i18n";
import { DynamicRatings } from "../../server/DynamicRatings";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";
import { UserStatus } from "meteor/mizzao:user-status";

let log = new Logger("server/users_js");

export const Users = {};
const LoggedOnUsers = new Mongo.Collection("loggedon_users");

Meteor.publishComposite("loggedOnUsers", {
  find() {
    return Meteor.users.find(
      { _id: this.userId, "status.online": true },
      { fields: { isolation_group: 1, _id: 1, username: 1 } }
    );
  },
  children: [
    {
      // We are going to leave this here to reinstate publishComposite with isolation groups
      find(user) {
        if (!Users.isAuthorized(user, "show_users")) return Meteor.users.find({ _id: "invalid" });
        else {
          return Meteor.users.find(
            {
              $and: [
                { "status.online": true },
                { _id: { $ne: user._id } },
                { isolation_group: user.isolation_group }
              ]
            },
            { fields: viewable_logged_on_user_fields }
          );
        }
      }
    }
  ]
});

// TODO: Add a method that is draining the server (i.e. not allowing anyone to login)
//       and add this to the login attempt method below.
Meteor.publish("userData", function() {
  if (!this.userId) return [];

  log.debug("User " + this.userId + " has arrived");
  return Meteor.users.find({ _id: this.userId }, { fields: fields_viewable_by_account_owner });
});

Meteor.methods({
  getPartialUsernames: function(prefix) {
    log.debug("Meteor.methods getPartialUsernames");
    check(prefix, String);
    check(this.userId, String);
    if (prefix.length === 0) return [];
    return Meteor.users
      .find({ username: { $regex: "^" + prefix } }, { fields: { username: 1 } })
      .fetch()
      .map(rec => rec.username);
  }
});

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

  user.ratings = DynamicRatings.getUserRatingsObject();
  user.settings = default_settings;
  user.locale = "unknown";
  user.board_css = "developmentcss"; // TODO: Get this from the ICC configuration collection!
  user.newguy = true;
  // user.roles = [];
  // standard_member_roles.forEach(role => user.roles.push({ _id: role, scope: null, assigned: true }));

  if (!user.status) user.status = {};
  user.status.game = "none";
  user.isolation_group = "public";

  return user;
});

// Meteor.users.find().observeChanges({
//   added(id) {
//     console.log("Adding roles to new user");
//     Roles.addUsersToRoles(id, standard_member_roles);
//   }
// });

Users.setGameStatus = function(message_identifier, user, status) {
  check(message_identifier, String);
  check(user, Match.OneOf(Object, String));
  check(status, String);

  if (typeof user === "object") user = user._id;

  if (["examining", "observing", "playing", "none"].indexOf(status) === -1)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to set users game status",
      "Invalid status"
    );
  Meteor.users.update({ _id: user, "status.online": true }, { $set: { "status.game": status } });
};

const group_change_hooks = [];

Users.addGroupChangeHook = function(func) {
  Meteor.startup(() => group_change_hooks.push(func));
};

const loginHooks = [];
const logoutHooks = [];

Users.isAuthorized = function(user, roles, scope) {
  check(user, Object);
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  if (Roles.userIsInRole(user, ["developer"], scope))
    return !roles.some(role => role === "child_chat");
  else return Roles.userIsInRole(user, roles, scope);
};

Users.addLoginHook = function(f) {
  Meteor.startup(function() {
    loginHooks.push(f);
  });
};

Users.addLogoutHook = function(f) {
  Meteor.startup(function() {
    logoutHooks.push(f);
  });
};

function runLoginHooks(context, user, connection) {
  loginHooks.forEach(f => f.call(context, user, connection));
}

function runLogoutHooks(context, user) {
  logoutHooks.forEach(f => f.call(context, user));
}

Meteor.startup(function() {
  const users = Meteor.users
    .find({ isolation_group: { $exists: false } }, { fields: { _id: 1 } })
    .fetch();
  Roles.createRole("kibitz", { unlessExists: true });
  Roles.createRole("room_chat", { unlessExists: true });
  Roles.createRole("personal_chat", { unlessExists: true });
  Roles.addUsersToRoles(users, ["kibitz", "room_chat", "personal_chat"]);
  const loggedin_users = Meteor.users
    .find({ "status.online": true }, { fields: { _id: 1 } })
    .fetch()
    .map(user => user._id);
  LoggedOnUsers.remove({ userid: { $nin: loggedin_users } });
  Meteor.users.update(
    { isolation_group: { $exists: false } },
    { $set: { isolation_group: "public" }, $unset: { groups: 1, limit_to_group: 1 } }
  );
  if (Meteor.isTest || Meteor.isAppTest) {
    Users.runLoginHooks = runLoginHooks;
    Users.ruLogoutHooks = runLogoutHooks;
  } else {
    UserStatus.events.on("connectionLogin", fields => {
      log.debug(
        "connectionLogin userId=" +
          fields.userId +
          ", connectionId=" +
          fields.connectionId +
          ", ipAddr=" +
          fields.ipAddr +
          ", userAgent=" +
          fields.userAgent +
          ", loginTime=" +
          fields.loginTime
      );
      Meteor.users.update({ _id: fields.userId }, { $set: { "status.game": "none" } });
      const user = Meteor.users.findOne({ _id: fields.userId });
      runLoginHooks(this, user, fields.connectionId);
    });
    UserStatus.events.on("connectionLogout", fields => {
      log.debug(
        "connectionLogout userId=" +
          fields.userId +
          ", connectionId=" +
          fields.connectionId +
          ", lastActivity=" +
          fields.lastActivity +
          ", logoutTime=" +
          fields.logoutTime
      );
      LoggedOnUsers.remove({ userid: fields.userId });
      runLogoutHooks(this, fields.userId);
    });
    UserStatus.events.on("connectionIdle", fields => {
      log.debug(
        "connectionIdle userId=" +
          fields.userId +
          ", connectionId=" +
          fields.connectionId +
          ", lastActivity=" +
          fields.lastActivity
      );
    });
    UserStatus.events.on("connectionActive", fields => {
      log.debug(
        "connectionActive userId=" +
          fields.userId +
          ", connectionId=" +
          fields.connectionId +
          ", lastActivity=" +
          fields.lastActivity
      );
    });
  }
  all_roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
});

Accounts.validateLoginAttempt(function(params) {
  log.debug(
    "validateLoginAttempt " +
      (!params.user ? "no user" : params.user.username + "/" + params.user._id)
  );
  // params.type = service name
  // params.allowed = t/f
  // params.user
  // params.connection
  // params.methodName
  // params.methodArguments
  if (!params.allowed) return false;
  if (!params.user) return false;

  //
  // Set the users locale from the http headers if they don't already have one set.
  //
  if (!params.user.locale || params.user.locale === "unknown") {
    const httpHeaders = params.connection.httpHeaders || {};
    const acceptLanguage = (httpHeaders["accept-language"] || "en-us")
      .split(/[,;]/)[0]
      .toLocaleLowerCase()
      .replace("_", "-");
    Meteor.users.update({ _id: params.user._id }, { $set: { locale: acceptLanguage } });
    params.user.locale = acceptLanguage;
  }

  //
  // We have no choice near as I can tell but to implement this hack. We cannot set roles for a user
  // that doesn't exist yet, so instead we just set "newguy" in the account creation, and upon the first
  // login, we get here, where we delete that, and fill in the users roles.
  //
  if (params.user.newguy) {
    Meteor.users.update({ _id: params.user._id }, { $unset: { newguy: 1 } });
    Roles.addUsersToRoles(params.user, standard_member_roles);
  }

  //
  // If the user is not being allowed to login, fail, and say so
  //
  if (!Users.isAuthorized(params.user, "login")) {
    const message = i18n.localizeMessage(params.user.locale || "en-us", "LOGIN_FAILED_12");
    throw new Meteor.Error(401, message);
  }

  //
  // If the user has already logged in, disallow subsequent logins.
  // Why this damn piece of code has decided to validate the same login twice in a row is BEYOND ME
  // ARGH ARGH ARGH ARGH -- But check to make sure if the record exists, it's the same connection id
  //
  const lou = LoggedOnUsers.findOne({ userid: params.user._id });
  if (!!lou && lou.connection.connection.id !== params.connection.id) {
    log.error("Duplicate login by " + params.user.username + "/" + params.user._id);
    const message = i18n.localizeMessage(params.user.locale || "en-us", "LOGIN_FAILED_DUP");
    throw new Meteor.Error(401, message);
  }
  LoggedOnUsers.insert({ userid: params.user._id, connection: params.connection });
  return true;
});
