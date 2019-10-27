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
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
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
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
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
    self.loggedonuser = us;
    Game.saveLegacyMove("mi2", 999, "c3");
    self.loggedonuser = otherguy;
    Game.saveLegacyMove("mi3", 999, "e5");
    self.loggedonuser = us;
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
    self.loggedonuser = us;
    Game.saveLegacyMove("mi2", 999, "c3");
    self.loggedonuser = otherguy;
    Game.saveLegacyMove("mi3", 999, "e5");
    self.loggedonuser = us;
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
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.resignLocalGame("mi4", game_id);
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
        Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0),
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

  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ roles: roles });
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
        Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0),
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
        Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0),
      ICCMeteorError
    );
  });

  it("should add an examined game to the database if played_game is true", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0);
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 1);
    chai.assert.equal(game[0].status, "playing");
  });

  it("should add a playing game to the database with a random(ish--it's actually an algorithm) color if null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0);
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
          "green!"
        ),
      Match.Error
    );
  });
});

describe("Game.startLegacyGame", function() {
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

  it("should error if we try to start a legacy game when both players are actually logged on here", function(){
    //
    // OK, so here's the deal. If a user is logged on here, they can play a legacy user.
    // But I assert that if both players are logged on here, don't go through legacy. Just play local.
    // TODO: I also say that in the list of logged on users, it doesn't show legacy users that are also logged on here. Only legacy users that aren't also logged on here.
    // By the way, I think this will error out by default due to the duplicate game number, but we should do something more specific.
    //
    chai.assert.fail("do me");
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

// TODO: It occurs to me that if we are just getting legacy moves, how do we know what the board looks like?
//       Think a wild, like atomic or something. Hmmm...
describe("Game.saveLegacyMove", function() {
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
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.saveLegacyMove("mi1", 999, "e4"),
      Match.Error
    );
  });

  it("should error out if we don't have a game record", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.saveLegacyMove("mi1", 999, "e4"),
      ICCMeteorError
    );
  });

  it("pushes an action when it succeeds", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    // Sure, leave it this way, legacy move saves aren't suppose to check legality
    const moves = ["e4", "e5", "Nf2", "Nf6", "Nc3"];
    moves.forEach(move => Game.saveLegacyMove("mi1", 999, move));

    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.isDefined(games[0].actions);
    chai.assert.equal(games[0].actions.length, moves.length);
    for (let x = 0; x < moves.length; x++) {
      chai.assert.equal(games[0].actions[x].type, "move");
      chai.assert.equal(games[0].actions[x].parameter, moves[x]);
    }
  });
  //  check(message_identifier, String);
  //   check(game_id, Number);
  //   check(move, String);
});

