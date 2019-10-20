import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Meteor } from "meteor/meteor";
import { ClientMessages } from "./ClientMessages";
import { TestHelpers } from "../server/TestHelpers";
import sinon from "sinon";
import { i18n } from "./i18n";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";

describe("Client Messages", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should have a users messages deleted when they logoff", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    ClientMessages.collection.insert({
      to: user1._id,
      client_identifier: "message11",
      message: "message11"
    });
    ClientMessages.collection.insert({
      to: user1._id,
      client_identifier: "message12",
      message: "message12"
    });
    ClientMessages.collection.insert({
      to: user1._id,
      client_identifier: "message13",
      message: "message13"
    });
    ClientMessages.collection.insert({
      to: user2._id,
      client_identifier: "message21",
      message: "message21"
    });
    ClientMessages.collection.insert({
      to: user2._id,
      client_identifier: "message22",
      message: "message22"
    });
    ClientMessages.collection.insert({
      to: user2._id,
      client_identifier: "message23",
      message: "message23"
    });
    chai.assert.equal(6, ClientMessages.collection.find().count());
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("userData", collections => {
      // We don't really care what happens in here, we just need the collection to stop.
    });
    chai.assert.equal(3, ClientMessages.collection.find().count());
  });

  it("should not save a message for a user if they are logged off", function() {
    const user1 = TestHelpers.createUser({ login: false });
    ClientMessages.sendMessageToClient(user1._id, "identifier", "FOR_TESTING");
    const rec = ClientMessages.collection.find({}).fetch();
    chai.assert.equal(rec.length, 0);
  });

  // We need a meteor method for this!
  it("should delete acknowledged messages from the collection", function() {
    sinon.replace(i18n, "localizeMessage", sinon.fake.returns("the message"));
    const user1 = TestHelpers.createUser({ login: true });
    const user2 = TestHelpers.createUser({ login: true });
    //sinon.replace(Meteor, "userId", () => {return user1._id});
    const id1 = ClientMessages.sendMessageToClient(
      user1._id,
      "id1",
      "FOR_TESTING"
    );
    const id2 = ClientMessages.sendMessageToClient(
      user1._id,
      "id2",
      "FOR_TESTING"
    );
    const id3 = ClientMessages.sendMessageToClient(
      user2._id,
      "id3",
      "FOR_TESTING"
    );
    let method = Meteor.server.method_handlers["acknowledge.client.message"];
    method.apply({ userId: user1._id }, [id1]);
    const remainder = ClientMessages.collection.find().fetch();
    chai.assert.equal(2, remainder.length);
    chai.assert.notInclude(remainder, { _id: id1 });
    sinon.restore();
  });

  it("should not allow the meteor call to delete a message that does not belong to them", function() {
    sinon.replace(i18n, "localizeMessage", sinon.fake.returns("the message"));
    const user1 = TestHelpers.createUser({ login: true });
    const user2 = TestHelpers.createUser({ login: true });
    const id1 = ClientMessages.sendMessageToClient(
      user1._id,
      "id1",
      "FOR_TESTING"
    );
    const id2 = ClientMessages.sendMessageToClient(
      user2._id,
      "id2",
      "FOR_TESTING"
    );
    let method = Meteor.server.method_handlers["acknowledge.client.message"];
    chai.assert.throws(
      () => method.apply({ userId: user2._id }, [id1]),
      ICCMeteorError
    );
  });
});
