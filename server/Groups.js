import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Users } from "../imports/collections/users";
import SimpleSchema from "simpl-schema";
import { Mongo } from "meteor/mongo";

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

export const Groups = {};

Groups.createGroup = function(message_identifier, name, owner) {
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

Groups.addToGroup = function(message_identifier, name, member) {
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

Groups.removeFromGroup = function(message_identifier, name, member) {
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

Groups.getGroupParameter = function(message_identifier, user, parameter) {
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

Groups.getGroups = function(user) {
  check(user, Match.OneOf(Object, String));
  if (typeof user !== "string")
    user = user._id;
  return GroupCollection.find({ "member.id": user })
    .fetch()
    .map(rec => rec.name);
};

const listeners = {};

Groups.addParameterChangeListener = function(what, func) {
  check(what, String);
  check(func, Function);

  if (["seeks", "matches", "play", "showuser"].indexOf(what) === -1)
    throw new Meteor.Error("Unable to add listener", what + " is unknown");

  if (!listeners[what]) listeners[what] = [];

  listeners[what].push(func);
};

Groups.changeGroupParameter = function(message_identifier, name, member, parameter, value) {
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
  const setobject = {};
  setobject["member.$." + parameter] = value;

  GroupCollection.update({ name: name, "member.id": member._id }, { $set: setobject });

  if (listeners[parameter])
    listeners[parameter].forEach(func => {
      func(message_identifier, member, value);
    });
};
