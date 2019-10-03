import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Promise } from "meteor/promise";

function createUser(username) {
  return new Promise(function(resolve, reject) {
    Accounts.createUser(
      {
        email: username + "@chessclub.com",
        username: username,
        password: "password"
      },
      err => {
        if (!!err) reject(err);
        else resolve();
      }
    );
  });
}

function login(username) {
  return new Promise(function(resolve, reject) {
    Meteor.loginWithPassword(username, username, err => {
      if (!!err) reject(err);
      else resolve();
    });
  });
}

describe("Client integration 1", function() {
  it("is a test", function(done) {
    createUser("ci1")
      .the(createUser("ci2"))
      .then(login("ci1"))
      .then(() => {

      });
    assert.fail("yep, fail");
  });
});
