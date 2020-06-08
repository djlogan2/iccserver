import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import faker from "faker";
import "../../imports/collections/users";
import sinon from "sinon";
//import { ClientMessages } from "../collections/ClientMessages";
import { i18n } from "../collections/i18n";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { UCI } from "../../server/UCI";
import { Timestamp } from "../../lib/server/timestamp";
import { Game } from "../../server/Game";
import { DynamicRatings } from "../../server/DynamicRatings";
import { all_roles } from "./userConstants";
import { Users } from "../collections/users";

export const TestHelpers = {};

if (Meteor.isTest || Meteor.isAppTest) {
  TestHelpers.createUser = function(_options) {
    const options = _options || {};
    const userRecord = {
      username: options.username || faker.internet.userName(),
      email: options.email || faker.internet.email(),
      password: options.password || faker.internet.password()
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
      options.roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
      Roles.setUserRoles(id, options.roles);
    }

    const setobject = {};
    setobject["status.online"] = options.login === undefined || options.login;
    setobject.isolation_group = options.isolation_group;
    if (setobject["status.online"]) setobject.fingerprint = { fingerprint: "fingerprint" };
    setobject.locale = options.locale || "en-us";
    setobject.board_css = options.board_css || "developmentcss";

    if (userRecord.profile && userRecord.profile.legacy)
      setobject["profile.legacy.validated"] = true;

    Meteor.users.update({ _id: id }, { $set: setobject });

    return Meteor.users.findOne({ _id: id });
  };

  TestHelpers.setupDescribe = function(options) {
    const self = this;

    beforeEach.call(this, function(done) {
      self.sandbox = sinon.createSandbox();
      if (!!options && options.timer) {
        self.sandbox.useFakeTimers();
        self.clock =
          {
            tick(ticks) {
              //console.log("tick(" + ticks + ")");
              const second_count = Math.floor(ticks / 1000);
              const remain = ticks - (second_count * 1000);
              for (let x = 0; x < second_count; x++) {
                //console.log("tick SECOND");
                self.sandbox.clock.tick(1000);
              }
              //console.log("tick REMAIN " + remain);
              if(remain)
                self.sandbox.clock.tick(remain);
            }
          };
      }
      self.meteorUsersFake = self.sandbox.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      );

      if (!options || options.dynamicratings === undefined || options.dynamicratings !== false) {
        self.sandbox.replace(
          DynamicRatings,
          "getUserRatingsObject",
          self.sandbox.fake.returns({
            bullet: { rating: 1600, need: 0, won: 0, draw: 0, lost: 0, best: 0 },
            standard: { rating: 1600, need: 0, won: 0, draw: 0, lost: 0, best: 0 }
          })
        );

        self.sandbox.replace(
          DynamicRatings,
          "meetsRatingTypeRules",
          self.sandbox.fake.returns(true)
        );
      }

      self.sandbox.replace(Meteor, "user", self.meteorUsersFake);

      const orig_isauthorized = Users.isAuthorized;
      self.sandbox.replace(
        Users,
        "isAuthorized",
        self.sandbox.fake((user, roles, scope) => {
          if (typeof roles === "string") {
            if (all_roles.indexOf(roles) === -1)
              // eslint-disable-next-line no-console
              console.log("Unable to find known role of " + roles);
            return orig_isauthorized(user, roles, scope);
          } else {
            for (let x = 0; x < roles.length; x++) {
              if (all_roles.indexOf(roles[x]) === -1) {
                // eslint-disable-next-line no-console
                console.log("Unable to find known role of " + roles[x]);
                return false;
              }
            }
            return orig_isauthorized(user, roles);
          }
        })
      );

      self.clientMessagesSpy = self.sandbox.spy(global._clientMessages, "sendMessageToClient");

      self.sandbox.replace(
        Timestamp,
        "averageLag",
        self.sandbox.fake(() =>
          !options || options.averagelag === undefined ? 0 : options.averagelag
        )
      ); //.returns(123));

      self.sandbox.replace(Timestamp, "pingTime", self.sandbox.fake.returns(456));

      self.sandbox.replace(UCI, "getScoreForFen", self.sandbox.fake(() => Promise.resolve(234)));

      self.sandbox.replace(
        i18n,
        "localizeMessage",
        self.sandbox.fake(function(locale, i18nvalue, parameters) {
          return "i18n: " + locale + ", " + i18nvalue + ", " + parameters;
        })
      );

      resetDatabase(null, () => {
        all_roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
        done();
      });
    });

    afterEach.call(this, function() {
      global._clientMessages.sendMessageToClient.restore();
      self.sandbox.restore();
      delete self.meteorUsersFake;
      delete self.clientMessagesSpy;
      Game.testingCleanupMoveTimers();
    });

    return self;
  };
}

function isObject(obj) {
  if (!(obj instanceof Object)) return false;
  if (obj instanceof Date) return false;
  // noinspection RedundantIfStatementJS
  if (obj instanceof Array) return false;
  return true;
}

export function compare(testobject, actualobject, propheader) {
  propheader = propheader || "";
  if (isObject(testobject) || isObject(actualobject)) {
    if (typeof testobject !== typeof actualobject)
      return "object types failed to match: " + (propheader || "entire object");
  }

  let prop;
  for (prop in testobject) {
    if (Object.prototype.hasOwnProperty.call(testobject, prop)) {
      if (prop !== "ratings") {
        if (actualobject[prop] === undefined)
          return propheader + prop + " not found in database object";
        else if (testobject[prop] instanceof Object) {
          const msg = compare(testobject[prop], actualobject[prop], propheader + prop + ".");
          if (!!msg) return msg;
        }
      }
    }
  }

  for (prop in actualobject) {
    if (Object.prototype.hasOwnProperty.call(actualobject, prop)) {
      if (prop !== "ratings") {
        if (!testobject[prop])
          return propheader + prop + " is not supposed to be viewable, but is in the subscription";
        else if (isObject(actualobject[prop])) {
          const msg = compare(testobject[prop], actualobject[prop], propheader + prop + ".");
          if (!!msg) return msg;
        }
      }
    }
  }
}
