import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Meteor } from "meteor/meteor";
import { TestHelpers, compare } from "../server/TestHelpers";
import tunnel from "tunnel-ssh";
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
  cf: 1,
  username: 1,
  status: {
    game: 1,
    client: 1,
    idle: 1,
    legacy: 1,
    lastActivity: 1,
    lastLogin: {
      date: 1
    }
  }
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
      autologin: 1
    }
  },
  settings: {
    autoaccept: 1
  },
  status: {
    legacy: 1,
    game: 1,
    idle: 1,
    client: 1,
    online: 1,
    lastActivity: 1,
    lastLogin: {
      date: 1,
      ipAddr: 1,
      userAgent: 1
    }
  },
  cf: 1
};

const all_fields = {
  _id: 1,
  cf: 1,
  username: 1,
  locale: 1,
  board_css: 1,
  createdAt: 1,
  emails: 1,
  newguy: 1,
  services: {
    password: {
      bcrypt: 1
    },
    resume: {
      loginTokens: 1
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
  // For documentation purposes to show programmers what is in the
  // user record -- please don't publish these :)
  // services: {
  //   password: {bcrypt: 0},
  //   resume: {loginTokens: [{when: {$date: 0, hashedToken: 0}}]}
  // },
  settings: {
    autoaccept: 1
  },
  status: {
    //    online: 1,
    game: 1,
    client: 1,
    online: 1,
    lastActivity: 1,
    lastLogin: {
      date: 1,
      ipAddr: 1,
      userAgent: 1
    },
    idle: 1,
    legacy: 1
  },
  isolation_group: 1
};

describe("Users", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  // it("should have all fields", function() {
  //   Accounts.createUser({
  //     username: "user1",
  //     email: "user1@chessclub.com",
  //     password: "user1",
  //     profile: {
  //       legacy: { username: "icc1", password: "pw1", autologin: true, validated: true }
  //     }
  //   });
  //   Meteor.users.update(
  //     { username: "user1" },
  //     {
  //       $set: {
  //         cf: "e",
  //         isolation_group: "isolation_group_1",
  //         status: {
  //           game: "none",
  //           lastLogin: {
  //             date: new Date(),
  //             ipAddr: "127.0.0.1",
  //             userAgent:
  //               "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
  //           },
  //           legacy: false,
  //           idle: false,
  //           online: false
  //         }
  //       }
  //     }
  //   );
  //   const user1 = Meteor.users.findOne({ username: "user1" });
  //   chai.assert.isDefined(user1);
  //   chai.assert.isDefined(user1._id);
  //   const msg = compare(all_fields, user1);
  //   chai.assert.isUndefined(msg);
  // });

  // TODO: Of course, since I changed this to an unnamed publication, I cannot figure out how to test this.
  //       SIGH.
  // it.only("should only get a subset of the entire user record in the userData subscription", function(done) {
  //   this.timeout(500000);
  //   const user1 = TestHelpers.createUser({ isolation_group: "group1" });
  //   TestHelpers.createUser({ login: false });
  //   chai.assert.isDefined(user1);
  //   chai.assert.isDefined(user1._id);
  //   const collector = new PublicationCollector({ userId: user1._id });
  //   collector.collect(null, collections => {
  //     chai.assert.equal(collections.users.length, 1);
  //     const msg = compare(our_allowed_user_fields, collections.users[0]);
  //     if (!!msg) done(new Error(msg));
  //     else done();
  //   });
  // });

  it("should only get a subset of the user record in the loggedOnUsers subscription", function(done) {
    const user1 = TestHelpers.createUser({ isolation_group: "group1", child_chat: true });
    const user2 = TestHelpers.createUser({ isolation_group: "group1", child_chat: true });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("loggedOnUsers", collections => {
      const user2a = collections.users.filter(u => u.username === user2.username);
      chai.assert.equal(user2a.length, 1);
      const msg = compare(logged_on_user_fields, user2a[0]);
      const error = !!msg ? new Error(msg) : null;
      done(error);
    });
  });

  it("should also get logged on users with the loggedOnUsers subscription", function(done) {
    // Because we are now ALWAYS sending ourselves via an unnamed subscription, there is no way
    // to not get our own user record.
    const user1 = TestHelpers.createUser({ isolation_group: "group1", login: false });
    const user2 = TestHelpers.createUser({ isolation_group: "group1", login: true });
    const user3 = TestHelpers.createUser({ isolation_group: "group1", login: true });
    chai.assert.isDefined(user1);
    chai.assert.isDefined(user1._id);
    const collector = new PublicationCollector({ userId: user3._id });
    collector.collect("loggedOnUsers", collections => {
      chai.assert.equal(collections.users.length, 2); // I am not a loggedOnUser, I am a "userData", thus loggedOnUsers = 1
      chai.assert.sameMembers([user2._id, user3._id], collections.users.map(u => u._id));
      done();
    });
  });

  //
  // Yes, this is a bit unusual, but I want to make SURE that we never add new fields to the user
  // record that we do not know about in these tests. I want a zero percent chance that sensitive data
  // would be published to clients.
  //
  it("should not have any fields in production we do not know about", function(done) {
    this.timeout(60000);

    var config = {
      username: "david",
      host: "100.25.103.111",
      dstHost: "127.0.0.1",
      dstPort: 27017,
      localHost: "127.0.0.1",
      localPort: 17017,
      privateKey: require("fs").readFileSync("/Users/davidlogan/.ssh/id_rsa")
    };

    const func = (error, server) => {
      var database = new MongoInternals.RemoteCollectionDriver(
        "mongodb://127.0.0.1:17017/iccserver"
      );
      const MyCollection = database.open("users");

      MyCollection.find()
        .fetch()
        .forEach(user => {
          const msg = compare(all_fields, user, "produser:", true);
          chai.assert.isUndefined(msg);
        });
      tnl.close();
      done();
    };

    const tnl = tunnel(config, Meteor.bindEnvironment(func));
  });
});
