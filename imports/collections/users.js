import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { EventEmitter } from "events";
import { get } from "lodash";

import {
  all_roles,
  fields_viewable_by_account_owner,
  standard_member_roles,
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
const LogonHistory = new Mongo.Collection("logon_history");
const ConfigurationParametersByHost = new Mongo.Collection("host_configuration");
const statusEvents = new EventEmitter();

Meteor.publishComposite("developer_loggedon_users", {
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return LoggedOnUsers.find();
      },
    },
  ],
});

Meteor.publishComposite("developer_all_users", {
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return Meteor.users.find();
      },
    },
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return Meteor.roleAssignment.find();
      },
    },
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return Meteor.roles.find();
      },
    },
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return LogonHistory.find();
      },
    },
  ],
});

Meteor.users.deny({
  update() {
    return true;
  },
});

Meteor.publish(null, function () {
  if (!this._session) return this.ready();

  if (!this.userId) {
    Users.tryLogout(this._session.connectionHandle.id);
    return this.ready();
  }
  return [
    Meteor.users.find({ _id: this.userId }, { fields: fields_viewable_by_account_owner }),
    Meteor.roleAssignment.find({ "user._id": this.userId }),
  ];
});

export const default_settings = {
  autoaccept: true,
  premove: false,
};

Accounts.onCreateUser(function (options, user) {
  if (options.profile) {
    user.profile = {
      firstname: options.profile.firstname || "?",
      lastname: options.profile.lastname || "?",
    };

    if (
      options.profile.legacy &&
      (options.profile.legacy.username || options.profile.legacy.password)
    )
      user.profile.legacy = {
        username: options.profile.legacy.username,
        validated: false,
        password: encrypt(options.profile.legacy.password),
        autologin: true,
      };
  }

  user.ratings = DynamicRatings.getUserRatingsObject();
  user.settings = default_settings;
  user.settings.match_default = SystemConfiguration.matchDefault();
  user.settings.seek_default = SystemConfiguration.seekDefault();
  user.locale = "unknown";
  user.newguy = true;

  if (!user.status) user.status = {};
  user.status.game = "none";
  user.status.client = "none";

  return user;
});

Users.sendClientMessage = function (who, message_identifier, what) {
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

Users.setClientStatus = function (message_identifier, user, status) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(user, Match.Maybe(String));
  check(status, String);
  if (!!user && user !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to set client status",
      "Setting another users client status is not currently supported"
    );
  // Cannot change the client status away from "game" if user is currently playing a game
  if (self.status.game === "playing") {
    if (status !== "game")
      Users.sendClientMessage(self, message_identifier, "INVALID_PLAYING_STATUS");
    return;
  } else if (status === "game") {
    // Only the game file can set a client status of "game"
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }
  Meteor.users.update({ _id: self._id }, { $set: { "status.client": status } });
};

Users.setBoardProfile = function () {};

Users.setGameStatus = function (message_identifier, user, status) {
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
  const setObject = { "status.game": status };
  if (status === "none") setObject["status.client"] = "none";
  else setObject["status.client"] = "game";
  Meteor.users.update({ _id: user }, { $set: setObject });
};

const group_change_hooks = [];

Users.addGroupChangeHook = function (func) {
  Meteor.startup(() => {
    group_change_hooks.push(func);
  });
};

Users.addUserToRoles = function (user, roles, options) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.some((r) => r === "child_chat");
  const cce = roles.some((r) => r === "child_chat_exempt");

  roles = roles.filter((e) => e !== "child_chat" && e !== "child_chat_exempt");

  if (!!roles.length) Roles.addUsersToRoles(user, roles, options);

  const id = typeof user === "string" ? user : user._id;
  if (cc || cce) Meteor.users.update({ _id: id }, { $set: { cf: cc ? "c" : "e" } });
};

Users.removeUserFromRoles = function (user, roles, options) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.indexOf("child_chat");
  const cce = roles.indexOf("child_chat_exempt");

  roles = roles.filter((e) => e !== "child_chat" && e !== "child_chat_exempt");

  if (!!roles.length) Roles.removeUsersFromRoles(user, roles, options);

  const id = typeof user === "string" ? user : user._id;
  if (cc || cce) Meteor.users.update({ _id: id }, { $unset: { cf: 1 } });
};

