import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { all_roles, fields_viewable_by_account_owner, standard_member_roles, viewable_logged_on_user_fields } from "../server/userConstants";
import { encrypt } from "../../lib/server/encrypt";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../../lib/server/Logger";
import { i18n } from "./i18n";
import { DynamicRatings } from "../../server/DynamicRatings";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";

let log = new Logger("server/users_js");

export const Users = {};

Meteor.publishComposite("loggedOnUsers", {
  find() {
    return Meteor.users.find({ _id: this.userId, "status.online": true }, { fields: { isolation_group: 1, _id: 1, username: 1 } });
  },
  children: [
    {
      // We are going to leave this here to reinstate publishComposite with isolation groups
      find(user) {
        if (!Users.isAuthorized(user, "show_users")) return Meteor.users.find({ _id: "invalid" });
        else {
          return Meteor.users.find({ $and: [{ "status.online": true }, { _id: { $ne: user._id } }, { isolation_group: user.isolation_group }] }, { fields: viewable_logged_on_user_fields });
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

    if (options.profile.legacy && (options.profile.legacy.username || options.profile.legacy.password))
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
  user.roles = [];
  standard_member_roles.forEach(role => user.roles.push({ _id: role, scope: null, assigned: true }));

  if (!user.status) user.status = {};
  user.status.game = "none";
  user.isolation_group = "public";

  return user;
});

Users.setGameStatus = function(message_identifier, user, status) {
  check(message_identifier, String);
  check(user, Match.OneOf(Object, String));
  check(status, String);

  if (typeof user === "object") user = user._id;

  if (["examining", "observing", "playing", "none"].indexOf(status) === -1) throw new ICCMeteorError(message_identifier, "Unable to set users game status", "Invalid status");
  Meteor.users.update({ _id: user, "status.online": true }, { $set: { "status.game": status } });
};

const group_change_hooks = [];

Users.addGroupChangeHook = function(func) {
  Meteor.startup(() => group_change_hooks.push(func));
};

Accounts.onLogin(function(user_parameter) {
  const user = user_parameter.user;
  const connection = user_parameter.connection;
  Meteor.users.update({ _id: user._id }, { $set: { "status.game": "none" } });

  log.debug("user record", user);
  runLoginHooks(this, user, connection);
});

const loginHooks = [];
const logoutHooks = [];

Users.isAuthorized = function(user, roles, scope) {
  check(user, Object);
  check(roles, Match.OneOf(Array, String));
  if (!Array.isArray(roles)) roles = [roles];
  roles.push("developer");
  return Roles.userIsInRole(user, roles, scope);
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
  const users = Meteor.users.find({ isolation_group: { $exists: false } }, { fields: { _id: 1 } }).fetch();
  Roles.createRole("kibitz", { unlessExists: true });
  Roles.createRole("room_chat", { unlessExists: true });
  Roles.createRole("personal_chat", { unlessExists: true });
  Roles.addUsersToRoles(users, ["kibitz", "room_chat", "personal_chat"]);
  Meteor.users.update({ isolation_group: { $exists: false } }, { $set: { isolation_group: "public" }, $unset: { groups: 1, limit_to_group: 1 } });
  if (Meteor.isTest || Meteor.isAppTest) {
    Users.runLoginHooks = runLoginHooks;
    Users.ruLogoutHooks = runLogoutHooks;
  } else {
    // Do not do this in test.
    Meteor.users.find({ "status.online": true }).observeChanges({
      changed(id, fields) {
        if (!!fields.status && fields.status.online !== undefined && !fields.status.online) {
          runLogoutHooks(this, id);
        }
      },
      removed(id) {
        runLogoutHooks(this, id);
      }
    });
  }
  all_roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
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
  if (!params.user.locale || params.user.locale === "unknown") {
    const httpHeaders = params.connection.httpHeaders || {};
    const acceptLanguage = (httpHeaders["accept-language"] || "en-us")
      .split(/[,;]/)[0]
      .toLocaleLowerCase()
      .replace("_", "-");
    Meteor.users.update({ _id: params.user._id }, { $set: { locale: acceptLanguage } });
    params.user.locale = acceptLanguage;
  }

  if (!Users.isAuthorized(params.user, "login")) {
    const message = i18n.localizeMessage(params.user.locale || "en-us", "LOGIN_FAILED_12");
    throw new Meteor.Error(message);
  }

  return true;
});

// User methods: update fingerprint
Meteor.methods({
  updateFingerprint(fingerprint) {
    check(fingerprint, Object);
    this.unblock();
    // Retrieve current fingerprint
    const userId = Meteor.userId();
    const user = Meteor.users.findOne({ _id: userId }, { fields: { fingerprint: true } });

    // If no fingerprint, store it
    if (user && !user.fingerprint) {
      Meteor.users.update({ _id: userId }, { $set: { fingerprint } });
      return;
    }

    // If fingerprint is different, throw error and update the      fingerprint
    // On the client side, it will logout other users
    if (user && user.fingerprint !== fingerprint) {
      Meteor.users.update({ _id: userId }, { $set: { fingerprint } });
      throw new Meteor.Error("multiple-logins");
    }
  }
});
