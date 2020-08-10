import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Meteor } from "meteor/meteor";

describe("startBotGame", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should return a call of startLocalGame", function() {
    self.loggedonuser = TestHelpers.createUser();
    const call = Game.startBotGame(
      "mi1",
      0,
      "standard",
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white",
      1600
    );
    const game = Game.collection.findOne({ _id: call });
    chai.assert.equal(game._id, call, "Correct ID not returned by startBotGame");
    chai.assert.deepEqual(Game.collection.findOne({ _id: call }), game);
  });
});

describe("addAction", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("Should update GameCollection's actions with an action", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    Game.addAction(game_id, { type: "kibitz", issuer: p1._id, parameter: { what: "who dis?" } });
    const chat = Game.collection.findOne({ _id: game_id, status: "playing" });
    delete chat.actions[0].time;
    chai.assert.deepEqual(chat.actions, [
      { type: "kibitz", issuer: p1._id, parameter: { what: "who dis?" } }
    ]);
  });
});

describe("getAndCheck", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should throw an error when no active game is found", function() {
    const p1 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game = {
      starttime: new Date(),
      isolation_group: "public",
      fen: "?",
      tomove: "white",
      pending: {
        white: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        },
        black: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        }
      },
      white: {
        id: "a",
        name: "a",
        rating: 1600
      },
      black: {
        id: "b",
        name: "b",
        rating: 1600
      },
      wild: 0,
      rating_type: "?",
      rated: true,
      skill_level: 1600,
      clocks: {
        white: {
          initial: 0,
          inc_or_delay: 0,
          delaytype: "none",
          current: 1000, // milliseconds
          starttime: new Date().getTime()
        },
        black: {
          initial: 0,
          inc_or_delay: 0,
          delaytype: "none",
          current: 1000, //milliseconds
          starttime: 0
        }
      },
      status: "playing",
      actions: [],
      observers: [],
      variations: { hmtb: 0, cmi: 0, movelist: [{}] },
      computer_variations: [],
      lag: {
        white: {
          active: [],
          pings: []
        },
        black: {
          active: [],
          pings: []
        }
      }
    };

    Game.collection.insert(game);
    chai.assert.throws(() => {
      self.loggedonuser._id = "computer";
      Game.getAndCheck(self.loggedonuser, "mi1", Game.collection.findOne({})._id);
      return;
    }, "Unable to find chessboard validator for game");
  });

  it("should throw an ICCError when a legacy game is found", function() {
    const p1 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLegacyGame(
      "mi1",
      123,
      "white",
      p1.profile.legacy.username,
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      true,
      1600,
      1600,
      "x",
      [],
      [],
      ""
    );
    chai.assert.throws(() => {
      Game.getAndCheck(self.loggedonuser, "mi2", game_id);
      return;
    }, ICCMeteorError);
    chai.assert.throws(() => {
      Game.getAndCheck(self.loggedonuser, "mi2", game_id);
      return;
    }, "Found a legacy game record");
  });

  it("should send a client message NOT_PLAYING_A_GAME when computer is used on getAndCheck", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = "bogus";
    Game.getAndCheck(self.loggedonuser, "mi2", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    return;
  });

  it("should return a game query when successful", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.deepEqual(
      Game.getAndCheck(self.loggedonuser, "mi2", game_id),
      Game.collection.findOne({ _id: game_id })
    );
  });
});
describe("startLocalGame", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should throw an error when other user is String", function() {
    const str = "some string";
    const err = Meteor.Error("Unable to start local game", "other_user must be 'computer' only");
    const p1 = TestHelpers.createUser();
    self.loggedonuser = p1;
    chai.assert.throws(() => {
      Game.startLocalGame("mi1", str, 0, "none", false, 0, 0, "inc", 0, 0, "inc", "white", 1600);
    }, err);
  });

  it("should throw an error when other user is not computer and skill_level is defined", function() {
    const p1 = TestHelpers.createUser();
    const err = Meteor.Error(
      "Unable to start local game",
      "Skill level can only be defined for bot play"
    );
    self.loggedonuser = p1;
    chai.assert.throws(() => {
      Game.startLocalGame("mi1", p1, 0, "none", false, 0, 0, "inc", 0, 0, "inc", "white");
    }, err);
  });
  it("should give a client message when other_user isn't computer and other user isn't online", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    p2.status.online = false;
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", false, 0, 0, "inc", 0, 0, "inc", "white");

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
  });
});