Users.isAuthorized = function (user, roles, scope) {
  check(user, Match.OneOf(Object, String));
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];

  const cc = roles.some((r) => r === "child_chat");
  const cce = roles.some((r) => r === "child_chat_exempt");

  if (cc || cce) roles = roles.filter((e) => e !== "child_chat" && e !== "child_chat_exempt");

  if (Roles.userIsInRole(user, ["developer"], scope)) return !cc;

  if (roles.length && Roles.userIsInRole(user, roles, scope)) return true;

  const id = typeof user === "string" ? user : user._id;
  if (cc && !!Meteor.users.findOne({ _id: id, cf: "c" }).count()) return true;
  return cce && !!Meteor.users.findOne({ _id: id, cf: "e" }).count();
};

Users.listIsolationGroups = function (message_identifier) {
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
  Meteor.users.find({}, { fields: { isolation_group: 1 } }).forEach((result) => {
    if (groups.indexOf(result.isolation_group) === -1) groups.push(result.isolation_group);
  });
  return groups;
};

Users.listUsers = function (message_identifier, offset, count, searchString) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(offset, Number);
  check(count, Number);

  const fields = {
    _id: 1,
    createdAt: 1,
    emails: 1,
    locale: 1,
    profile: 1,
    ratings: 1,
    settings: 1,
    status: 1,
    username: 1,
  };
  let selector = {};
  let authorized = Users.isAuthorized(self, "list_users");
  if (!authorized) {
    authorized = Users.isAuthorized(self, "list_users", self.isolation_group);
    if (!authorized) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return { userList: [], totalCount: 0 };
    } else selector.isolation_group = self.isolation_group;
  } else fields.isolation_group = 1;
  if (!!searchString) {
    const escapedSearchString = new RegExp(
      searchString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),
      "i"
    );
    const searchpart = {
      $or: [{ username: escapedSearchString }, { "emails.address": escapedSearchString }],
    };
    if (!!Object.keys(selector).length) selector = { $and: [selector, searchpart] };
    else selector = searchpart;
  }

  return {
    userList: Meteor.users
      .find(selector, { skip: offset, limit: count, fields: fields, sort: { username: 1 } })
      .fetch(),
    totalCount: Meteor.users.find(selector).count(),
  };
};

Users.deleteUser = function (message_identifier, userId) {
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

Users.addRole = function (message_identifier, user, role, scope) {
  check(message_identifier, String);
  check(user, String);
  check(role, String);
  check(scope, Match.Maybe(String));

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "set_role_" + role, scope)) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  const victim = Meteor.users.findOne({ _id: user });
  if (!victim || (!!scope && victim.isolation_group !== scope)) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  Users.addUserToRoles(user, role, scope);
};

Users.removeRole = function (message_identifier, user, role, scope) {
  check(message_identifier, String);
  check(user, String);
  check(role, String);
  check(scope, Match.Maybe(String));

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "set_role_" + role, scope)) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  const victim = Meteor.users.findOne({ _id: user });
  if (!victim || (!!scope && victim.isolation_group !== scope)) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  Users.removeUserFromRoles(user, role, scope);
};

// TODO: This really should come out. Once we the mail server running, we need to simply
//       allow users to send reset emails to users. Two disparate users should really never
//       know the password to the same account.
Users.setOtherPassword = function (message_identifier, user_id, new_password) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(user_id, String);
  check(new_password, String);

  const victim = Meteor.users.findOne({ _id: user_id });
  if (!victim) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  if (!Users.isAuthorized(self, "set_other_password")) {
    if (
      self.isolation_group !== victim.isolation_group ||
      !Users.isAuthorized(self, "set_other_password", self.isolation_group)
    ) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }
  }

  if (!new_password || !new_password.length) {
    Users.sendClientMessage(self, message_identifier, "INVALID_PASSWORD");
    return;
  }

  Accounts.setPassword(user_id, new_password);
};

