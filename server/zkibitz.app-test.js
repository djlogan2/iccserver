
import chai from "chai";
import { Game } from "../server/Game";
import { Users } from "../imports/collections/users";
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

    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);

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

    Game.kibitz("mi1", game_id_legacy,false,false,true,false,[], testText);

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

    Game.kibitz("mi1", game_id_examined,false,false,true,false,[], testText);

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
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);

    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);

    player1Collector.collect("kibitz", collections => {
      self.loggedonuser = player1;
      chai.assert.equal(collections.chat.length, 1, "Publication collector for player1 failed to store any kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      player2Collector.collect("kibitz", collections => {
        self.loggedonuser = player2;
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
    Game.kibitz("mi1", game_id_local,false,false,true,false,[],testText);
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
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Game.kibitz("mi1", game_id_local,false,false,true,false,[],testText);

    player1Collector.collect("kibitz", collections => {

      chai.assert.equal(collections.chat.length, 1, "Publication collector for player1 failed to store any kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      self.loggedonuser = player2;
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


    Game.kibitz("mi1", game_id_local,false,false,true,false,[],testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWED_TO_KIBITZ", "Failed to prevent incorrect role kibitz");
    self.loggedonuser = player2;
    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");


  });
  it("should indicate if the kibitz is a child_chat kibitz", function() {
    const testId = "01";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
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


    Game.kibitz("mi1", game_id_local,false,true,true,false,[],testId);
    chai.assert.equal(Game.chatCollection.find({}).count(), 1, "failed to add chat record with game record");
    chai.assert.isUndefined(Game.chatCollection.findOne({}).what, "child chat kibitz set the child chat field");

    chai.assert.equal(Game.chatCollection.findOne({}).childChatId.length,testId.length, "child chat kibitz failed to set what field");

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



    Game.kibitz("mi1",game_id_local,false,true,true,false,[], testId);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_NOT_ALLOWED", "Failed to prevent incorrect role child_chat");
    self.loggedonuser = player2;
    Game.kibitz("mi1",game_id_local,false,true,true,false,[], testId);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");

  });
  it("should indicate if the kibitz is in child_chat role", function(){
    const testText = "Hello I am a test string!";

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


    Game.kibitz("mi1",game_id_local,false,false,true,false,[], testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_FREEFORM_NOT_ALLOWED", "Failed to prevent incorrect role child_chat");
    self.loggedonuser = player2;
    Game.kibitz("mi1",game_id_local, false,false,true,false,[], testText);
    chai.assert.isFalse(self.clientMessagesSpy.calledTwice, "Client message sent even though of correct role");
    chai.assert(self.clientMessagesSpy.args.length == 1, "Client message sent even though of correct role");

  });
  it("should indicate if the kibitz is not a child_chat kibitz", function() {
    const testText = "I am a test String!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Roles.addUsersToRoles(player1._id, "kibitz");
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


    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);
    chai.assert.equal(Game.chatCollection.find({}).count(), 1, "failed to add chat record with game record");
    chai.assert.isUndefined(Game.chatCollection.findOne({}).what, "Kibitz set the child chat field");
    chai.assert.equal(Game.chatCollection.findOne({}).what.length,testText.length, "Kibitz failed to set what field");


  });
  it("should also indicate if the kibitz is a child_chat_exempt kibitz", function() {
    const testText = "I am a test String!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Roles.addUsersToRoles(player1._id, "child_chat_exempt");
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


    Game.kibitz("mi1", game_id_local,true,false,true,false,[], testText);
    chai.assert.equal(Game.chatCollection.find({}).count(), 1, "failed to add chat record with game record");
    chai.assert.isUndefined(Game.chatCollection.findOne({}).what, "Exempt kibitz set the what field incorrectly");
    chai.assert.equal(Game.chatCollection.findOne({}).what.length,testText.length, "Exempt Kibitz failed to set exempt field");

  });
  it("should not publish non-compliant kibitzes (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();

    Roles.addUsersToRoles(player1._id, "kibitz");
    Roles.addUsersToRoles(player2._id, "child_chat");
    Roles.removeUsersFromRoles(player2._id, "kibitz");
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
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);

    player1Collector.collect("kibitz", collections => {

      chai.assert.equal(collections.chat.length, 1, "Publication collector for player1 failed to store any kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      self.loggedonuser = player2;
      player2Collector.collect("kibitz", collections => {
        chai.assert.isEmpty(collections.chat,"Publication collector for player2 failed ignore any kibitz");
        done();
      });
    });
  });
  it("should not allow a user in the child_chat group to execute free-form kibitz", function(done) {
    const testText = "Hello I am a test string!";
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


    Game.kibitz("mi1",game_id_local,false,false,true,false,[], testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CHILD_CHAT_FREEFORM_NOT_ALLOWED", "Failed to prevent incorrect role child_chat");
    const player1Collector = new PublicationCollector({ userId: player1._id });

    player1Collector.collect("kibitz", collections => {
      self.loggedonuser = player1;
      chai.assert.isEmpty(collections.chat, "Free-Form Kibitz when in child_chat role not prevented");
      done();
    });
  });
  it("should only publish group kibitzes kibitzer is in a group and kibitzee is group restricted", function(done) {
    const testText = "Hello I am a test string!";
    const testText2 = "Only group members can see this!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    const player3 = TestHelpers.createUser();
    Roles.addUsersToRoles(player2._id, "add_to_group");
    Roles.addUsersToRoles(player3._id, "add_to_group");
    Roles.addUsersToRoles(player2._id, "group_restricted");
    Roles.addUsersToRoles(player3._id, "group_restricted");
    self.loggedonuser = player2;
    Users.addToGroup("mi3", player2._id, "testGroup");
    self.loggedonuser = player3;
    Users.addToGroup("mi4", player3._id, "testGroup");
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
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    chai.assert.isDefined(player3);
    chai.assert.isDefined(player3._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    const player3Collector = new PublicationCollector({ userId: player3._id });

    Game.kibitz("mi1", game_id_local,false,false,true,false,["testGroup"], testText);
    self.loggedonuser = player2;
    Game.kibitz("mi2", game_id_local, false,false,true,true,["testGroup"], testText2);
    self.loggedonuser = player1;

    player1Collector.collect("kibitz", collections => {
      chai.assert.equal(collections.chat.length, 1, "public members got a restricted kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "got wrong message as public message");
      self.loggedonuser = player2;
      player2Collector.collect("kibitz", collections => {
        chai.assert.equal(collections.chat.length, 2, "group didn't get only both public and restricted messages");
        chai.assert.equal(collections.chat[0].what, testText, "public text not in collection of group");
        chai.assert.equal(collections.chat[1].what, testText2, "group text failed to be found by members");
        self.loggedonuser = player3;
        player3Collector.collect("kibitz", collections => {
          chai.assert.equal(collections.chat.length,2, "second member of group failed to get public and restricted");
          chai.assert.equal(collections.chat[0].what, testText, "second member didn't get public message");
          chai.assert.equal(collections.chat[1].what, testText2, "second member didn't get group message");
          done();
        });
      });
    });
  });
  it("should publish all kibitzes even if a kibitzee is in a group when user is not group restricted", function(done) {
    const testText = "Hello I am a test string!";
    const testText2 = "Hello to the world from testGroup!";
    const testText3 = "Only group members can see this";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    const player3 = TestHelpers.createUser();
    Roles.addUsersToRoles(player2._id, "add_to_group");
    Roles.addUsersToRoles(player3._id, "add_to_group");
    Roles.addUsersToRoles(player3._id, "group_restricted");

    self.loggedonuser = player2;

    Users.addToGroup("mi3", player2._id, "testGroup");
    self.loggedonuser = player3;

    Users.addToGroup("mi4", player3._id, "testGroup");
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
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    chai.assert.isDefined(player3);
    chai.assert.isDefined(player3._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    const player3Collector = new PublicationCollector({ userId: player3._id });

    Game.kibitz("mi1", game_id_local,false,false,true,false,[], testText);
    self.loggedonuser = player2;
    Game.kibitz("mi2", game_id_local, false,false,true,false,["testGroup"], testText2);
    self.loggedonuser = player3;
    Game.kibitz("mi5", game_id_local, false,false,true,true,["testGroup"], testText3);
    self.loggedonuser = player1;
    player1Collector.collect("kibitz", collections => {
      chai.assert.equal(collections.chat.length, 2, "public members got a restricted kibitz");
      chai.assert.equal(collections.chat[0].what, testText, "got wrong message as public message");
      chai.assert.equal(collections.chat[1].what), testText2, "group failed to broadcast non-restricted message";
      self.loggedonuser = player2;
      player2Collector.collect("kibitz", collections => {
        chai.assert.equal(collections.chat.length, 3, "group didn't get only both public and restricted messages");
        chai.assert.equal(collections.chat[0].what, testText, "public text not in collection of group");
        chai.assert.equal(collections.chat[1].what, testText2, "non-restricted text failed to be found by members");
        chai.assert.equal(collections.chat[2].what, testText3, "restricted text found by group member");
        self.loggedonuser = player3;
        player3Collector.collect("kibitz", collections => {
          chai.assert.equal(collections.chat.length,3, "second member of group failed to get public and restricted");
          chai.assert.equal(collections.chat[0].what, testText, "second member didn't get public message");
          chai.assert.equal(collections.chat[1].what, testText2, "second member didn't get group non-restritcted message");
          chai.assert.equal(collections.chat[2].what, testText3, "second member doesn't see his own message, sadness");
          done();
        });
      });
    });
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

