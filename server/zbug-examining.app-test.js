import chai from "chai";
import { Game } from "./Game";
import { TestHelpers } from "../imports/server/TestHelpers";

describe.only("When starting a game", function() {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });
  it("should remove you as an observer from all games when starting a local game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    const p4 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    self.loggedonuser = p3;
    Game.localAddObserver("mi2", game_id, p3._id);
    chai.assert.isDefined(Game.collection.findOne({ observers: p3._id }));

    Game.startLocalGame("mi3", p4, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.isUndefined(Game.collection.findOne({ observers: p3._id }));
  });
  it("should remove you as an observer from all games when starting a legacy game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    self.loggedonuser = p3;
    Game.localAddObserver("mi2", game_id, p3._id);
    chai.assert.isDefined(Game.collection.findOne({ observers: p3._id }));

    Game.startLegacyGame(
      "mi3",
      123,
      p3.profile.legacy.username,
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
    chai.assert.isDefined(Game.collection.findOne({ status: "playing", "white.id": p3._id }));
    chai.assert.isUndefined(Game.collection.findOne({ observers: p3._id }));
  });
  it("should remove you as an observer from all games when examining a new game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);

    self.loggedonuser = p3;
    Game.localAddObserver("mi2", game_id, p3._id);
    chai.assert.isDefined(Game.collection.findOne({ observers: p3._id }));

    const game2_id = Game.startLocalGame(
      "mi1",
      p2,
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

    chai.assert.isDefined(Game.collection.findOne({ status: "playing", "white.id": p3._id }));
    chai.assert.isUndefined(Game.collection.findOne({ observers: p3._id }));
  });
  it("should not allow a user to start a playing game if one is already being played", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    chai.assert.isDefined(Game.collection.findOne({ status: "playing", "white.id": p1._id }));

    Game.startLocalGame("mi2", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not allow a user to start an examined game if one is already being played", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    chai.assert.isDefined(Game.collection.findOne({ status: "playing", "white.id": p1._id }));

    Game.startLocalExaminedGame("mi2", "whiteguy", "blackguy", 0);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not allow a user to start a legacy game if one is already being played", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );

    self.loggedonuser = p2;

    Game.startLegacyGame(
      "mi3",
      123,
      p2.profile.legacy.username,
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });
});

describe.skip("When logging out", function() {
  it("should remove you as an observer form all games", function() {
    chai.assert.fail("do me");
  });
  it("should move all games being played to the adjourned collection", function() {
    chai.assert.fail("do me");
  });
});
