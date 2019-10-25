import { TestHelpers } from "../imports/server/TestHelpers";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Game } from "./Game";
import chai from "chai";

describe("Match requests and game starts", function() {
  const self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should create a chess js game for a local played game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi",
      otherguy,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      true,
      "white"
    );
    Game.saveLocalMove("mi2", game_id, "c3");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "ILLEGAL_MOVE");
  });

  it("should create a chess js game for a local examined game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi",
      otherguy,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      false,
      "white"
    );
    Game.saveLocalMove("mi2", game_id, "c3");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "ILLEGAL_MOVE");
  });

  it.only("should NOT create a chess js game for a legacy played game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLegacyGame("mi1", 999, us.profile.legacy.username, otherguy.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, true, 1200, 1300, 888, ["GM"], ["GM"], "");
    Game.saveLegacyMove("mi2", game_id, "c3");
    Game.saveLegacyMove("mi3", game_id, "e5");
    Game.saveLegacyMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
  });

  it("should NOT create a chess js game for a legacy examined game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLegacyGame("mi1", 999, us.profile.legacy.username, otherguy.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, false, 1200, 1300, 888, ["GM"], ["GM"], "");
    Game.saveLegacyMove("mi2", game_id, "c3");
    Game.saveLegacyMove("mi3", game_id, "e5");
    Game.saveLegacyMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
  });

  it("should use the same chess js game (or a copy) when a locally played game switches to an examined game", function() {
    chai.assert.fail("do me");
  });
});
