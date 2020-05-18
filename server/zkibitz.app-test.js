
import chai from "chai";
import { Game } from "../server/Game";
import { TestHelpers } from "../imports/server/TestHelpers";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { Meteor } from "meteor/meteor";
import { standard_member_roles } from "../imports/server/userConstants";

describe.only("kibitzes", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should save an action in the game record for local games", function() {

    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game_id_local = Game.startLocalGame("test_identifier",
      other,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");


    chai.assert.isFunction(Game.kibitz, "kibitz failed to be a function when adding action to record");

    Game.kibitz("mi1", game_id_local, testText);

    const localCollection = Game.collection.findOne({ _id: game_id_local });

    chai.assert(localCollection.actions, "actions failed to be a field in local game collection when kibitz is used");

    chai.assert.equal(localCollection.actions[0].type, "kibitz", "Failed to update game record's actions of local game with kibitz");

    chai.assert.deepEqual(localCollection.actions[0].parameter, { what: testText }, "Failed to save action of kibitz in local game collection")

  });

  it("should save an action in the game record for legacy games", function() {

    const testText = "Hello I am a test string!";
    const other = TestHelpers.createUser();
    self.loggedonuser = other;
    const game_id_legacy = Game.startLegacyGame("test_identifier",
      123,
      other.profile.legacy.username,
      "somebody",
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      true,
      1600,
      1500,
      "gameid",
      [],
      [],
      "");


    chai.assert.isFunction(Game.kibitz, "kibitz failed to be a function when adding action to record");

    Game.kibitz("mi1", game_id_legacy, testText);

    const legacyCollection = Game.collection.findOne({ _id: game_id_legacy });

    chai.assert(legacyCollection.actions, "actions failed to be a field in legacy game collection when kibitz is used");

    chai.assert.equal(legacyCollection.actions[0].type, "kibitz", "Failed to update game record's actions of legacy game with kibitz");

    chai.assert.deepEqual(legacyCollection.actions[0].parameter, { what: testText }, "Failed to save action of kibitz in legacy game collection");

  });

  it("should save an action in the game record for examined games", function() {

    const testText = "Hello I am a test string!";
    const other = TestHelpers.createUser();
    self.loggedonuser = other;
    const game_id_examined = Game.startLocalExaminedGame("test_identifier",
      "someone",
      "someother",
      0);


    chai.assert.isFunction(Game.kibitz, "kibitz failed to be a function when adding action to record");

    Game.kibitz("mi1", game_id_examined, testText);

    const examinedCollection = Game.collection.findOne({ _id: game_id_examined });

    chai.assert(examinedCollection.actions, "actions failed to be a field in examined game collection when kibitz is used");

    chai.assert.equal(examinedCollection.actions[0].type, "kibitz", "Failed to update game record's actions of examined game with kibitz");

    chai.assert.deepEqual(examinedCollection.actions[0].parameter, { what: testText }, "Failed to save action of kibitz in examined game collection")

  });


  it("should be viewable by both players during game play", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();

    const game_id_local = Game.startLocalGame("test_identifier",
      player1,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);

    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Game.kibitz("mi1", game_id_local, testText);

    player1Collector.collect("kibitz", collections => {
      chai.assert.equal(collections.chat.length, 1, "Publication collector for player1 failed to store any kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      player2Collector.collect("kibitz", collections => {
        chai.assert.equal(collections.chat.length, 1, "Publication collector for player2 failed to store any kibitz");
        chai.assert.equal(collections.chat[0].what, testText, "player 2 failed to view kibitz");
        done();
      });
    });


  });
  it("chat records should be deleted when game records are deleted", function() {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();

    const game_id_local = Game.startLocalGame("test_identifier",
      player2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    Game.kibitz("mi1", game_id_local, testText);
    Game.resignLocalGame("mi1", game_id_local);
    Game.localRemoveObserver("mi2", game_id_local, player1._id);
    self.loggedonuser = player2;
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    Game.localRemoveObserver("mi2", game_id_local, player2._id);

    chai.assert.equal(Game.chatCollection.find({}).count(), 0, "failed to remove chat record with game record");

  });
  it("should be viewable by all observers", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();

    const game_id_local = Game.startLocalGame("test_identifier",
      player2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");

    Game.resignLocalGame("mi1", game_id_local);
    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Game.kibitz("mi1", game_id_local, testText);

    player1Collector.collect("kibitz", collections => {
      chai.assert.equal(collections.chat.length, 1, "Publication collector for player1 failed to store any kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      player2Collector.collect("kibitz", collections => {
        chai.assert.equal(collections.chat.length, 1, "Publication collector for player2 failed to store any kibitz");
        chai.assert.equal(collections.chat[0].what, testText, "player 2 failed to view kibitz");
        done();
      });
    });
  });
  it("should indicate if the user is not in the 'kibitz' role", function() {
    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Roles.removeUsersFromRoles(player1._id, "kibitz");
    Roles.addUsersToRoles(player2._id, "kibitz");

    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame("test_identifier",
      player2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);


    Game.kibitz("mi1", game_id_local, testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_KIBITZ", "Failed to prevent incorrect role kibitz");
    self.loggedonuser = player2;
    Game.kibitz("mi1", game_id_local, testText);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");


  });
  it("should indicate if the kibitz is a child_chat kibitz", function() {
   chai.assert.fail("do me");
  });
  it("should indicate if child_chat kibitz is not in child_chat role", function(){
    const testId = "HELLO";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Roles.removeUsersFromRoles(player1._id, "child_chat");
    Roles.addUsersToRoles(player2._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local =  Game.startLocalGame("test_identifier",
      player2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");



    Game.childChatKibitz("mi1",game_id_local, testId);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_NOT_ALLOWED", "Failed to prevent incorrect role child_chat");
    self.loggedonuser = player2;
    Game.childChatKibitz("mi1",game_id_local, testId);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");

  });
  it("should indicate if the kibitz is in child_chat role", function(){
    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Roles.removeUsersFromRoles(player2._id, "child_chat");
    Roles.addUsersToRoles(player1._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame("test_identifier",
      player2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white");


    Game.kibitz("mi1", game_id_local, testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_FREEFORM_NOT_ALLOWED", "Failed to prevent incorrect role child_chat");
    self.loggedonuser = player2;
    Game.kibitz("mi1", game_id_local, testText);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");

  });
  it("should indicate if the kibitz is not a child_chat kibitz", function() {
    // TODO: have to differentiate on collection side about difference
    chai.assert.fail("do me");

  });
  it("should also indicate if the kibitz is a child_chat_exempt kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should not publish non-compliant kibitzes (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a user in the child_chat group to execute free-form kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should only publish group kibitzes kibitzer is in a group and kibitzee is group restricted", function() {
    chai.assert.fail("do me");
  });
  it("should publish all kibitzes even if a kibitzee is in a group when user is not group restricted", function() {
    chai.assert.fail("do me");
  });
});

describe.skip("whispers", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should save an action in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by both players during game play", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by all observers", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the user is not in the 'whisper' role", function() {
    chai.assert.fail("do me");
  });
  it("should indicate if the whisper is a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the whisper is not a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the whisper is a child_chat_exempt whisper", function() {
    chai.assert.fail("do me");
  });
  it("should not publish non-compliant whispers (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a user in the child_chat group to execute free-form whisper", function() {
    chai.assert.fail("do me");
  });
  it("should not allow any user to issue a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
});

// Deadlines:
// JULY 1:
// Tourn(no time), examine mode(taken), coaching, chatting features, stockfish best lines, bots,