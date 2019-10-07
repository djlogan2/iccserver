import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { addLegacyGameRequest } from "./GameRequest";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import chai from "chai";

import "./GameRequest";

function createUser(username, login) {
  Accounts.createUser({
    email: username + "@chessclub.com",
    username: username,
    password: username,
    profile: {
      legacy: {
        username: "icc" + username,
        password: "iccpassword",
        autologin: true
      }
    }
  });
  if (!!login)
    Meteor.users.update({ username: username }, { $set: { loggedOn: true } });
  const rec = Meteor.users.findOne({ username: username });
  return rec._id;
}

function addGameMatch(user1, user2) {
  addLegacyGameRequest(
    user1,
    2000,
    true,
    "GM",
    user2,
    1800,
    true,
    "IM",
    0,
    "Standard",
    true,
    false
  );
}

describe("Game Requests", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should only send records belonging to the user in the client publication of game requests", function(done) {
    const us = createUser("gcit1");
    createUser("gcit2");
    createUser("gcit3");
    addGameMatch("iccgcit1", "iccgcit2");
    addGameMatch("iccgcit3", "iccgcit1");
    addGameMatch("iccgcit2", "iccgcit3");
    const collector = new PublicationCollector({ userId: us });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 2);
      //chai.assert.equal(collections.game_requests[0].challenger_id, );
      done();
    });
  });
});
