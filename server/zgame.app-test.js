import { TestHelpers } from "../imports/server/TestHelpers";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Game } from "./Game";
import { Match } from "meteor/check";
import chai from "chai";
import { standard_member_roles } from "../imports/server/userConstants";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";

function startLegacyGameParameters(self, other, rated) {
  if (rated === undefined || rated === null) rated = true;
  return [
    "mi1",
    999,
    typeof self === "string" ? self : self.profile.legacy.username,
    typeof other === "string" ? other : other.profile.legacy.username,
    0,
    "Standard",
    rated,
    15,
    0,
    15,
    0,
    true,
    2000,
    1900,
    "gameid",
    ["GM"],
    ["GM"],
    "",
    "",
    "",
    "",
    "",
    ""
  ];
}

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
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, otherguy)
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
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, otherguy, false)
    );
    Game.saveLegacyMove("mi2", 999, "c3");
    Game.saveLegacyMove("mi3", 999, "e5");
    Game.saveLegacyMove("mi4", 999, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
  });

  it("should use the same chess js game (or a copy) when a locally played game switches to an examined game", function() {
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
    Game.resignGame("mi4", game_id);
    Game.saveLocalMove("mi5", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi5");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "ILLEGAL_MOVE");
  });
});

describe("Game.startLocalGame", function() {
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

  it("should error out if self is null", function() {
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi1",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          15,
          0,
          true
        ),
      Match.Error
    );
  });
  it("should error out if the user is starting a rated game and cannot play rated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    const us = TestHelpers.createUser({ roles: roles });
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLocalGame(
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
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_RATED_GAMES"
    );
  });
  it("should error out if the user is starting an unrated game and cannot play unrated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    const us = TestHelpers.createUser({ roles: roles });
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLocalGame(
      "mi",
      otherguy,
      0,
      "standard",
      false,
      15,
      0,
      15,
      0,
      true,
      "white"
    );
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_UNRATED_GAMES"
    );
  });

  it("should be fine if a user cannot play rated games, but the game is examined", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    const us = TestHelpers.createUser({ roles: roles });
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
    chai.assert.isTrue(self.clientMessagesFake.notCalled);
    chai.assert.equal(Game.collection.find().count(), 1);
  });

  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ roles: roles });
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
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_OPPONENT"
    );
  });
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ roles: roles });
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi",
      otherguy,
      0,
      "standard",
      false,
      15,
      0,
      15,
      0,
      true,
      "white"
    );
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_OPPONENT"
    );
  });
  it("should error out if the user isn't logged on", function() {
    self.loggedonuser = TestHelpers.createUser({ login: false });
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi1",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          15,
          0,
          true
        ),
      ICCMeteorError
    );
  });
  //   black/white_initial/increment
  it("should error out if times fail validation", function() {
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake.returns(false)
    );
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi1",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          15,
          0,
          true
        ),
      ICCMeteorError
    );
  });
  it("should error out if played_game is not 'true' or 'false'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi1",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          15,
          0,
          "yep"
        ),
      Match.Error
    );
  });
  it("should add an examined game to the database if played_game is true", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    Game.startLocalGame(
      "mi1",
      otherguy,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      true
    );
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 1);
    chai.assert.equal(game[0].status, "playing");
  });
  it("should add a playing game to the database if played_game is false", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    Game.startLocalGame(
      "mi1",
      otherguy,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      false
    );
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 1);
    chai.assert.equal(game[0].status, "examining");
  });
  it("should add a playing game to the database with a random(ish--it's actually an algorithm) color if null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      Game.startLocalGame(
        "mi1",
        otherguy,
        0,
        "standard",
        true,
        15,
        0,
        15,
        0,
        true
      );
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
    chai.assert.isTrue(
      game.filter(g => g.white.id === self.loggedonuser._id).length > 0
    );
    chai.assert.isTrue(
      game.filter(g => g.black.id === self.loggedonuser._id).length > 0
    );
  });
  it("should add a playing game with the player as white if white is specified", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      Game.startLocalGame(
        "mi1",
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
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
    chai.assert.equal(
      game.filter(g => g.white.id === self.loggedonuser._id).length,
      10
    );
    chai.assert.equal(
      game.filter(g => g.black.id === self.loggedonuser._id).length,
      0
    );
  });
  it("should add a playing game with the player as black if black is specified", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      Game.startLocalGame(
        "mi1",
        otherguy,
        0,
        "standard",
        true,
        15,
        0,
        15,
        0,
        true,
        "black"
      );
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
    chai.assert.equal(
      game.filter(g => g.white.id === self.loggedonuser._id).length,
      0
    );
    chai.assert.equal(
      game.filter(g => g.black.id === self.loggedonuser._id).length,
      10
    );
  });
  it("should fail if color is not null, 'black' or 'white'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi1",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          15,
          0,
          true,
          "green!"
        ),
      Match.Error
    );
  });
});

