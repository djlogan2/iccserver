import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import faker from "faker";
import { standard_member_roles } from "./userConstants";

export const TestHelpers = {};

Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) {
    TestHelpers.createUser = function(options) {
      const userRecord = {
        username: options.username || faker.internet.userName(),
        email: options.email || faker.internet.email(),
        password: options.password || faker.internet.password,
        loggedOn: options.login === undefined ? true : options.login,
        locale: options.locale || "en_us",
        board_css: options.board_css || "developmentcss",
        roles: { __global_roles__: options.roles || standard_member_roles }
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
            username: options.legacy_username || faker.internet.userName,
            password: options.legacy_password || faker.internet.password,
            autologin: options.legacy_autologin || true
          }
        };
      }
      const id = Accounts.createUser(userRecord);
      userRecord._id = id;
      return userRecord;
    };
  }
});
