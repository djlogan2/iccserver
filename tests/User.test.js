//
// Can subscribe a new username
// Cannot subscribe an active username
// Can subscribe an expired username
// TODO: What about email?
// Gets only very specific information about themselves
// Gets even more specific information about others
//    Gets certain information about logged on users
//    Gets certain information about logged off users
//    Gets certain information about expired users
// TODO: Admin stuff!
// Can get a list of logged on users, but only the info above
// TODO: Lots more here, lots and lots more here...friends, censor, settings, admin stuff, notes, etc. etc. etc.
//

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { resetDatabase } from "meteor/xolvio:cleaner";

describe("Users", () => {
  beforeEach(async () => {
    resetDatabase();
  });

  it("should be able to create a user", function(done) {
    const createUser = new Promise((resolve, reject) => {
      Accounts.createUser(
        {
          username: "create-user-1",
          email: "create-user-1@chessclub.com",
          password: "create-user-1-password"
        },
        error => {
          if (error) reject(error);
          else resolve(Meteor.users.findOne({ username: "create-user-1" }));
        }
      );
    });
    return createUser.then(function(newUser) {
      expect(newUser).to.not.be.undefined;
    });
  });
});
