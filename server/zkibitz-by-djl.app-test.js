import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Chat } from "./Chat";
import { Game } from "./Game";
import { Users } from "../imports/collections/users";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

function checkLastAction(gamerecord, reverse_index, type, issuer, parameter) {
  const action = gamerecord.actions[gamerecord.actions.length - 1 - reverse_index];
  if (type) chai.assert.equal(action.type, type);
  if (issuer) chai.assert.equal(action.issuer, issuer);
  if (parameter) {
    if (typeof parameter === "object") chai.assert.deepEqual(action.parameter, parameter);
  }
}

describe("kibitzes", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow kibitzes if user is in the 'allow kibitzes' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "the text");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "kibitz", self._id, { what: "the text" });
  });

  it("should not allow kibitzes if user is not in the 'allow kibitzes' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    Users.removeUserFromRoles(self.loggedonuser._id, "kibitz");
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "the text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    const game = Game.collection.findOne();
    chai.assert.isTrue(!game.actions || !game.actions.length);
    chai.assert.isUndefined(Chat.collection.findOne());
  });

  it("should write kibitzes from a child exempt user into the collection as a child chat", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "the text");
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual(
      {
        create_date: chat.create_date,
        isolation_group: "public",
        _id: chat._id,
        id: game_id,
        type: "kibitz",
        issuer: { id: self.loggedonuser._id, username: self.loggedonuser.username },
        child_chat: true,
        what: "the text"
      },
      chat
    );
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "kibitz", self._id, { what: "the text" });
  });

  it("should delete the kibitzes from the collection when the game is deleted", function(done) {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "the text");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "kibitz", self._id, { what: "the text" });
    const cursor = Chat.collection.find().observeChanges({
      added() {},
      removed() {
        chai.assert.equal(Chat.collection.find().count(), 0);
        chai.assert.isUndefined(Game.collection.findOne());
        cursor.stop();
        done();
      }
    });
    Game.localRemoveObserver("mi3", game_id, self.loggedonuser._id);
    // chai.assert.equal(Game.collection.find().count(), 0);
    // chai.assert.equal(Chat.collection.find().count(), 0);
  });

  it("should write an action (what was said, who said it) when a kibitz is written", function() {
    // Already handled in other tests
  });

  it("should send a client message when a kibitz is sent for an invalid game id", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", "mickeymouse", true, "text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_GAME");
  });

  it("should return a client message if a child tries to send a non-child chat text", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "bogus_id");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
  });

  it("should save the child chat text if all is well", function() {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, ccid1);
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "kibitz", self._id, { what: "child chat 1" });
  });

  it("should not publish non-child kibitzes to a child", function(done) {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    self.loggedonuser = TestHelpers.createUser();
    const exempt = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const anotherchild = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const child = TestHelpers.createUser({ roles: ["child_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, true, "the adult text");
    self.loggedonuser = exempt;
    Game.localAddObserver("mi3", game_id, exempt._id);
    Chat.kibitz("mi4", game_id, true, "the exempt text");
    self.loggedonuser = anotherchild;
    Game.localAddObserver("mi5", game_id, anotherchild._id);
    Chat.kibitz("mi5", game_id, true, ccid1);
    self.loggedonuser = child;
    Game.localAddObserver("mi3", game_id, child._id);
    const collector = new PublicationCollector({ userId: child._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.chat.length, 2); // The child exempt one and the child chat one
      chai.assert.sameMembers(
        ["the exempt text", "child chat 1"],
        collections.chat.map(r => r.what)
      );
      done();
    });
  });

  it("should publish kibitzes to players", function(done) {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const exempt = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const anotherchild = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    Chat.kibitz("mi2", game_id, true, "p1 kibitz");
    self.loggedonuser = p2;
    Chat.kibitz("mi3", game_id, true, "p2 kibitz");
    self.loggedonuser = exempt;
    Game.localAddObserver("mi3", game_id, exempt._id);
    Chat.kibitz("mi4", game_id, true, "the exempt text");
    self.loggedonuser = anotherchild;
    Game.localAddObserver("mi5", game_id, anotherchild._id);
    Chat.kibitz("mi5", game_id, true, ccid1);
    self.loggedonuser = p1;
    const collector = new PublicationCollector({ userId: p1._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.chat.length, 4); // The child exempt one and the child chat one
      chai.assert.sameMembers(
        ["p1 kibitz", "p2 kibitz", "the exempt text", "child chat 1"],
        collections.chat.map(r => r.what)
      );
      done();
    });
  });
});

