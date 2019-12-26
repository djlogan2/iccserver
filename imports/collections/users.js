import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";
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

const GroupCollectionMemberSchema = new SimpleSchema({
  id: String,
  seeks: { type: String, allowedValues: ["none", "group", "all"], defaultValue: "group" },
  matches: { type: String, allowedValues: ["none", "group", "all"], defaultValue: "group" },
  play: { type: String, allowedValues: ["none", "group", "all"], defaultValue: "group" },
  showusers: { type: String, allowedValues: ["none", "group", "all"], defaultValue: "group" }
});

const GroupCollectionSchema = new SimpleSchema({
  name: String,
  owner: [String],
  member: [GroupCollectionMemberSchema]
});

const GroupCollection = new Mongo.Collection("groups");
GroupCollection.attachSchema(GroupCollectionSchema);

Meteor.publish("loggedOnUsers", function() {
  return Meteor.users.find({ "status.online": true }, { fields: viewable_logged_on_user_fields });
});

// TODO: Add a method that is draining the server (i.e. not allowing anyone to login)
//       and add this to the login attempt method below.
Meteor.publish("userData", function() {
  if (!this.userId) return [];

  log.debug("User " + this.userId + " has arrived");
  return Meteor.users.find({ _id: this.userId }, { fields: fields_viewable_by_account_owner });
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
  //user.roles = standard_member_roles;

  return user;
});

Accounts.onLogin(function(user_parameter) {
  const user = user_parameter.user;
  const connection = user_parameter.connection;

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

Users.createGroup = function(message_identifier, name, owner) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(owner, Object);
  if (!Users.isAuthorized(self, "create_group"))
    throw new ICCMeteorError(message_identifier, "Unable to create group", "Not authorized");
  if (GroupCollection.find({ name: name }).count())
    throw new ICCMeteorError(
      message_identifier,
      "Unable to create group",
      "Group " + name + " already exists"
    );
  GroupCollection.insert({
    name: name,
    owner: [owner._id],
    member: [{ id: owner._id, seeks: "all", matches: "all", play: "all", showusers: "all" }]
  });
};

Users.addToGroup = function(message_identifier, name, member) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(name, String);
  check(member, Object);

  if (!Users.isAuthorized(self, "add_to_group", "group " + name))
    throw new ICCMeteorError(message_identifier, "Unable to add user to group", "Not authorized");

  if (GroupCollection.find({ name: name, member: member._id }).count())
    throw new ICCMeteorError(message_identifier, "Unable to add user to group", "Already a member");

  GroupCollection.update(
    { name: name },
    {
      $push: {
        member: {
          id: member._id,
          seeks: "group",
          matches: "group",
          play: "group",
          showusers: "group"
        }
      }
    }
  );
};

Users.removeFromGroup = function(message_identifier, name, member) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(name, String);
  check(member, Object);

  if (!Users.isAuthorized(self, "remove_from_group", "group " + name))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove user from group",
      "Not authorized"
    );

  if (!GroupCollection.find({ name: name, member: member._id }).count())
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove user from group",
      "Member is not in a group"
    );

  GroupCollection.update(
    { name: name },
    { $pull: { owner: member._id, member: { id: member._id } } }
  );
};

Users.getGroupParameter = function(message_identifier, user, parameter) {
  const levels = ["none", "group", "all"];
  check(message_identifier, String);
  check(user, Object);
  check(parameter, String);
  let value = 2;
  GroupCollection.find({ "member.id": user._id })
    .fetch()
    .forEach(g => {
      const found = g.member.find(m => m.id === user._id);
      const lvl = levels.indexOf(found[parameter]);
      if (lvl === undefined)
        throw new ICCMeteorError(
          message_identifier,
          "Unable to get group parameter value",
          "parameter " + parameter + " is invalid"
        );
      if (lvl < value) value = lvl;
    });
  return levels[value];
};

Users.getGroups = function(user) {
  check(user, Object);
  return GroupCollection.find({ "member.id": user._id })
    .fetch()
    .map(rec => rec.name);
};

Users.changeGroupParameter = function(message_identifier, name, member, parameter, value) {
  check(message_identifier, String);
  check(name, String);
  check(member, Object);
  check(parameter, String);
  check(value, String);

  const self = Meteor.user();
  check(self, Object);

  const group = GroupCollection.findOne({ name: name, "member.id": member._id });
  if (!group)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to change parameter",
      "Member is not part of a group"
    );

  if (!Users.isAuthorized(self, "change_group_parameter", "group " + name))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to change parameter",
      "Issuer is not authorized"
    );

  const index = group.member.map(m => m.id).indexOf(member._id);

  if (index === -1)
    throw new ICCMeteorError(message_identifier, "Unable to change parameter", "Unexpected error");

  if (!group.member[index][parameter])
    throw new ICCMeteorError(message_identifier, "Unable to change parameter", "Invalid parameter");

  if (["all", "group", "none"].indexOf(value) === -1)
    throw new ICCMeteorError(message_identifier, "Unable to change parameter", "Invalid value");

  if (group.member[index][parameter] === value) return;

  const result = GroupCollection.update(
    { name: name, "member.id": member._id },
    { $set: { "member.$.seeks": value } }
  );
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
      removed(id, fields) {
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
