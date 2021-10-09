import chai from "chai";
import { Chat } from "../Chat";
//import { Game } from "./Game";
import { Users } from "../../collections/users";
import { TestHelpers } from "../TestHelpers";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

describe("kibitzes", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should save an action in the game record for local games", function() {
    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    chai.assert.isFunction(
      Chat.kibitz,
      "kibitz failed to be a function when adding action to record"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);

    const localCollection = Game.collection.findOne({ _id: game_id_local });

    chai.assert(
      localCollection.actions,
      "actions failed to be a field in local game collection when kibitz is used"
    );

    chai.assert.equal(
      localCollection.actions[0].type,
      "kibitz",
      "Failed to update game record's actions of local game with kibitz"
    );

    chai.assert.deepEqual(
      localCollection.actions[0].parameter,
      { what: testText },
      "Failed to save action of kibitz in local game collection"
    );
  });

  // DDD: Yea, don't worry about legacy game so much. kibitzes for legacy games are TOTALLY different.
  //      The logic is actually that we need "localKibitz" and "legacyKibitz". Technically you should change the name of your function(s)
  //      to be prefixed with local, and this test is incorrect. sending local kibitzes to a legacy game should crash.
  it("should save an action in the game record for legacy games", function() {
    const testText = "Hello I am a test string!";
    const other = TestHelpers.createUser();
    self.loggedonuser = other;
    const game_id_legacy = Game.startLegacyGame(
      "test_identifier",
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
      ""
    );

    chai.assert.isFunction(
      Chat.kibitz,
      "kibitz failed to be a function when adding action to record"
    );

    Chat.kibitz("mi1", game_id_legacy, true, testText);

    const legacyCollection = Game.collection.findOne({ _id: game_id_legacy });

    chai.assert(
      legacyCollection.actions,
      "actions failed to be a field in legacy game collection when kibitz is used"
    );

    chai.assert.equal(
      legacyCollection.actions[0].type,
      "kibitz",
      "Failed to update game record's actions of legacy game with kibitz"
    );

    chai.assert.deepEqual(
      legacyCollection.actions[0].parameter,
      { what: testText },
      "Failed to save action of kibitz in legacy game collection"
    );
  });

  it("should save an action in the game record for examined games", function() {
    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const game_id_examined = Game.startLocalExaminedGame(
      "test_identifier",
      "someone",
      "someother",
      0
    );

    chai.assert.isFunction(
      Chat.kibitz,
      "kibitz failed to be a function when adding action to record"
    );

    Chat.kibitz("mi1", game_id_examined, true, testText);

    const examinedCollection = Game.collection.findOne({ _id: game_id_examined });

    chai.assert(
      examinedCollection.actions,
      "actions failed to be a field in examined game collection when kibitz is used"
    );

    chai.assert.equal(
      examinedCollection.actions[0].type,
      "kibitz",
      "Failed to update game record's actions of examined game with kibitz"
    );

    chai.assert.deepEqual(
      examinedCollection.actions[0].parameter,
      { what: testText },
      "Failed to save action of kibitz in examined game collection"
    );
  });

  it("should be viewable by both players during game play", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.addUserToRoles(player1, "kibitz");
    Users.addUserToRoles(player2, "kibitz");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);

    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Chat.kibitz("mi1", game_id_local, true, testText);

    player1Collector.collect("chat", collections => {
      self.loggedonuser = player1;
      chai.assert.equal(
        collections.chat.length,
        1,
        "Publication collector for player1 failed to store any kibitz"
      );
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      player2Collector.collect("chat", collections => {
        self.loggedonuser = player2;
        chai.assert.equal(
          collections.chat.length,
          1,
          "Publication collector for player2 failed to store any kibitz"
        );
        chai.assert.equal(collections.chat[0].what, testText, "player 2 failed to view kibitz");
        done();
      });
    });
  });
  //
  // I do not know how to get the test to wait for observeChanges() calls
  //
  it.skip("chat records should be deleted when game records are deleted", function(done) {
    this.timeout(5000);
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    Chat.kibitz("mi1", game_id_local, true, testText);
    Game.resignLocalGame("mi1", game_id_local);
    Game.localRemoveObserver("mi2", game_id_local, player1._id);
    self.loggedonuser = player2;
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);

    const cursor = Chat.collection.find().observeChanges({
      added() {},
      removed() {
        chai.assert.equal(
          Chat.collection.find({}).count(),
          0,
          "failed to remove chat record with game record"
        );
        cursor.stop();
        done();
      }
    });
    Game.localRemoveObserver("mi2", game_id_local, player2._id);
    chai.assert.equal(Game.collection.find().count(), 0);
  });

  it("should be viewable by all observers", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();
    const player3 = TestHelpers.createUser();
    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );
    self.loggedonuser = player3;
    Game.localAddObserver("mi3", game_id_local, player3._id);
    self.loggedonuser = player1;
    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    chai.assert.isDefined(player3);
    chai.assert.isDefined(player3._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    const player3Collector = new PublicationCollector({ userId: player3._id });
    Chat.kibitz("mi1", game_id_local, true, testText);

    // DDD: I don't think this is going to work the way you think it works. You'll have to ask me why, it's not
    //      easy to explain here. I can also help you write this in a way that does work.
    player1Collector.collect("chat", collections => {
      chai.assert.equal(
        collections.chat.length,
        1,
        "Publication collector for player1 failed to store any kibitz"
      );
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      self.loggedonuser = player2;
      player2Collector.collect("chat", collections => {
        chai.assert.equal(
          collections.chat.length,
          1,
          "Publication collector for player2 failed to store any kibitz"
        );
        chai.assert.equal(collections.chat[0].what, testText, "player 2 failed to view kibitz");
        self.loggedonuser = player3;
        player3Collector.collect("chat", collections => {
          chai.assert.equal(
            collections.chat.length,
            1,
            "Publication collector for player3 failed to store any kibitz"
          );
          chai.assert.equal(collections.chat[0].what, testText, "player 3 failed to view kibitz");
          done();
        });
      });
    });
  });
  it("should indicate if the user is not in the 'kibitz' role", function() {
    const testText = "Hello I am a test string!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.removeUserFromRoles(player1._id, "kibitz");
    Users.addUserToRoles(player2._id, "kibitz");

    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);

    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "NOT_ALLOWED_TO_KIBITZ",
      "Failed to prevent incorrect role kibitz"
    );
    self.loggedonuser = player2;
    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.isFalse(
      self.clientMessagesSpy.calledTwice,
      "Client message sent even though of correct role"
    );
    chai.assert(
      self.clientMessagesSpy.args.length === 1,
      "Client message sent even though of correct role"
    );
    // DDD: You might want to make sure the kibitzes weren't saved
  });
  it("should indicate if the kibitz is a child_chat kibitz", function() {
    const testId = Chat.childChatCollection.insert({ text: "child chat 1" });
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.addUserToRoles(player1._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testId);
    chai.assert.equal(
      Chat.collection.find({}).count(),
      1,
      "failed to add chat record with game record"
    );
    chai.assert.equal(
      Chat.collection.findOne({}).child_chat,
      true,
      "child chat kibitz failed to set the child chat field"
    );

    chai.assert.equal(
      Chat.collection.findOne({}).what,
      "child chat 1",
      "child chat kibitz failed to set what field"
    );
  });
  it("should indicate if the kibitz is in child_chat role", function() {
    // DDD: I'm confused about this test. Isn't this the test that's supposed to allow a child to save a child chat kibitz?
    //      From the title, that's what it looks like it's supposed to be, but I don't think the test is doing that...?
    const testText = "Hello I am a test string!";

    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.removeUserFromRoles(player2._id, "child_chat");
    Users.addUserToRoles(player1._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "CHILD_CHAT_FREEFORM_NOT_ALLOWED",
      "Failed to prevent incorrect role child_chat"
    );
    self.loggedonuser = player2;
    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.isFalse(
      self.clientMessagesSpy.calledTwice,
      "Client message sent even though of correct role"
    );
    chai.assert(
      self.clientMessagesSpy.args.length === 1,
      "Client message sent even though of correct role"
    );
  });
  // DDD: I'm not sure I'm really following all of the titles here.
  it("should indicate if the kibitz is not a child_chat kibitz", function() {
    const testText = "I am a test String!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.addUserToRoles(player1._id, "kibitz");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.equal(
      Chat.collection.find({}).count(),
      1,
      "failed to add chat record with game record"
    );
    chai.assert.equal(
      Chat.collection.findOne({}).child_chat,
      false,
      "Kibitz set the child chat field"
    );
    chai.assert.equal(
      Chat.collection.findOne({}).what.length,
      testText.length,
      "Kibitz failed to set what field"
    );
  });
  // DDD: Same
  it("should also indicate if the kibitz is a child_chat_exempt kibitz", function() {
    const testText = "I am a test String!";
    self.loggedonuser = TestHelpers.createUser();
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.addUserToRoles(player1._id, "child_chat_exempt");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.equal(
      Chat.collection.find({}).count(),
      1,
      "failed to add chat record with game record"
    );
    const chat = Chat.collection.findOne();
    chai.assert.equal(chat.what, testText, "Exempt kibitz set the what field incorrectly");
    chai.assert.equal(chat.child_chat, true, "Exempt Kibitz failed to set exempt field");
  });
  it("should not publish non-compliant kibitzes (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();

    Users.addUserToRoles(player1._id, "kibitz");
    Users.addUserToRoles(player2._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Chat.kibitz("mi1", game_id_local, true, testText);

    // DDD: You have to set self.loggedonuser before calling one of these (which is why your group of three above aren't going to work.)
    //      You are getting player1's records. Is that what you want here? (If so, it's actually correct.)
    player1Collector.collect("chat", collections => {
      chai.assert.notEqual(
        collections.chat,
        undefined,
        "Publication collector for player1 failed to store any kibitz"
      );
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      // DDD: OK, so maybe it is correct, because you are doing it correctly here, but I didn't see you doing this above.
      self.loggedonuser = player2;
      player2Collector.collect("chat", collections => {
        chai.assert.equal(
          collections.chat,
          undefined,
          "Publication collector for player2 failed ignore any kibitz"
        );
        done();
      });
    });
  });
  it("published kibitz cannot be viewed outside of game", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    const player3 = TestHelpers.createUser();
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    const player3Collector = new PublicationCollector({ userId: player3._id });

    self.loggedonuser = player1;
    player1Collector.collect("chat", collections => {
      chai.assert.equal(
        collections.chat[0].what,
        testText,
        "player in game failed to see own kibitz"
      );

      self.loggedonuser = player2;
      player2Collector.collect("chat", collections => {
        chai.assert.equal(
          collections.chat[0].what,
          testText,
          "player also in game failed to see game's kibitz"
        );

        self.loggedonuser = player3;
        player3Collector.collect("chat", collections => {
          chai.assert.equal(
            collections.chat,
            undefined,
            "player outside of game saw kibitz from game"
          );
          done();
        });
      });
    });
  });

  it("should not allow a user in the child_chat role to execute free-form kibitz", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    Users.removeUserFromRoles(player2._id, "child_chat");
    Users.addUserToRoles(player1._id, "child_chat");
    self.loggedonuser = player1;

    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Chat.kibitz("mi1", game_id_local, true, testText);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce, "player 1 didn't make message");
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, player1._id, "wrong message id");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1", "wrong message_identifier");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "CHILD_CHAT_FREEFORM_NOT_ALLOWED",
      "Failed to prevent incorrect role child_chat"
    );
    const player1Collector = new PublicationCollector({ userId: player1._id });

    player1Collector.collect("chat", collections => {
      self.loggedonuser = player1; // DDD: Two things, First, this won't work inside the collect, it has to be before.
      //      Second, I think this is overkill for ensuring children can't issue free form kibitzes. Just make sure their texts didn't make it into the collection.
      chai.assert.equal(
        collections.chat,
        undefined,
        "Free-Form Kibitz when in child_chat role not prevented"
      );
      done();
    });
  });

  it("should be viewable by all examiners", function(done) {
    const testText = "Hello I am a test string!";
    const player1 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const player2 = TestHelpers.createUser();
    const game_id_local = Game.startLocalGame(
      "test_identifier",
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
      "white"
    );

    Game.resignLocalGame("mi4", game_id_local);

    chai.assert.isDefined(player1);
    chai.assert.isDefined(player1._id);
    chai.assert.isDefined(player2);
    chai.assert.isDefined(player2._id);
    const player1Collector = new PublicationCollector({ userId: player1._id });
    const player2Collector = new PublicationCollector({ userId: player2._id });
    Chat.kibitz("mi1", game_id_local, true, testText);

    player1Collector.collect("chat", collections => {
      chai.assert.equal(
        collections.chat.length,
        1,
        "Publication collector for player1 failed to store any examined kibitz"
      );
      chai.assert.equal(collections.chat[0].what, testText, "player 1 failed to view kibitz");
      self.loggedonuser = player2;
      player2Collector.collect("chat", collections => {
        chai.assert.equal(
          collections.chat.length,
          1,
          "Publication collector for player2 failed to store any examined kibitz"
        );
        chai.assert.equal(collections.chat[0].what, testText, "player 2 failed to view kibitz");
        done();
      });
    });
  });
});