Users.setOtherIsolationGroup = function (message_identifier, user_id, new_isolation_group) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(user_id, String);
  check(new_isolation_group, String);

  const victim = Meteor.users.findOne({ _id: user_id });
  if (!victim) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  if (!Users.isAuthorized(self, "set_other_isolation_group")) {
    if (
      self.isolation_group !== victim.isolation_group ||
      !Users.isAuthorized(self, "set_other_isolation_group", self.isolation_group)
    ) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }
  }

  if (!new_isolation_group || !new_isolation_group.length) {
    Users.sendClientMessage(self, message_identifier, "INVALID_PASSWORD");
    return;
  }

  Meteor.users.update({ _id: user_id }, { $set: { isolation_group: new_isolation_group } });
};

Users.setOtherUsername = function (message_identifier, user_id, new_username) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(user_id, String);
  check(new_username, String);

  const victim = Meteor.users.findOne({ _id: user_id });
  if (!victim) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  if (!Users.isAuthorized(self, "set_other_username")) {
    if (
      self.isolation_group !== victim.isolation_group ||
      !Users.isAuthorized(self, "set_other_username", self.isolation_group)
    ) {
      Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }
  }

  if (!new_username || !new_username.length) {
    Users.sendClientMessage(self, message_identifier, "INVALID_USERNAME");
    return;
  }

  Accounts.setUsername(user_id, new_username);
};

Users.updateCurrentUsername = function (message_identifier, username) {
  const self = Meteor.user();

  check(self, Object);
  check(message_identifier, String);
  check(username, String);

  if (!Users.isAuthorized(self, "change_username")) {
    Users.sendClientMessage(self, message_identifier, "USERNAME_NOT_AUTHORIZED");
    return;
  }

  try {
    Accounts.setUsername(self._id, username);
    Users.sendClientMessage(self, message_identifier, "NAME_WAS_CHANGED");
  } catch (e) {
    log.error("Unable to change username", e);
    Users.sendClientMessage(self, message_identifier, "UNABLE_TO_CHANGE_USERNAME");
  }
};

Users.addTitle = function (message_identifier, user_id, newtitle) {};

Users.removeTitle = function (message_identifier, user_id, oldtitle) {};

Users.setTitles = function (message_identifier, user_id, titlearray) {};

Users.updateCurrentEmail = function (message_identifier, email) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(email, String);

  if (!Users.isAuthorized(self, "change_email")) {
    Users.sendClientMessage(self, message_identifier, "NOT_AUTHORIZED");
    return;
  }

  try {
    const currentEmail = get(self, "emails[0].address");
    Accounts.addEmail(self._id, email);
    const self2 = Meteor.users.findOne({ _id: self._id });
    if (self2.emails.length === 2 && self2.emails.some((e) => e.address === email)) {
      Accounts.removeEmail(self._id, currentEmail);
      Users.sendClientMessage(self, message_identifier, "EMAIL_WAS_CHANGED");
    } else Users.sendClientMessage(self, message_identifier, "EMAIL_WAS_ADDED");
  } catch (e) {
    log.error("Unable to change email address", e);
    Users.sendClientMessage(self, message_identifier, "UNABLE_TO_CHANGE_EMAIL");
  }
};

Users.getConnectionFromUser = function (user_id) {
  const lou = LoggedOnUsers.findOne({ user_id: user_id });
  if (!lou) return;
  return lou.connection_id;
};

Users.tryLogout = function (connectionId) {
  LogonHistory.update(
    { connection_id: connectionId },
    {
      $set: { logoff_date: new Date() },
      $unset: { connection_id: 1 },
    },
    { multi: true }
  );

  const lou = LoggedOnUsers.findOne({ connection_id: connectionId });

  if (!!lou) {
    LoggedOnUsers.remove({ _id: lou._id });

    if (!LoggedOnUsers.find({ user_id: lou.user_id }).count())
      statusEvents.emit("userLogout", { userId: lou.user_id });
  }
};

