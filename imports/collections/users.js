import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import {
  all_roles,
  fields_viewable_by_account_owner,
  standard_member_roles
} from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";
import { i18n } from "./i18n";
import { DynamicRatings } from "../../server/DynamicRatings";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";
import { UserStatus } from "meteor/mizzao:user-status";
import { SystemConfiguration } from "./SystemConfiguration";

const log = new Logger("server/users_js");

export const Users = {};
const LoggedOnUsers = new Mongo.Collection("loggedon_users");
const ConfigurationParametersByHost = new Mongo.Collection("host_configuration");

Meteor.publish("userData", function() {
  if (!this.userId) return this.ready();

  log.debug("User " + this.userId + " has arrived");
  return [
    Meteor.users.find({ _id: this.userId }, { fields: fields_viewable_by_account_owner }),
    Meteor.roleAssignment.find({ "user._id": this.userId })
  ];
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
  user.board_css = SystemConfiguration.defaultBoardCSS();
  user.newguy = true;

  if (!user.status) user.status = {};
  user.status.game = "none";

  return user;
});

Users.sendClientMessage = function(who, message_identifier, what) {
  if (!global._clientMessages) {
    log.error(
      "Trying to send a client message, but the variable is null: who=" +
        who +
        ", message_identifier=" +
        message_identifier +
        ", what=" +
        what
    );
    return;
  }
  global._clientMessages.sendMessageToClient(who, message_identifier, what);
};

Users.setGameStatus = function(message_identifier, user, status) {
  log.debug("setGameStatus", [message_identifier, user, status]);
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
  Meteor.startup(() => {
    group_change_hooks.push(func);
  });
};

const loginHooks = [];
const logoutHooks = [];

Users.addUserToRoles = function(user, roles, options) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.some(r => r === "child_chat");
  const cce = roles.some(r => r === "child_chat_exempt");

  roles = roles.filter(e => e !== "child_chat" && e !== "child_chat_exempt");

  if (!!roles.length) Roles.addUsersToRoles(user, roles, options);

  const id = typeof user === "string" ? user : user._id;
  if (cc || cce) Meteor.users.update({ _id: id }, { $set: { cf: cc ? "c" : "e" } });
};

Users.removeUserFromRoles = function(user, roles, options) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.indexOf("child_chat");
  const cce = roles.indexOf("child_chat_exempt");

  roles = roles.filter(e => e !== "child_chat" && e !== "child_chat_exempt");

  if (!!roles.length) Roles.removeUsersFromRoles(user, roles, options);

  const id = typeof user === "string" ? user : user._id;
  if (cc || cce) Meteor.users.update({ _id: id }, { $unset: { cf: 1 } });
};

Users.isAuthorized = function(user, roles, scope) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.some(r => r === "child_chat");
  const cce = roles.some(r => r === "child_chat_exempt");

  if (cc || cce) roles = roles.filter(e => e !== "child_chat" && e !== "child_chat_exempt");

  if (Roles.userIsInRole(user, ["developer"], scope)) return !cc;

  if (roles.length && Roles.userIsInRole(user, roles, scope)) return true;

  const id = typeof user === "string" ? user : user._id;
  if (cc && !!Meteor.users.findOne({ _id: id, cf: "c" }).count()) return true;
  return cce && !!Meteor.users.findOne({ _id: id, cf: "e" }).count();
};

Users.listIsolationGroups = function(message_identifier) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);

  if (!Users.isAuthorized(self, "list_isolation_groups")) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return [];
  }
  // Of course this doesn't work.
  // return Meteor.users.distinct("isolation_group");
  const groups = [];
  Meteor.users.find({}, { fields: { isolation_group: 1 } }).forEach(result => {
    if (groups.indexOf(result.isolation_group) === -1) groups.push(result.isolation_group);
  });
  return groups;
};

Users.listUsers = function(message_identifier, offset, count, searchString) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(offset, Number);
  check(count, Number);
  let selector = {};
  let authorized = Users.isAuthorized(self, "list_users");
  if (!authorized) {
    authorized = Users.isAuthorized(self, "list_users", self.isolation_group);
    if (!authorized) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return [];
    }
    selector.isolation_group = self.isolation_group;
  }
  if (!!searchString) {
    const escapedSearchString = new RegExp(
      searchString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
      "i"
    );
    const searchpart = {
      $or: [{ username: escapedSearchString }, { "emails.address": escapedSearchString }]
    };
    if (!!Object.keys(selector).length) selector = { $and: [selector, searchpart] };
    else selector = searchpart;
  }

  const test = Meteor.users.find(selector, { skip: offset, limit: count }).fetch();
  return test;
};

