import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import faker from "faker";
import "../../imports/collections/users";
import sinon from "sinon";
import { ClientMessages } from "../collections/ClientMessages";
import { i18n } from "../collections/i18n";
import { resetDatabase } from "meteor/xolvio:cleaner";

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
      board_css: options.board_css || "developmentcss",
      roles: []
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
    if (!!options.roles) {
      options.roles.forEach(role =>
        Roles.createRole(role, { unlessExists: true })
      );
      Roles.setUserRoles(id, options.roles);
    }
    if (options.login === undefined || options.login) {
      Meteor.users.update({ _id: id }, { $set: { loggedOn: true } });
    }
    if (userRecord.profile && userRecord.profile.legacy)
      Meteor.users.update(
        { _id: id },
        { $set: { "profile.legacy.validated": true } }
      );
    return Meteor.users.findOne({ _id: id });
  };

  TestHelpers.setupDescribe = function() {
    const self = this;

    beforeEach.call(this, function(done) {
      self.meteorUsersFake = sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      );
      sinon.replace(Meteor, "user", self.meteorUsersFake);

      self.clientMessagesSpy = sinon.spy(ClientMessages, "sendMessageToClient");

      sinon.replace(
        i18n,
        "localizeMessage",
        sinon.fake(function(locale, i18nvalue, parameters) {
          return "i18n: " + locale + ", " + i18nvalue + ", " + parameters;
        })
      );

      resetDatabase(null, done);
    });

    afterEach.call(this, function() {
      ClientMessages.sendMessageToClient.restore();
      sinon.restore();
      delete self.meteorUsersFake;
      delete self.clientMessagesSpy;
    });

    return self;
  };
}
