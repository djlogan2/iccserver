import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

const isAuthorized = (user, roles, scope) => {
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

export default isAuthorized;