describe("Game.saveLocalMove", function() {
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
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.saveLocalMove("mi2", game_id, "e4"),
      Match.Error
    );
  });

  it("should error out if a game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.saveLocalMove("mi2", "game_id", "e4"),
      ICCMeteorError
    );
  });

  it("should write a client_message and not save the move to the dataabase if the move is illegal", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );
    Game.saveLocalMove("mi2", game_id, "O-O");
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "ILLEGAL_MOVE");
  });

  it("should end the game if the move results in a stalemate", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );
    // eslint-disable-next-line prettier/prettier
        const moves = ["e3", "a5", "Qh5", "Ra6", "Qxa5", "h5", "h4", "Rah6", "Qxc7", "f6", "Qxd7", "Kf7", "Qxb7", "Qd3", "Qxb8", "Qh7", "Qxc8", "Kg6", "Qe6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
  });

  it("should end the game if the move results in a checkmate", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );
    const moves = ["f4", "e6", "g4", "Qh4"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "0-1");
  });
  //
  it("should end the game if the move results in an insufficient material draw", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );
    // Yea, I had to do this one manually, so it's a zillion moves. Feel free to shorten!
    // eslint-disable-next-line prettier/prettier
        const moves = ["e4", "e5", "f4", "exf4", "g3", "fxg3", "Nf3", "gxh2", "Rxh2", "f5", "exf5", "d5", "d4", "c5", "dxc5", "b6", "cxb6", "Nc6", "bxa7", "Rxa7", "Qxd5", "Bxf5", "Rxh7", "Rxa2", "Rxh8", "Rxa1", "Rxg8", "Rxb1", "Rxf8", "Kxf8", "Qxc6", "Rxb2", "Qc8", "Rxc2", "Qxd8", "Kf7", "Nd4", "Rxc1", "Kd2", "Rxf1", "Nxf5", "Rxf5", "Qd7", "Kf6", "Qxg7", "Ke6", "Qg6", "Rf6", "Qxf6", "Kxf6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
  });

  //
  it("should not end the game if the move results in a draw by repetition situation", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );

    // eslint-disable-next-line prettier/prettier
        const moves = ["e4", "e5", "Be2", "Be7", "Bf1", "Bf8", "Be2", "Be7", "Bf1", "Bf8", "Be2"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });

    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "playing");
    chai.assert.equal(game.result, "*");

    Game.requestLocalDraw("mi2", game_id);

    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2);
    chai.assert.equal(game2.status, "examining");
    chai.assert.equal(game2.result, "1/2-1/2");
  });

  it("should fail if the game is a legacy game", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLegacyGame(
      "mi",
      999,
      us.profile.legacy.username,
      "otherguy",
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      true,
      1600,
      1700,
      "id",
      [],
      [],
      ""
    );
    chai.assert.throws(
      () => Game.saveLocalMove("mi2", game_id, "e4"),
      ICCMeteorError
    );
  });

  it("should fail if the wrong user is trying to make a move in a played game (i.e. black is trying to make a legal white move", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      "white"
    );

    Game.saveLocalMove("move1", game_id, "e4");
    Game.saveLocalMove("move2", game_id, "e5");
    self.loggedonuser = them;
    Game.saveLocalMove("move3", game_id, "e5");
    Game.saveLocalMove("move4", game_id, "Nc3");
    self.loggedonuser = us;
    Game.saveLocalMove("move5", game_id, "Nc3");

    chai.assert.isTrue(self.clientMessagesFake.calledTwice);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "move2");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );

    chai.assert.equal(self.clientMessagesFake.args[1][0]._id, them._id);
    chai.assert.equal(self.clientMessagesFake.args[1][1], "move4");
    chai.assert.equal(
      self.clientMessagesFake.args[1][2],
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );
  });
});

describe("Game.legacyGameEnded", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(
      () =>
        Game.legacyGameEnded(
          "mi",
          999,
          true,
          "Mat",
          "0-1",
          "Checkmated",
          "B00"
        ),
      Match.Error
    );
  });

  it("should fail if game id cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.legacyGameEnded(
          "mi",
          999,
          true,
          "Mat",
          "0-1",
          "Checkmated",
          "B00"
        ),
      ICCMeteorError
    );
  });

  it("should fail if user is neither player", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.legacyGameEnded(
          "mi",
          999,
          true,
          "Mat",
          "0-1",
          "Checkmated",
          "B00"
        ),
      ICCMeteorError
    );
  });

  it("should fail if game is not being played", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    chai.assert.doesNotThrow(() =>
      Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00")
    );
    chai.assert.throws(
      () =>
        Game.legacyGameEnded(
          "mi",
          999,
          true,
          "Mat",
          "0-1",
          "Checkmated",
          "B00"
        ),
      ICCMeteorError
    );
  });

  it("should convert to examined if become_examined is true", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00");
    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.equal(games[0].status, "examining");
  });

  it("should be deleted if become_examined is false", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(
      null,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    Game.legacyGameEnded("mi", 999, false, "Mat", "0-1", "Checkmated", "B00");
    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 0);
  });
});

