import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import faker from "faker";
import "../../imports/collections/users";

export const TestHelpers = {};

if (Meteor.isTest || Meteor.isAppTest) {
  TestHelpers.createUser = function(_options) {
    const options = _options || {};
    const userRecord = {
      createDate: new Date(),
      username: options.username || faker.internet.userName(),
      email: options.email || faker.internet.email(),
      password: options.password || faker.internet.password(),
      locale: options.locale || "en-us",
      board_css: options.board_css || "developmentcss"
    };
    if (
      options.legacy === undefined ||
      !!options.legacy ||
      options.legacy_username ||
      options.legacy_password ||
      options.legacy_autologin
    ) {
      userRecord.profile = {
        legacy: {
          username: options.legacy_username || faker.internet.userName(),
          password: options.legacy_password || faker.internet.password(),
          autologin: options.legacy_autologin || true
        }
      };
    }
    const id = Accounts.createUser(userRecord);
    userRecord._id = id;
    if (!!options.roles)
      Roles.setUserRoles(userRecord._id, options.roles, Roles.GLOBAL_GROUP);
    if (options.login === undefined || options.login) {
      Meteor.users.update({ _id: id }, { $set: { loggedOn: true } });
    }
    if (userRecord.profile && userRecord.profile.legacy)
      Meteor.users.update(
        { _id: id },
        { $set: { "profile.legacy.validated": true } }
      );
    return Meteor.users.findOne({_id: id});
  };
}