Users.checkLoggedOnUsers = function (connection_id_array) {
  const dt = new Date();
  dt.setMinutes(dt.getMinutes() - 5);
  LoggedOnUsers.find({
    $and: [
      { connection_id: { $exists: true } },
      { connection_id: { $nin: connection_id_array } },
      { logon_date: { $lt: dt } },
    ],
  }).forEach((balu) => {
    log.error(
      "Bad logged on user record for connection " + balu.connection_id + ", user " + balu.user_id
    );
    Users.tryLogout(balu.connection_id);
  });
};

Users.developerEmailUpdate = function (user_id, op, email, verified) {
  const self = Meteor.user();
  check(self, Object);
  check(user_id, String);
  check(op, String);
  check(email, String);
  check(verified, Match.Maybe(Boolean));

  if (!Users.isAuthorized(self, "developer")) throw new Meteor.Error("You are not authorized");

  const victim = Meteor.users.findOne({ _id: user_id });
  if (!victim) throw new Meteor.Error("Cannot find the user to update");

  switch (op) {
    case "add":
      Accounts.addEmail(victim._id, email);
      break;
    case "remove":
      Accounts.removeEmail(victim._id, email);
      break;
    case "toggle":
      Meteor.users.update(
        { _id: victim._id, "emails.address": email },
        { "emails.$.verified": verified || false }
      );
      break;
    default:
      throw new Meteor.error("Unable to alter email", "Unknown operation '" + op + "'");
  }
};

Users.developerUserUpdate = function (client_state) {
  const self = Meteor.user();
  check(self, Object);
  check(client_state, Object);

  if (!Users.isAuthorized(self, "developer")) throw new Meteor.Error("You are not authorized");

  const victim = Meteor.users.findOne({ _id: client_state.user });
  if (!victim) throw new Meteor.Error("Cannot find the user to update");

  const set = {};
  const unset = {};

  if (!!client_state.base) {
    if (!!client_state.base.username) Accounts.setUsername(victim._id, client_state.base.username);
    if (!!client_state.base.password) Accounts.setPassword(victim._id, client_state.base.password);
    if (!!client_state.base.cf) {
      if (client_state.base.cf === "d") unset.cf = 1;
      else if (client_state.base.cf === "c" || client_state.base.cf === "e") {
        set.cf = client_state.base.cf;
      } else throw new Meteor.Error("Invalid child chat value");
    }
    if (!!client_state.base.isolation_group)
      set.isolation_group = client_state.base.isolation_group;
    if (!!client_state.base.settings) {
      Object.keys(client_state.base.settings).forEach((key) => {
        set["settings." + key] = client_state.base.settings[key];
      });
    }
  }

  const modifier = {};
  if (!!Object.keys(set).length) modifier.$set = set;
  if (!!Object.keys(unset).length) modifier.$unset = unset;
  if (!!Object.keys(modifier).length) {
    Meteor.users.update({ _id: victim._id }, modifier);
  }
};

Users.developerUpdateRole = function (user_id, role, type) {
  const self = Meteor.user();
  check(self, Object);
  check(user_id, String);
  check(role, String);
  check(type, String);

  if (!Users.isAuthorized(self, "developer")) throw new Meteor.Error("You are not authorized");

  const victim = Meteor.users.findOne({ _id: user_id });
  if (!victim) throw new Meteor.Error("Cannot find the user to update");

  Roles.removeUsersFromRoles(victim._id, role, victim.isolation_group);
  Roles.removeUsersFromRoles(victim._id, role);

  switch (type) {
    case "No":
      break;
    case "Global":
      Roles.addUsersToRoles(victim._id, role);
      break;
    case "Group only":
      Roles.addUsersToRoles(victim._id, role, victim.isolation_group);
      break;
    default:
      throw new Meteor.Error(
        "Unable to set role " + role + " correctly",
        type + " is an unknown type"
      );
  }
};

Users.events = statusEvents;