describe("Game.localAddExaminer", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.localAddExamainer("mi2", game_id, newguy._id),
      Match.Error
    );
  });

  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localAddExamainer("mi2", null, newguy),
      Match.Error
    );
  });

  it("should fail if game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localAddExamainer("mi2", "xyz", newguy._id),
      ICCMeteorError
    );
  });

  // I'll consider writing a client message for this, but one would assume the client itself would say "cannot remove a played game"
  it("should fail if game is still being played", function() {
    self.loggedonuser = TestHelpers.createUser();
    const opponent = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalGame(
      "mi1",
      opponent,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0
    );
    Game.localAddExamainer("mi2", game_id, newguy._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should write a client message if user being added is not an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.localAddExamainer("mi2", game_id, newguy._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NOT_AN_OBSERVER");
  });

  it("should fail if user doing the adding isn't an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy1 = TestHelpers.createUser();
    const newguy2 = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = newguy1;
    Game.localAddObserver("mi2", game_id, newguy1._id);
    self.loggedonuser = newguy2;
    Game.localAddObserver("mi2", game_id, newguy2._id);
    Game.localAddExamainer("mi2", game_id, newguy1._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should write a client message if user being added is already an examiner", function() {
    const us = TestHelpers.createUser();
    const newguy1 = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = newguy1;
    Game.localAddObserver("mi2", game_id, newguy1._id);
    self.loggedonuser = us;
    Game.localAddExamainer("mi2", game_id, newguy1._id);
    Game.localAddExamainer("mi2", game_id, newguy1._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "ALREADY_AN_EXAMINER"
    );
  });

  it("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const users = [];

    for (let x = 0; x < 10; x++) users.push(TestHelpers.createUser());

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );

    const observers = [];
    const examiners = [];

    for (let x = 0; x < 10; x++) {
      observers.push(users[x]);
      self.loggedonuser = users[x];
      Game.localAddObserver(
        "add-observer-" + users[x]._id,
        game_id,
        users[x]._id
      );
    }

    observers.push(us);
    examiners.push(us);

    self.loggedonuser = us;
    for (let x = 0; x < 5; x++) {
      Game.localAddExamainer("add-examiner-" + x, game_id, observers[x]._id);
      examiners.push(observers[x]);
    }

    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.isDefined(games[0].observers);
    chai.assert.isDefined(games[0].examiners);
    chai.assert.equal(games[0].observers.length, observers.length);
    chai.assert.equal(games[0].examiners.length, examiners.length);
    chai.assert.sameMembers(observers.map(ob => ob._id), games[0].observers);
    chai.assert.sameMembers(examiners.map(ex => ex._id), games[0].examiners);
  });
});

describe("Game.localRemoveExaminer", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.localAddExamainer("mi2", game_id, newguy._id);
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", game_id, newguy._id),
      Match.Error
    );
  });

  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", null, newguy._id),
      Match.Error
    );
  });

  it("should fail if game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", "somegame", newguy._id),
      ICCMeteorError
    );
  });

  it("should fail if target user is not an examiner", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const observer = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    self.loggedonuser = us;
    Game.localRemoveExaminer("mi4", game_id, observer._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should fail if issuer is not a current examiner of the game", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const newguy = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.localAddExamainer("mi2", game_id, newguy._id);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    self.loggedonuser = observer;
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", game_id, us._id),
      ICCMeteorError
    );
  });

  it("should fail if user is to evict himself", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", game_id, us._id),
      ICCMeteorError
    );
  });

  it("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const users = [];

    for (let x = 0; x < 10; x++) users.push(TestHelpers.createUser());

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );

    const observers = [];
    const examiners = [];

    for (let x = 0; x < 10; x++) {
      observers.push(users[x]);
      self.loggedonuser = users[x];
      Game.localAddObserver(
        "add-observer-" + users[x]._id,
        game_id,
        users[x]._id
      );
    }

    self.loggedonuser = us;
    for (let x = 0; x < 5; x++) {
      Game.localAddExamainer("add-examiner-" + x, game_id, observers[x]._id);
      examiners.push(observers[x]);
    }

    while (examiners.length) {
      const examiner = examiners.shift();
      Game.localRemoveExaminer("remove-" + examiner._id, game_id, examiner._id);
    }

    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.isDefined(games[0].examiners);
    chai.assert.equal(games[0].examiners.length, 1);
    chai.assert.sameMembers([us._id], games[0].examiners);
  });
});

describe("Game.localAddObserver", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.localAddObserver("mi2", game_id, newguy._id),
      Match.Error
    );
  });

  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localAddObserver("mi2", null, newguy._id),
      Match.Error
    );
  });

  it("should fail if game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localAddObserver("mi2", "somegame", newguy._id),
      ICCMeteorError
    );
  });

  it("should fail if user is trying to add another user (and not himself)", function() {
    self.loggedonuser = TestHelpers.createUser();
    const opponent = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const game_id = Game.startLocalGame(
      "mi1",
      opponent,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0
    );
    self.loggedonuser = observer;
    chai.assert.throws(
      () => Game.localAddObserver("mi2", game_id, victim._id),
      ICCMeteorError
    );
  });

  it("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const opponent = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    const randomguy = TestHelpers.createUser();

    self.loggedonuser = us;
    const game_id1 = Game.startLocalGame(
      "mi1",
      opponent,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0
    );

    self.loggedonuser = randomguy;
    const game_id2 = Game.startLocalExaminedGame(
      "mi2",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );

    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id1, observer._id);
    Game.localAddObserver("mi4", game_id2, observer._id);

    const ipgame = Game.collection.findOne({ status: "playing" });
    const exgame = Game.collection.findOne({ status: "examining" });
    chai.assert.isDefined(ipgame);
    chai.assert.isDefined(exgame);
    chai.assert.isDefined(ipgame.observers);
    chai.assert.isDefined(exgame.observers);
    chai.assert.equal(ipgame.observers.length, 1);
    chai.assert.equal(exgame.observers.length, 2);

    chai.assert.sameMembers(ipgame.observers, [observer._id]);
    chai.assert.sameMembers(exgame.observers, [randomguy._id, observer._id]);

    self.loggedonuser = opponent;
    Game.resignLocalGame("mi5", game_id1);

    const game3 = Game.collection.findOne({ _id: game_id1 });
    chai.assert.sameMembers(game3.observers, [
      us._id,
      opponent._id,
      observer._id
    ]);
    chai.assert.sameMembers(game3.examiners, [us._id, opponent._id]);
  });
});