describe("whispers", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow whispers if user is in the 'allow kibitzes' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the text");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "whisper", self._id, { what: "the text" });
  });

  it("should not allow whispers if user is not in the 'allow kibitzes' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    Users.removeUserFromRoles(self.loggedonuser._id, "kibitz");
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    const game = Game.collection.findOne();
    chai.assert.isTrue(!game.actions || !game.actions.length);
    chai.assert.isUndefined(Chat.collection.findOne());
  });

  it("should write whispers from a child exempt user into the collection as a child chat", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the text");
    const chat = Chat.collection.findOne();
    chai.assert.deepEqual(
      {
        create_date: chat.create_date,
        isolation_group: "public",
        _id: chat._id,
        id: game_id,
        type: "whisper",
        issuer: { id: self.loggedonuser._id, username: self.loggedonuser.username },
        child_chat: true,
        what: "the text"
      },
      chat
    );
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "whisper", self._id, { what: "the text" });
  });

  it("should delete the whispers from the collection when the game is deleted", function(done) {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the text");
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "whisper", self._id, { what: "the text" });
    const cursor = Chat.collection.find().observeChanges({
      added() {},
      removed() {
        chai.assert.equal(Chat.collection.find().count(), 0);
        chai.assert.isUndefined(Game.collection.findOne());
        cursor.stop();
        done();
      }
    });
    Game.localRemoveObserver("mi3", game_id, self.loggedonuser._id);
    // chai.assert.equal(Game.collection.find().count(), 0);
    // chai.assert.equal(Chat.collection.find().count(), 0);
  });

  it("should write an action (what was said, who said it) when a whisper is written", function() {
    // Already handled in other tests
  });

  it("should send a client message when a whisper is sent for an invalid game id", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", "mickeymouse", false, "text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_GAME");
  });

  it("should return a client message if a child tries to send a non-child chat text", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the text");
    chai.assert.equal(Chat.collection.find().count(), 0);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_FREEFORM_NOT_ALLOWED");
  });

  it("should save the child chat text if all is well", function() {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    self.loggedonuser = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, ccid1);
    chai.assert.equal(Chat.collection.find().count(), 1);
    const game = Game.collection.findOne();
    checkLastAction(game, 0, "whisper", self._id, { what: "child chat 1" });
  });

  it("should not publish non-child whispers to a child", function(done) {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    self.loggedonuser = TestHelpers.createUser();
    const exempt = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const anotherchild = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    const child = TestHelpers.createUser({ roles: ["child_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Chat.kibitz("mi2", game_id, false, "the adult text");
    self.loggedonuser = exempt;
    Game.localAddObserver("mi3", game_id, exempt._id);
    Chat.kibitz("mi4", game_id, false, "the exempt text");
    self.loggedonuser = anotherchild;
    Game.localAddObserver("mi5", game_id, anotherchild._id);
    Chat.kibitz("mi5", game_id, false, ccid1);
    self.loggedonuser = child;
    Game.localAddObserver("mi3", game_id, child._id);
    const collector = new PublicationCollector({ userId: child._id });
    collector.collect("chat", collections => {
      chai.assert.equal(collections.chat.length, 2);
      chai.assert.sameMembers(
        ["the exempt text", "child chat 1"],
        collections.chat.map(r => r.what)
      );
      done();
    });
  });

  it("should not publish whispers to players", function(done) {
    const ccid1 = Chat.childChatCollection.insert({
      isolation_group: "public",
      text: "child chat 1"
    });
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const exempt = TestHelpers.createUser({ roles: ["child_chat_exempt", "kibitz"] });
    const anotherchild = TestHelpers.createUser({ roles: ["child_chat", "kibitz"] });
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    Chat.kibitz("mi2", game_id, false, "p1 kibitz");
    self.loggedonuser = p2;
    Chat.kibitz("mi3", game_id, false, "p2 kibitz");
    self.loggedonuser = exempt;
    Game.localAddObserver("mi3", game_id, exempt._id);
    Chat.kibitz("mi4", game_id, false, "the exempt text");
    self.loggedonuser = anotherchild;
    Game.localAddObserver("mi5", game_id, anotherchild._id);
    Chat.kibitz("mi5", game_id, false, ccid1);
    self.loggedonuser = p1;
    const collector = new PublicationCollector({ userId: p1._id });
    collector.collect("chat", collections => {
      chai.assert.isTrue(
        !collections.chat || !collections.chat.length || collections.chat.length === 0
      );
      done();
    });
  });
});
