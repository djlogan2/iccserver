import { Roles } from "meteor/alanning:roles";

export const ICCRoles = {};

// TODO: We'll use this later. We just need to
ICCRoles.userIsInRole = function(user, roles, group) {
  if (!Roles.userIsInRole(user, "login")) return false;

  if (!Array.isArray(roles)) roles = [roles];

  if (roles.indexOf("development") === -1) roles.push("development");
  return Roles.userIsInRole(user, roles);
};
