import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Meteor } from "meteor/meteor";
import { ClientMessages } from "./ClientMessages";
import { TestHelpers } from "../server/TestHelpers";
import sinon from "sinon";
import { i18n } from "./i18n";
import { ICCMeteorError } from "../../lib/server/ICCMeteorError";
import { Match } from "meteor/check";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { UserStatus } from "meteor/mizzao:user-status";

describe("Client Messages", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should throw an error if we call it with an unknown message identifier", function() {
    this.timeout(30000);
    const user = TestHelpers.createUser();
    chai.assert.throws(
      () => ClientMessages.sendMessageToClient(user._id, "mi1", "UNKNOWN_I18N_MESSAGE"),
      Match.Error
    );
  });

  it("should throw an error if we call it with an known message identifier but with an incorrect number of parameters", function() {
    const user = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        ClientMessages.sendMessageToClient(
          user._id,
          "mi1",
          "FOR_TESTING_10",
          1,
          "2",
          3,
          "4",
          5,
          "6",
          7,
          "8",
          9
        ),
      Match.Error
    );
  });

  // it("should should format messages with many parameters successfully", function() {
  //   const user = TestHelpers.createUser();
  //   chai.assert.doesNotThrow(() => ClientMessages.sendMessageToClient(user._id, "mi1", "FOR_TESTING_10", 1, "2", 3, "4", 5, "6", 7, "8", 9, "10"));
  // });
  //
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
    /*
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("`userData", collections => {
      // We don't really care what happens in here, we just need the collection to stop.
    });
     */
    UserStatus.events.emit("connectionLogout", { connectionId: 1, userId: user1._id });
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
    const id1 = ClientMessages.sendMessageToClient(user1._id, "id1", "FOR_TESTING");
    ClientMessages.sendMessageToClient(user1._id, "id2", "FOR_TESTING");
    ClientMessages.sendMessageToClient(user2._id, "id3", "FOR_TESTING");
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
    const id1 = ClientMessages.sendMessageToClient(user1._id, "id1", "FOR_TESTING");
    ClientMessages.sendMessageToClient(user2._id, "id2", "FOR_TESTING");
    let method = Meteor.server.method_handlers["acknowledge.client.message"];
    chai.assert.throws(() => method.apply({ userId: user2._id }, [id1]), ICCMeteorError);
    sinon.restore();
  });

  it("should throw an error if the message doesn't exist", function() {
    chai.assert.throws(() => ClientMessages.messageParameters("DOES NOT EXIST"), Match.Error);
  });

  it("should not throw an error if the message doesn't exist", function() {
    chai.assert.doesNotThrow(() => ClientMessages.messageParameters("FOR_TESTING_10"));
    chai.assert.deepEqual(
      { parameters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] },
      ClientMessages.messageParameters("FOR_TESTING_10")
    );
  });
});

describe("Client Messages publication", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("should only publish messages belonging to the user", function(done) {
    this.timeout(30000);
    sinon.replace(i18n, "localizeMessage", sinon.fake.returns("the message"));
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    ClientMessages.sendMessageToClient(user1._id, "mi1", "FOR_TESTING");
    ClientMessages.sendMessageToClient(
      user2._id,
      "mi2",
      "FOR_TESTING_10",
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    );
    chai.assert.equal(ClientMessages.collection.find().count(), 2);
    const collector = new PublicationCollector({ userId: user1._id });
    collector.collect("client_messages", collections => {
      chai.assert.equal(collections.client_messages.length, 1);
      chai.assert.equal(collections.client_messages[0].to, user1._id);
      chai.assert.equal(collections.client_messages[0].client_identifier, "mi1");
      chai.assert.equal(collections.client_messages[0].message, "the message");
      sinon.restore();
      done();
    });
  });
});
