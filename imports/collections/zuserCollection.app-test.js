import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { TestHelpers } from "../server/TestHelpers";

//
// TODO: Check guest roles
// TODO: Check standard member roles
// TODO: Hunt down the user types and figure out what to do about those
// TODO: Create an admin user, and they should be able to see more fields
// TODO: Add user collection table and add and look at notes
// TODO: Add meteor methods to add and remove users from roles
//      TODO: The method should fail if the calling user isn't in the appropriate role
//      TODO: The method should success if the calling user IS in the appropriate role
//
// TODO: Create a collection for online legacy users and do that instead of realtime
// TODO: See if we can prevent creating a user, and prevent logging on, from an IP (i.e. IP range)
//
const logged_on_user_fields = {
  _id: 1,
  username: 1,
  ratings: {
    bullet: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    blitz: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    standard: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    wild: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    bughouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    losers: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    crazyhouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fiveminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    oneminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    correspondence: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fifteenminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    threeminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    computerpool: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    chess960: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 }
  }
};

const our_allowed_user_fields = {
  _id: 1,
  createdAt: 1,
  username: 1,
  locale: 1,
  board_css: 1,
  emails: 1,
  ratings: {
    bullet: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    blitz: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    standard: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    wild: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    bughouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    losers: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    crazyhouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fiveminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    oneminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    correspondence: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fifteenminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    threeminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    computerpool: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    chess960: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 }
  },
  profile: {
    firstname: 1,
    lastname: 1,
    legacy: {
      username: 1,
      validated: 1,
      autologin: 1
    }
  }
};

const all_fields = {
  _id: 1,
  username: 1,
  locale: 1,
  board_css: 1,
  createdAt: 1,
  loggedOn: 1,
  emails: 1,
  services: {
    password: {
      bcrypt: 1
    }
  },
  ratings: {
    bullet: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    blitz: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    standard: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    wild: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    bughouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    losers: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    crazyhouse: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fiveminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    oneminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    correspondence: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    fifteenminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    threeminute: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    computerpool: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 },
    chess960: { rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 }
  },
  profile: {
    firstname: 1,
    lastname: 1,
    legacy: {
      username: 1,
      validated: 1,
      autologin: 1,
      password: 1
    }
  },
  settings: {
    autoaccept: 1
  },
  roles: 1
};

function isObject(obj) {
  if (!(obj instanceof Object)) return false;
  if (obj instanceof Date) return false;
  // noinspection RedundantIfStatementJS
  if (obj instanceof Array) return false;
  return true;
}

function compare(testobject, actualobject, propheader) {
  propheader = propheader || "";
  if (isObject(testobject) || isObject(actualobject)) {
    if (typeof testobject !== typeof actualobject)
      return "object types failed to match: " + (propheader || "entire object");
  }

  let prop;
  for (prop in testobject) {
    if (Object.prototype.hasOwnProperty.call(testobject, prop)) {
      if (actualobject[prop] === undefined)
        return propheader + prop + " not found in database object";
      else if (testobject[prop] instanceof Object) {
        const msg = compare(
          testobject[prop],
          actualobject[prop],
          propheader + prop + "."
        );
        if (!!msg) return msg;
      }
    }
  }

  for (prop in actualobject) {
    if (Object.prototype.hasOwnProperty.call(actualobject, prop)) {
      if (!testobject[prop])
        return (
          propheader +
          prop +
          " is not supposed to be viewable, but is in the subscription"
        );
      else if (isObject(actualobject[prop])) {
        const msg = compare(
          testobject[prop],
          actualobject[prop],
          propheader + prop + "."
        );
        if (!!msg) return msg;
      }
    }
  }
}

describe("Users", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should have all fields", function() {
    Accounts.createUser({
      username: "user1",
      email: "user1@chessclub.com",
      password: "user1",
      profile: {
        legacy: { username: "icc1", password: "pw1", autologin: true }
      }
    });
    const user1 = Meteor.users.findOne({ username: "user1" });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const msg = compare(all_fields, user1);
    chai.assert.isUndefined(msg);
  });

  it("should only get a subset of the entire user record in the userData subscription", function(done) {
    const user1 = TestHelpers.createUser({ login: false });
    TestHelpers.createUser({ login: false });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("userData", collections => {
      chai.assert.equal(collections.users.length, 1);
      const msg = compare(our_allowed_user_fields, collections.users[0]);
      done(msg);
    });
  });

  it("should only get a subset of the user record in the loggedOnUsers subscription", function(done) {
    const user1 = TestHelpers.createUser({ login: true });
    const user2 = TestHelpers.createUser({ login: true });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("loggedOnUsers", collections => {
      const user2a = collections.users.filter(
        u => u.username === user2.username
      );
      chai.assert.equal(user2a.length, 1);
      const msg = compare(logged_on_user_fields, user2a[0]);
      done(msg);
    });
  });

  it("should only get logged on users with the loggedOnUsers subscription", function(done) {
    const user1 = TestHelpers.createUser({ login: false });
    const user2 = TestHelpers.createUser({ login: true });
    const user3 = TestHelpers.createUser({ login: true });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("loggedOnUsers", collections => {
      chai.assert.equal(collections.users.length, 2);
      chai.assert.sameMembers(
        [user2.username, user3.username],
        collections.users.map(u => u.username)
      );
      done();
    });
  });
  /*
  it("should write a new users username to and it should not be validated", function() {
    chai.assert.fail("do me");
  });
  it("should set legacy information as validated upon successful legacy logon", function() {
    chai.assert.fail("do me");
  });
 */
});
