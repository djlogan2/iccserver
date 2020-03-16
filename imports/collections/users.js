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

let log = new Logger("server/users_js");

export const Users = {};

Meteor.publishComposite("loggedOnUsers", function() {
  return {
    find() {
      return Meteor.users.find(
        { _id: this.userId, "status.online": true },
        { fields: fields_viewable_by_account_owner }
      );
    },
    children: [
      {
        find(user) {
          const find = {};
          if (!Users.isAuthorized(user, "show_users")) return [];
          else if (user.limit_to_group) {
            find["status.online"] = true;
            find["groups"] = { $in: user.groups };
          } else {
            find["$and"] = [{ "status.online": true }];
            if (user.groups && user.groups.length)
              find["$and"].push({
                $or: [{ limit_to_group: { $in: [null, false] } }, { groups: { $in: user.groups } }]
              });
            else find["$and"].push({ limit_to_group: { $in: [null, false] } });
          }
          return Meteor.users.find(find, { fields: viewable_logged_on_user_fields });
        }
      }
    ]
  };
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
      .find({ username: { $regex: "^" + prefix } }, { username: 1 })
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

  // TODO: Change this to load types from ICC configuraation, and to set ratings also per ICC configuration
  user.ratings = DynamicRatings.getUserRatingsObject();
  user.settings = default_settings;
  user.locale = "unknown";
  user.board_css = "developmentcss"; // TODO: Get this from the ICC configuration collection!
  user.roles = [];
  standard_member_roles.forEach(role =>
    user.roles.push({ _id: role, scope: null, assigned: true })
  );

  if (!user.status) user.status = {};
  user.status.game = "none";

  return user;
});

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

Users.setLimitToGroup = function(message_identifier, user, limit_to_group) {
  check(message_identifier, String);
  check(user, Match.OneOf(Object, String));
  check(limit_to_group, Boolean);

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "change_limit_to_group"))
    throw new ICCMeteorError(message_identifier, "Unable to change group limit", "Not authorized");

  const user_id = typeof user === "object" ? user._id : user;
  const updated = Meteor.users.update(
    { _id: user_id },
    { $set: { limit_to_group: limit_to_group } }
  );
  if (updated) group_change_hooks.forEach(f => f(message_identifier, user_id));
};

Users.addToGroup = function(message_identifier, user, group) {
  check(message_identifier, String);
  check(user, Match.OneOf(Object, String));
  check(group, String);

  const self = Meteor.user();
  check(self, Object);

  if (!Users.isAuthorized(self, "add_to_group"))
    throw new ICCMeteorError(message_identifier, "Unable to add user to group", "Not authorized");

  if (typeof user === "object") user = user._id;
  const victim = Meteor.users.findOne({ _id: user });
  if (!victim)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add user to group",
      "Unable to find user"
    );

  if (Meteor.users.find({ _id: user, groups: group }).count())
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add user to group",
      "User already in group"
    );

  const modifier = { $push: { groups: group } };
  if (victim.limit_to_group === undefined) modifier["$set"] = { limit_to_group: true };
  Meteor.users.update({ _id: user }, modifier);
  group_change_hooks.forEach(f => f(message_identifier, user));
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
  if (Meteor.isTest || Meteor.isAppTest) {
    Users.runLoginHooks = runLoginHooks;
    Users.ruLogoutHooks = runLogoutHooks;
  } else {
    // Do not do this in test.
    Meteor.users.find({ "status.online": true }).observeChanges({
      removed(id) {
        runLogoutHooks(this, id);
      } /*,
      changed(id, fields) {
        if ("status" in fields && "online" in fields.status && !fields.status.online)
          runLogoutHooks(this, id);
      }*/
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