Users.deleteUser = function(message_identifier, userId) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(userId, String);

  let victim = Meteor.users.findOne({ _id: userId });
  if (!victim || victim._id === self._id) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  let authorized = Users.isAuthorized(self, "delete_users");
  if (!authorized) {
    authorized = Users.isAuthorized(self, "delete_users", self.isolation_group);
    if (!authorized || self.isolation_group !== victim.isolation_group) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }
  }
  Meteor.users.remove({ _id: userId });
};

Users.getConnectionFromUser = function(user_id) {
  const lou = LoggedOnUsers.findOne({ uerid: user_id });
  if (!lou) return;
  return lou.connection.id;
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
          ", ipAddr=" +
          fields.ipAddr +
          ", userAgent=" +
          fields.userAgent +
          ", loginTime=" +
          fields.loginTime
      );
      Meteor.users.update({ _id: fields.userId }, { $set: { "status.game": "none" } });
      LoggedOnUsers.remove({ userid: fields.userId });
      runLogoutHooks(this, fields.userId, fields.connectionId);
    });
    // UserStatus.events.on("connectionIdle", fields => {
    //   log.debug(
    //     "connectionIdle userId=" +
    //       fields.userId +
    //       ", connectionId=" +
    //       fields.connectionId +
    //       ", lastActivity=" +
    //       fields.lastActivity
    //   );
    // });
    // UserStatus.events.on("connectionActive", fields => {
    //   log.debug(
    //     "connectionActive userId=" +
    //       fields.userId +
    //       ", connectionId=" +
    //       fields.connectionId +
    //       ", lastActivity=" +
    //       fields.lastActivity
    //   );
    // });
  }
  all_roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
});

Accounts.validateLoginAttempt(function(params) {
  log.debug("validateLoginAttempt", params);
  // params.type = service name
  // params.allowed = t/f
  // params.user
  // params.connection
  // params.methodName
  // params.methodArguments
  if (!params.allowed) {
    log.debug("validateLoginAttempt not allowed");
    return false;
  }
  if (!params.user) {
    log.debug("validateLoginAttempt no user");
    return false;
  }

  //
  // Set the users locale from the http headers if they don't already have one set.
  //
  if (!params.user.locale || params.user.locale === "unknown") {
    log.debug("validateLoginAttempt updating locale");
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
    log.debug("validateLoginAttempt updating roles for new user");
    const isolation_group_by_host = ConfigurationParametersByHost.findOne({
      host: params.connection.httpHeaders.host
    });
    const isolation_group = (isolation_group_by_host || {}).isolation_group || "public";
    const child_chat = isolation_group_by_host?.child_chat;
    const setObject = { isolation_group: isolation_group };
    if (child_chat) setObject.cf = child_chat;
    Meteor.users.update({ _id: params.user._id }, { $unset: { newguy: 1 }, $set: setObject });
    Users.addUserToRoles(params.user, standard_member_roles);
  }

  //
  // If the user is not being allowed to login, fail, and say so
  //
  if (!Users.isAuthorized(params.user, "login")) {
    log.error("validateLoginAttempt login not allowed for " + params.user.username);
    const message = i18n.localizeMessage(params.user.locale || "en-us", "LOGIN_FAILED_12");
    throw new Meteor.Error("401", message);
  }

  //
  // If the user has already logged in, disallow subsequent logins.
  //
  const lou = LoggedOnUsers.findOne({ userid: params.user._id });
  log.debug("validateLoginAttempt lou", lou);

  // const resumeToken = params?.methodArguments[0]?.resume;
  // const hash = Accounts._hashLoginToken(resumeToken || "");
  //
  if (!!lou) {
    if (lou.connection.id !== params.connection.id) {
      log.error(
        "Duplicate login by " +
          params.user.username +
          "/" +
          params.user._id +
          " on connection " +
          params.connection.id +
          " when lou says are are already logged on to connection " +
          lou.connection.id
      );
      const message = i18n.localizeMessage(params.user.locale || "en-us", "LOGIN_FAILED_DUP");
      LoggedOnUsers.remove({ userid: params.user._id });
      Meteor.users.update(
        { _id: params.user._id },
        { $set: { "services.resume.loginTokens": [] } }
      );
      throw new Meteor.Error("401", message);
    }
  } else LoggedOnUsers.insert({ userid: params.user._id, connection: params.connection });
  log.debug("validateLoginAttempt succeeded");
  return true;
});

Meteor.methods({
  getPartialUsernames: function(prefix) {
    log.debug("Meteor.methods getPartialUsernames", prefix);
    check(prefix, String);
    check(this.userId, String);
    if (prefix.length === 0) return [];
    return Meteor.users
      .find({ username: { $regex: "^" + prefix } }, { fields: { username: 1 } })
      .fetch()
      .map(rec => rec.username);
  }
});
