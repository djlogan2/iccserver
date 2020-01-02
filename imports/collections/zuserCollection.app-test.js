import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { TestHelpers, compare } from "../server/TestHelpers";
import { Users } from "./users";

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
// TODO: See if we can prevent creating a user, and prevent logging on, from an IP (i.e. IP range)
//
const logged_on_user_fields = {
  _id: 1,
  username: 1
};

const our_allowed_user_fields = {
  _id: 1,
  createdAt: 1,
  username: 1,
  locale: 1,
  board_css: 1,
  emails: 1,
  profile: {
    firstname: 1,
    lastname: 1,
    legacy: {
      username: 1,
      validated: 1,
      autologin: 1
    }
  },
  status: {
    game: 1
  }
};

const all_fields = {
  _id: 1,
  username: 1,
  locale: 1,
  board_css: 1,
  createdAt: 1,
  emails: 1,
  services: {
    password: {
      bcrypt: 1
    }
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
  roles: 1,
  status: {
    //    online: 1,
    game: 1
    // lastLogin: {
    //   date: 1,
    //   ipAddr: 1,
    //   userAgent: 1
    // }
  }
  // services: {
  //   resume: {
  //     loginTokens: 1
  //   }
  // }
};

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

  it.skip("should only get a subset of the entire user record in the userData subscription", function(done) {
    // TODO: I am having trouble with Meteor.publishComposite vs Meteor.publish. This runs with the latter, but so far, not with the former.
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

  it.skip("should only get a subset of the user record in the loggedOnUsers subscription", function(done) {
    // TODO: I am having trouble with Meteor.publishComposite vs Meteor.publish. This runs with the latter, but so far, not with the former.
    const user1 = TestHelpers.createUser({ login: true });
    const user2 = TestHelpers.createUser({ login: true });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("loggedOnUsers", collections => {
      const user2a = collections.users.filter(u => u.username === user2.username);
      chai.assert.equal(user2a.length, 1);
      const msg = compare(logged_on_user_fields, user2a[0]);
      done(msg);
    });
  });

  it.skip("should only get logged on users with the loggedOnUsers subscription", function(done) {
    // TODO: I am having trouble with Meteor.publishComposite vs Meteor.publish. This runs with the latter, but so far, not with the former.
    this.timeout(500000);
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
