import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { ClientMessages } from "./ClientMessages";

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
  const user = Meteor.users.findOne({ username: username });
  return user._id;
}

describe("Client Messages", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should have a users messages deleted when they logoff", function() {
    chai.assert.fail("do me");
  });

  it("should not save a message for a user if they are logged off", function() {
    const user1 = createUser("user1", false);
    ClientMessages.sendMessageToClient(user1, "logged off user 1 message");
    const rec = ClientMessages.collection.find({}).fetch();
    chai.assert.equal(rec.length, 0);
  });

  it("should publish only unacknowledged messages to the client", function(done) {
    const user1 = createUser("user1", true);
    const user2 = createUser("user2", true);
    const user3 = createUser("user3", true);
    const user4 = createUser("user4", true);
    ClientMessages.sendMessageToClient(user1, "user 1 message");
    ClientMessages.sendMessageToClient(user2, "user 2 message");
    ClientMessages.sendMessageToClient(user3, "user 3 message");
    ClientMessages.sendMessageToClient(user4, "user 4 message");
    const collector = new PublicationCollector({ userId: user1 });
    collector.collect("client_messages", collections => {
      chai.assert.equal(collections.client_messages.length, 1);
      chai.assert.equal(
        collections.client_messages[0].message,
        "user 1 message"
      );
      done();
    });
  });

  // We need a meteor method for this!
  it("should delete acknowledged messages from the collection", function() {
    chai.assert.fail("do me");
  });
  it("should not allow the meteor call to delete a message that does not belong to them", function() {
    chai.assert.fail("do me");
  });
});