describe("Game.startLegacyGame", function() {
  this.timeout(500000);
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

  it("should error out if the user isn't logged on", function() {
    self.loggedonuser = TestHelpers.createUser({ login: false });
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(
          null,
          startLegacyGameParameters(self.loggedonuser, otherguy)
        ),
      ICCMeteorError
    );
  });

  it("should error out if self is null", function() {
    self.loggedonuser = undefined;
    const otherguy = TestHelpers.createUser();
    const thirdguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(
          null,
          startLegacyGameParameters(thirdguy, otherguy)
        ),
      ICCMeteorError
    );
  });

  it("should error out user is neither white nor black", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const thirdguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(
          null,
          startLegacyGameParameters(thirdguy, otherguy)
        ),
      ICCMeteorError
    );
  });
  //  message_identifier,
  //   gamenumber,
  it("should error out game number is invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[1] = "nine-nine-nine";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  it("should error out game number already exists", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      Game.startLegacyGame.apply(
        null,
        startLegacyGameParameters(self.loggedonuser, otherguy)
      )
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(
          null,
          startLegacyGameParameters(self.loggedonuser, otherguy)
        ),
      ICCMeteorError
    );
    chai.assert.equal(Game.collection.find().count(), 1);
  });
  //   whitename,
  //   blackname,
  //   wild_number,
  //   rating_type,
  //   rated,
  it("should error out if rated isn't boolean", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[6] = "yep";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   white_initial,
  it("should error out if white initial isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[7] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   white_increment,
  it("should error out if white increment isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[8] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   black_initial,
  it("should error out if black initial isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[9] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   black_increment,
  it("should error out if black increment isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[10] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   played_game,
  it("should error out if played_game isn't a boolean", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[11] = "yep";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   white_rating,
  it("should error out if white_rating isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[12] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   black_rating,
  it("should error out if black_rating isn't a number", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[13] = "fifteen";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   game_id,
  //   white_titles,
  it("should error out if white_titles isn't an array", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[15] = "GM C TD";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  //   black_titles,
  it("should error out if black_titles isn't an array", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(
      0
    );
    args[16] = "GM C TD";
    chai.assert.throws(
      () => Game.startLegacyGame.apply(null, args),
      Match.Error
    );
  });
  it("should add a record if all is ok", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      Game.startLegacyGame.apply(
        null,
        startLegacyGameParameters(self.loggedonuser, otherguy)
      )
    );
    chai.assert.equal(Game.collection.find().count(), 1);
  });

  it("should add white.id if we can find a legacy record that matches", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.equal(game_record.white.id, self.loggedonuser._id);
    chai.assert.isUndefined(game_record.black.id);
  });

  it("should add black.id if we can find a legacy record that matches", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters("otherguy", self.loggedonuser)
    );

    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.isUndefined(game_record.white.id);
    chai.assert.equal(game_record.black.id, self.loggedonuser._id);
  });

  it("should add both white.id and black.id if we can find legacy records that match", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(otherguy, self.loggedonuser)
    );

    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.equal(game_record.white.id, otherguy._id);
    chai.assert.equal(game_record.black.id, self.loggedonuser._id);
  });

  it("should fail to save to the database if neither white.id nor black.id are specified", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(
          null,
          startLegacyGameParameters("guy1", "guy2")
        ),
      ICCMeteorError
    );
  });
  //   ex_string,
  //   irregular_legality,
  //   irregular_semantics,
  //   uses_plunkers,
  //   fancy_timecontrol,
  //   promote_to_king
});