describe("Game.localRemoveObserver", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", game_id, newguy._id),
      Match.Error
    );
  });
  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", null, newguy._id),
      Match.Error
    );
  });
  it("should fail if game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", "somegame", newguy._id),
      ICCMeteorError
    );
  });

  it("should return a client message if user is not an observer", function() {
    const us = TestHelpers.createUser();
    const dumbguy = TestHelpers.createUser();

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = dumbguy;
    Game.localRemoveObserver("mi2", game_id, dumbguy._id);
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][0], dumbguy._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NOT_AN_OBSERVER");
  });

  it("should fail if user is trying to evict another user", function() {
    const us = TestHelpers.createUser();
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser();

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    self.loggedonuser = victim;
    Game.localAddObserver("mi2", game_id, victim._id);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id, abuser._id);
    self.loggedonuser = us;
    Game.localAddExamainer("mi3", game_id, abuser._id); // Make him an examiner just to maximize ability!
    self.loggedonuser = abuser;
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", game_id, victim._id),
      ICCMeteorError
    );
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", game_id, us._id),
      ICCMeteorError
    ); // Might as well check this one too
  });

  it("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const opponent = TestHelpers.createUser();
    const examiner = TestHelpers.createUser();
    const observer = TestHelpers.createUser();

    self.loggedonuser = us;
    const playing_game = Game.startLocalGame(
      "mi1",
      opponent,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0
    );

    self.loggedonuser = examiner;
    const examined_game = Game.startLocalExaminedGame(
      "mi2",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );

    self.loggedonuser = observer;
    Game.localAddObserver("mi3", playing_game, observer._id);
    Game.localAddObserver("mi4", examined_game, observer._id);

    const pg1 = Game.collection.findOne({ status: "playing" });
    const ex1 = Game.collection.findOne({ status: "examining" });

    chai.assert.notEqual(pg1.observers.indexOf(observer._id), -1);
    chai.assert.notEqual(ex1.observers.indexOf(observer._id), -1);

    Game.localRemoveObserver("mi5", playing_game, observer._id);
    Game.localRemoveObserver("mi5", examined_game, observer._id);

    const pg2 = Game.collection.findOne({ status: "playing" });
    const ex2 = Game.collection.findOne({ status: "examining" });

    chai.assert.equal(pg2.observers.indexOf(observer._id), -1);
    chai.assert.equal(ex2.observers.indexOf(observer._id), -1);
  });

  it.only("should delete the record if the last examiner leaves, regardless of observers left", function() {
    const examiner = TestHelpers.createUser();
    const observer = TestHelpers.createUser();

    self.loggedonuser = examiner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0, "standard", 15, 0, 15, 0);

    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);

    self.loggedonuser = examiner;
    Game.localRemoveObserver("mi3", game_id, examiner._id);

    chai.assert.equal(Game.collection.find().count(), 0);
  });
});

describe("Game.removeLegacyGame", function() {
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

  it("should fail if self is null", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.removeLegacyGame("mi2", 999), Match.Error);
  });
  it("should fail if legacy game number is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => Game.removeLegacyGame("mi2", null), Match.Error);
  });
  it("should fail if game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => Game.removeLegacyGame("mi2", 111), ICCMeteorError);
  });
  it.only("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser =
    Game.startLegacyGame.apply(null, startLegacyGameParameters(us, opp));
    chai.assert.fail("do me");
  });
});
