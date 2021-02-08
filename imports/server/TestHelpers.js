import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import faker from "faker";
import "../../imports/collections/users";
import sinon from "sinon";
import { i18n } from "../collections/i18n";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { UCI } from "../../server/UCI";
import { Timestamp } from "../../lib/server/timestamp";
import { Game } from "../../server/Game";
import { DynamicRatings } from "../../server/DynamicRatings";
import { all_roles, standard_member_roles } from "./userConstants";
import { Users } from "../collections/users";
import { Random } from "meteor/random";

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

    all_roles.forEach(role => {
      Roles.createRole(role, { unlessExists: true });
      Roles.createRole("set_role_" + role, { unlessExists: true });
    });

    if (!!options.roles) {
      //  options.roles.forEach(role => Roles.createRole(role, { unlessExists: true }));
      Users.addUserToRoles(id, options.roles);
    } else Users.addUserToRoles(id, standard_member_roles);

    const setobject = {};
    setobject.status = {
      game: "none",
      client: "none",
      lastLogin: {
        date: new Date(),
        ipAddr: "127.0.0.1",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
      },
      lastActivity: new Date(),
      legacy: false,
      idle: false,
      online: options.login === undefined || options.login
    };

    setobject["services.resume"] = {
      loginTokens: [
        {
          when: new Date(),
          hashedToken: Random.id()
        }
      ]
    };

    if (!!options.child_chat) setobject.cf = "c";
    else if (!!options.child_chat_exempt) setobject.cf = "e";

    setobject.isolation_group = options.isolation_group || "public";
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
        self.clock = {
          tick(ticks) {
            const second_count = Math.floor(ticks / 1000);
            const remain = ticks - second_count * 1000;
            for (let x = 0; x < second_count; x++) {
              self.sandbox.clock.tick(1000);
            }
            if (remain) self.sandbox.clock.tick(remain);
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
        if (!!options && !!options.beforeEach && typeof options.beforeEach === "function") options.beforeEach();
      }

      self.sandbox.replace(Meteor, "user", self.meteorUsersFake);

      const orig_isauthorized = Users.isAuthorized;
      self.sandbox.replace(
        Users,
        "isAuthorized",
        self.sandbox.fake((user, roles, scope) => {
          if (typeof roles === "string") {
            if (
              roles !== "child_chat" &&
              roles !== "child_chat_exempt" &&
              all_roles.indexOf(roles.replace("set_role_", "")) === -1
            )
              // eslint-disable-next-line no-console
              console.log("Unable to find known role of " + roles);
            return orig_isauthorized(user, roles, scope);
          } else {
            for (let x = 0; x < roles.length; x++) {
              if (
                roles[x] !== "child_chat" &&
                roles[x] !== "child_chat_exempt" &&
                all_roles.indexOf(roles[x].replace("set_role_", "")) === -1
              ) {
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
        all_roles.forEach(role => {
          Roles.createRole(role, { unlessExists: true });
          Roles.createRole("set_role_" + role, { unlessExists: true });
        });
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

export function compare(testobject, actualobject, propheader, missingok) {
  propheader = propheader || "";
  if (isObject(testobject) || isObject(actualobject)) {
    if (typeof testobject !== typeof actualobject)
      return "object types failed to match: " + (propheader || "entire object");
  }

  let prop;
  if (!missingok)
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
          const msg = compare(
            testobject[prop],
            actualobject[prop],
            propheader + prop + ".",
            missingok
          );
          if (!!msg) return msg;
        }
      }
    }
  }
}
