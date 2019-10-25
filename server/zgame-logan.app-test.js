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

  it("should NOT create a chess js game for a legacy played game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame(
      "mi1",
      999,
      us.profile.legacy.username,
      otherguy.profile.legacy.username,
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      true,
      1200,
      1300,
      888,
      ["GM"],
      ["GM"],
      ""
    );
    Game.saveLegacyMove("mi2", 999, "c3");
    Game.saveLegacyMove("mi3", 999, "e5");
    Game.saveLegacyMove("mi4", 999, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
  });

  it("should NOT create a chess js game for a legacy examined game", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame(
      "mi1",
      999,
      us.profile.legacy.username,
      otherguy.profile.legacy.username,
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      false,
      1200,
      1300,
      888,
      ["GM"],
      ["GM"],
      ""
    );
    Game.saveLegacyMove("mi2", 999, "c3");
    Game.saveLegacyMove("mi3", 999, "e5");
    Game.saveLegacyMove("mi4", 999, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
  });

  it("should use the same chess js game (or a copy) when a locally played game switches to an examined game", function() {
    chai.assert.fail("do me");
  });
});

describe("Game.startLocalGame", function() {
  it("should error out if the user isn't logged on", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting a rated game and cannot play rated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting an unrated game and cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if self is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out user is neither white nor black", function() {
    chai.assert.fail("do me");
  });
  //   white,
  it("should error out if white is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if wild is not zero", function() {
    chai.assert.fail("do me");
  });
  it("should error out if rating_type is not in the ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should error out if rated is not 'true' or 'false', and of course both of those work", function() {
    chai.assert.fail("do me");
  });
  //   white_initial,
  it("should error out if white_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   white_increment,
  it("should error out if white_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   black_initial,
  it("should use white_initial if black_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should use white_increment if black_increment is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should error out if played_game is not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  });
  it("should add an examined game to the database if played_game is false", function() {
    chai.assert.fail("do me");
  });
  it("should add a playing game to the database if played_game is true", function() {
    chai.assert.fail("do me");
  });
});