Meteor.startup(function () {
  const users = Meteor.users
    .find({ isolation_group: { $exists: false } }, { fields: { _id: 1 } })
    .fetch();
  Roles.createRole("kibitz", { unlessExists: true });
  Roles.createRole("room_chat", { unlessExists: true });
  Roles.createRole("personal_chat", { unlessExists: true });
  Roles.addUsersToRoles(users, ["kibitz", "room_chat", "personal_chat"]);
  Meteor.users.update(
    { isolation_group: { $exists: false } },
    { $set: { isolation_group: "public" }, $unset: { groups: 1, limit_to_group: 1 } }
  );

  if (!Meteor.isTest && !Meteor.isAppTest) {
    UserStatus.events.on("connectionLogin", (fields) => {
      const loginCount = LoggedOnUsers.find({ user_id: fields.userId }).count();
      LoggedOnUsers.upsert(
        {
          user_id: fields.userId,
          connection_id: fields.connectionId,
        },
        {
          $set: {
            ip_address: fields.ipAddr,
            logon_date: fields.loginTime,
            userAgent: fields.userAgent,
          },
        }
      );
      LogonHistory.upsert(
        { user_id: fields.userId, connection_id: fields.connectionId },
        {
          $set: {
            user_id: fields.userId,
            connection_id: fields.connectionId,
            ip_address: fields.ipAddr,
            logon_date: fields.loginTime,
            userAgent: fields.userAgent,
          },
        }
      );

      if (!loginCount) statusEvents.emit("userLogin", { userId: fields.userId });
    });

    UserStatus.events.on("connectionLogout", (fields) => {
      Users.tryLogout(fields.connectionId);
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
  all_roles.forEach((role) => {
    Roles.createRole(role, { unlessExists: true });
    Roles.createRole("set_role_" + role, { unlessExists: true });
  });
});

Accounts.validateLoginAttempt(function (params) {
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
    const isolation_group_by_host = ConfigurationParametersByHost.findOne({
      host: params.connection.httpHeaders.host,
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

  if (params.type === "resume") {
    const resumeToken = params?.methodArguments[0]?.resume;
    if (resumeToken) {
      const userId = params?.user?._id;
      if (userId) {
        // We need to compare the hash of the resume token since that is what is stored in DB
        //@ts-ignore
        const hash = Accounts._hashLoginToken(resumeToken);
        const user = Meteor.users.findOne({ _id: userId });

        // Check that user exists
        if (user) {
          // Only allow token reuse if user has the resume token in their stored resume tokens, and also that it is the only token
          const tokenReuseAllowed =
            user?.services?.resume?.loginTokens?.find((token) => token.hashedToken === hash) &&
            user?.services?.resume?.loginTokens?.length === 1;
          // If token reuse is not allowed, we should remove all existing tokens to log out other clients
          if (!tokenReuseAllowed) {
            Meteor.users.update({ _id: userId }, { $set: { "services.resume.loginTokens": [] } });
          }
        }
      }
    }
  }
  // If user is logging in with password, then we should just remove all existing resume tokens
  else if (params.type === "password") {
    const userId = params?.user?._id;
    if (userId) {
      Meteor.users.update({ _id: userId }, { $set: { "services.resume.loginTokens": [] } });
    }
  }
  LogonHistory.upsert(
    { user_id: params?.user?._id, connection_id: params?.connection?.id },
    {
      $set: {
        user_id: params?.user?._id,
        connection_id: params?.connection?.id,
        ip_address: params?.connection?.httpHeaders["x-forwarded-for"],
        logon_date: new Date(),
        userAgent: params?.connection?.httpHeaders["user-agent"],
      },
    }
  );
  return true;
});

Meteor.methods({
  setBoardProfile: Users.setBoardProfile,
  setClientStatus: Users.setClientStatus,
  setOtherPassword: Users.setOtherPassword,
  setOtherIsolationGroup: Users.setOtherIsolationGroup,
  setOtherUsername: Users.setOtherUsername,
  addRole: Users.addRole,
  removeRole: Users.removeRole,
  updateCurrentUsername: Users.updateCurrentUsername,
  updateCurrentEmail: Users.updateCurrentEmail,
  listUsers: Users.listUsers,
  listIsolationGroups: Users.listIsolationGroups,
  developer_user_update: Users.developerUserUpdate,
  developer_email_update: Users.developerEmailUpdate,
  developer_update_role: Users.developerUpdateRole,
});
