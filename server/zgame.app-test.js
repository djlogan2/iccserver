import { TestHelpers } from "../imports/server/TestHelpers";
//import { Game } from "./Game";
//import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Match } from "meteor/check";
import chai from "chai";
import { standard_member_roles } from "../imports/server/userConstants";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { LegacyUser } from "../lib/server/LegacyUsers";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { TimestampClient } from "../lib/Timestamp";
import { buildPgnFromMovelist } from "../lib/exportpgn";
import Chess from "chess.js";

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
    false,
  ];
}

describe("Match requests and game starts", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should create a chess js game for a local played game", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.saveLocalMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
  });

  it("should create a chess js game for a local examined game", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.saveLocalMove("mi4", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
  });

  it.skip("should NOT create a chess js game for a legacy played game", function () {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy));
    self.loggedonuser = us;
    Game.saveLegacyMove("mi2", 999, "c3");
    self.loggedonuser = otherguy;
    Game.saveLegacyMove("mi3", 999, "e5");
    self.loggedonuser = us;
    Game.saveLegacyMove("mi4", 999, "Nc3");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  it.skip("should NOT create a chess js game for a legacy examined game", function () {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy, false));
    self.loggedonuser = us;
    Game.saveLegacyMove("mi2", 999, "c3");
    self.loggedonuser = otherguy;
    Game.saveLegacyMove("mi3", 999, "e5");
    self.loggedonuser = us;
    Game.saveLegacyMove("mi4", 999, "Nc3");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  it("should use the same chess js game (or a copy) when a locally played game switches to an examined game", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "c3");
    self.loggedonuser = otherguy;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.resignLocalGame("mi4", game_id);
    Game.saveLocalMove("mi5", game_id, "Nc3");
    chai.assert.isTrue(self.clientMessagesSpy.calledThrice); // The first two are the game status messages
    chai.assert.equal(self.clientMessagesSpy.args[2][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[2][1], "mi5");
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "ILLEGAL_MOVE");
  });
});

describe("Game.startLocalGame", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should error out if self is null", function () {
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, "none", 15, 0, "none"),
      Match.Error
    );
  });
  it("should error out if the user is starting a rated game and cannot play rated games", function () {
    const roles = standard_member_roles.filter((role) => role !== "play_rated_games");
    const us = TestHelpers.createUser({ roles: roles });
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLocalGame("mi", otherguy, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_RATED_GAMES");
  });
  it("should error out if the user is starting an unrated game and cannot play unrated games", function () {
    const roles = standard_member_roles.filter((role) => role !== "play_unrated_games");
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_UNRATED_GAMES");
  });

  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function () {
    const roles = standard_member_roles.filter((role) => role !== "play_rated_games");
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ roles: roles });
    self.loggedonuser = us;
    Game.startLocalGame("mi", otherguy, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
  });
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function () {
    const roles = standard_member_roles.filter((role) => role !== "play_unrated_games");
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
  });
  it("should error out if the user isn't logged on", function () {
    self.loggedonuser = TestHelpers.createUser({ login: false });
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, "none", 15, 0, "none"),
      ICCMeteorError
    );
  });

  it("should add a playing game to the database with a random(ish--it's actually an algorithm) color if null", function () {
    this.timeout(10000);
    let whites = 0;
    let blacks = 0;
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = TestHelpers.createUser();
      const otherguy = TestHelpers.createUser();
      const game_id = Game.startLocalGame(
        "mi1",
        otherguy,
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
      const game = Game.collection.findOne({ _id: game_id });
      if (game.white.id === self.loggedonuser._id) whites++;
      else blacks++;
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
    chai.assert.isTrue(whites > 0);
    chai.assert.isTrue(blacks > 0);
  });

  it("should add a playing game with the player as white if white is specified", function () {
    this.timeout(10000);
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = TestHelpers.createUser();
      const otherguy = TestHelpers.createUser();
      const game_id = Game.startLocalGame(
        "mi1",
        otherguy,
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
      const g = Game.collection.findOne({ _id: game_id });
      chai.assert.equal(g.white.id, self.loggedonuser._id);
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
  });

  it("should add a playing game with the player as black if black is specified", function () {
    this.timeout(10000);
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = TestHelpers.createUser();
      const otherguy = TestHelpers.createUser();
      const game_id = Game.startLocalGame(
        "mi1",
        otherguy,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "black"
      );
      const g = Game.collection.findOne({ _id: game_id });
      chai.assert.equal(g.black.id, self.loggedonuser._id);
    }
    const game = Game.collection.find().fetch();
    chai.assert.equal(game.length, 10);
  });

  it("should fail if color is not null, 'black' or 'white'", function () {
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
          "none",
          15,
          0,
          "none",
          "green!"
        ),
      Match.Error
    );
  });
});

describe("Game.startLegacyGame", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should error if we try to start a legacy game when both players are actually logged on here", function () {
    const legacy1 = TestHelpers.createUser();
    const legacy2 = TestHelpers.createUser();
    self.sandbox.replace(LegacyUser, "isLoggedOn", self.sandbox.fake.returns(true));

    self.loggedonuser = legacy1;
    chai.assert.throws(
      () => Game.startLegacyGame.apply(Game, startLegacyGameParameters(legacy1, legacy2, true)),
      ICCMeteorError
    );
  });

  it("should error out if the user isn't logged on", function () {
    self.loggedonuser = TestHelpers.createUser({ login: false });
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy)),
      ICCMeteorError
    );
  });

  it("should error out if self is null", function () {
    self.loggedonuser = undefined;
    const otherguy = TestHelpers.createUser();
    const thirdguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLegacyGame.apply(Game, startLegacyGameParameters(thirdguy, otherguy)),
      ICCMeteorError
    );
  });

  it("should error out user is neither white nor black", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const thirdguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLegacyGame.apply(Game, startLegacyGameParameters(thirdguy, otherguy)),
      ICCMeteorError
    );
  });
  //  message_identifier,
  //   gamenumber,
  it("should error out game number is invalid", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[1] = "nine-nine-nine";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  it("should error out game number already exists", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy))
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.throws(
      () =>
        Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy)),
      ICCMeteorError
    );
    chai.assert.equal(Game.collection.find().count(), 1);
  });
  //   whitename,
  //   blackname,
  //   wild_number,
  //   rating_type,
  //   rated,
  it("should error out if rated isn't boolean", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[6] = "yep";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   white_initial,
  it("should error out if white initial isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[7] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   white_increment,
  it("should error out if white increment isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[8] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   black_initial,
  it("should error out if black initial isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[9] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   black_increment,
  it("should error out if black increment isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[10] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   played_game,
  it("should error out if played_game isn't a boolean", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[11] = "yep";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   white_rating,
  it("should error out if white_rating isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[12] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   black_rating,
  it("should error out if black_rating isn't a number", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[13] = "fifteen";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   game_id,
  //   white_titles,
  it("should error out if white_titles isn't an array", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[15] = "GM C TD";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  //   black_titles,
  it("should error out if black_titles isn't an array", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const args = startLegacyGameParameters(self.loggedonuser, otherguy).slice(0);
    args[16] = "GM C TD";
    chai.assert.throws(() => Game.startLegacyGame.apply(Game, args), Match.Error);
  });
  it("should add a record if all is ok", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, otherguy))
    );
    chai.assert.equal(Game.collection.find().count(), 1);
  });

  it("should add white.id if we can find a legacy record that matches", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      Game,
      startLegacyGameParameters(self.loggedonuser, "otherguy")
    );
    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.equal(game_record.white.id, self.loggedonuser._id);
    chai.assert.isUndefined(game_record.black.id);
  });

  it("should add black.id if we can find a legacy record that matches", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      Game,
      startLegacyGameParameters("otherguy", self.loggedonuser)
    );

    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.isUndefined(game_record.white.id);
    chai.assert.equal(game_record.black.id, self.loggedonuser._id);
  });

  it("should add both white.id and black.id if we can find legacy records that match", function () {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLegacyGame.apply(
      Game,
      startLegacyGameParameters(otherguy, self.loggedonuser)
    );

    const game_record = Game.collection.findOne({ _id: game_id });
    chai.assert.isDefined(game_record);
    chai.assert.equal(game_record.white.id, otherguy._id);
    chai.assert.equal(game_record.black.id, self.loggedonuser._id);
  });

  it("should fail to save to the database if neither white.id nor black.id are specified", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLegacyGame.apply(Game, startLegacyGameParameters("guy1", "guy2")),
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

describe.skip("Game.saveLegacyMove", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should error out if self is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.saveLegacyMove("mi1", 999, "e4"), Match.Error);
  });

  it("should error out if we don't have a game record", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => Game.saveLegacyMove("mi1", 999, "e4"), ICCMeteorError);
  });

  it("pushes an action when it succeeds", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    // Sure, leave it this way, legacy move saves aren't suppose to check legality
    const moves = ["e4", "e5", "Nf2", "Nf6", "Nc3"];
    moves.forEach((move) => Game.saveLegacyMove("mi1", 999, move));

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

describe("Game.saveLocalMove", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should error out if a game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.saveLocalMove("mi1", "somegame", "e4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client_message and not save the move to the dataabase if the move is illegal", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.saveLocalMove("mi2", game_id, "O-O");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
  });

  it("should end the game if the move results in a stalemate", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    // eslint-disable-next-line prettier/prettier
        const moves = ["e3", "a5", "Qh5", "Ra6", "Qxa5", "h5", "h4", "Rah6", "Qxc7", "f6", "Qxd7", "Kf7", "Qxb7", "Qd3", "Qxb8", "Qh7", "Qxc8", "Kg6", "Qe6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach((move) => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
  });

  it("should end the game if the move results in a checkmate", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    const moves = ["f4", "e6", "g4", "Qh4"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach((move) => {
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
  it("should end the game if the move results in an insufficient material draw", function () {
    this.timeout(5000);
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
      "none",
      15,
      0,
      "none",
      "white"
    );
    // Yea, I had to do this one manually, so it's a zillion moves. Feel free to shorten!
    // eslint-disable-next-line prettier/prettier
        const moves = ["e4", "e5", "f4", "exf4", "g3", "fxg3", "Nf3", "gxh2", "Rxh2", "f5", "exf5", "d5", "d4", "c5", "dxc5", "b6", "cxb6", "Nc6", "bxa7", "Rxa7", "Qxd5", "Bxf5", "Rxh7", "Rxa2", "Rxh8", "Rxa1", "Rxg8", "Rxb1", "Rxf8", "Kxf8", "Qxc6", "Rxb2", "Qc8", "Rxc2", "Qxd8", "Kf7", "Nd4", "Rxc1", "Kd2", "Rxf1", "Nxf5", "Rxf5", "Qd7", "Kf6", "Qxg7", "Ke6", "Qg6", "Rf6", "Qxf6", "Kxf6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach((move) => {
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
  it("should not end the game if the move results in a draw by repetition situation", function () {
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
      "none",
      15,
      0,
      "none",
      "white"
    );

    // eslint-disable-next-line prettier/prettier
        const moves = ["e4", "e5", "Be2", "Be7", "Bf1", "Bf8", "Be2", "Be7", "Bf1", "Bf8", "Be2"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach((move) => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });

    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.equal(game.status, "playing");

    Game.requestLocalDraw("mi2", game_id);

    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2);
    chai.assert.equal(game2.status, "examining");
    chai.assert.equal(game2.result, "1/2-1/2");
  });

  it("should fail if the game is a legacy game", function () {
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
    chai.assert.throws(() => Game.saveLocalMove("mi2", game_id, "e4"), ICCMeteorError);
  });

  it("should fail if the wrong user is trying to make a move in a played game (i.e. black is trying to make a legal white move", function () {
    const us = TestHelpers.createUser({ premove: false });
    const them = TestHelpers.createUser({ premove: false });
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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

    Game.saveLocalMove("move1", game_id, "e4");
    Game.saveLocalMove("move2", game_id, "e5");
    self.loggedonuser = them;
    Game.saveLocalMove("move3", game_id, "e5");
    Game.saveLocalMove("move4", game_id, "Nc3");
    self.loggedonuser = us;
    Game.saveLocalMove("move5", game_id, "Nc3");

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "move2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "COMMAND_INVALID_NOT_YOUR_MOVE");

    chai.assert.equal(self.clientMessagesSpy.args[1][0]._id, them._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "move4");
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "COMMAND_INVALID_NOT_YOUR_MOVE");
  });
});

describe("Game.legacyGameEnded", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = undefined;
    chai.assert.throws(
      () => Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00"),
      Match.Error
    );
  });

  it("should fail if game id cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00"),
      ICCMeteorError
    );
  });

  it("should fail if user is neither player", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00"),
      ICCMeteorError
    );
  });

  it("should fail if game is not being played", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    chai.assert.doesNotThrow(() =>
      Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00")
    );
    chai.assert.throws(
      () => Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00"),
      ICCMeteorError
    );
  });

  it("should convert to examined if become_examined is true", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    Game.legacyGameEnded("mi", 999, true, "Mat", "0-1", "Checkmated", "B00");
    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.equal(games[0].status, "examining");
  });

  it("should be deleted if become_examined is false", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(self.loggedonuser, "otherguy"));
    Game.legacyGameEnded("mi", 999, false, "Mat", "0-1", "Checkmated", "B00");
    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 0);
  });
});

describe("Game.localAddExaminer", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.localAddExaminer("mi2", game_id, newguy._id), Match.Error);
  });

  it("should fail if game_id is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localAddExaminer("mi2", null, newguy), Match.Error);
  });

  it("should fail if game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localAddExaminer("mi2", "xyz", newguy._id), ICCMeteorError);
  });

  // I'll consider writing a client message for this, but one would assume the client itself would say "cannot remove a played game"
  it("should fail if game is still being played", function () {
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
      "none",
      15,
      0,
      "none"
    );
    Game.localAddExaminer("mi2", game_id, newguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should write a client message if user being added is not an observer", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.localAddExaminer("mi2", game_id, newguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_OBSERVER");
  });

  it("should fail if user doing the adding isn't an examiner", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy1 = TestHelpers.createUser();
    const newguy2 = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = newguy1;
    Game.localAddObserver("mi2", game_id, newguy1._id);
    self.loggedonuser = newguy2;
    Game.localAddObserver("mi2", game_id, newguy2._id);
    Game.localAddExaminer("mi2", game_id, newguy1._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should write a client message if user being added is already an examiner", function () {
    const us = TestHelpers.createUser();
    const newguy1 = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = newguy1;
    Game.localAddObserver("mi2", game_id, newguy1._id);
    self.loggedonuser = us;
    Game.localAddExaminer("mi2", game_id, newguy1._id);
    Game.localAddExaminer("mi2", game_id, newguy1._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_AN_EXAMINER");
  });

  it("should succeed if everything else is well", function () {
    this.timeout(10000);
    const us = TestHelpers.createUser();
    const users = [];

    for (let x = 0; x < 10; x++) users.push(TestHelpers.createUser());

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);

    const observers = [];
    const examiners = [];

    for (let x = 0; x < 10; x++) {
      observers.push(users[x]);
      self.loggedonuser = users[x];
      Game.localAddObserver("add-observer-" + users[x]._id, game_id, users[x]._id);
    }

    observers.push(us);
    examiners.push(us);

    self.loggedonuser = us;
    for (let x = 0; x < 5; x++) {
      Game.localAddExaminer("add-examiner-" + x, game_id, observers[x]._id);
      examiners.push(observers[x]);
    }

    const games = Game.collection.find().fetch();
    chai.assert.isDefined(games);
    chai.assert.equal(games.length, 1);
    chai.assert.isDefined(games[0].observers);
    chai.assert.isDefined(games[0].examiners);
    chai.assert.equal(games[0].observers.length, observers.length);
    chai.assert.equal(games[0].examiners.length, examiners.length);
    chai.assert.sameMembers(
      observers.map((ob) => ob._id),
      games[0].observers.map((ob) => ob.id)
    );
    chai.assert.sameMembers(
      examiners.map((ex) => ex._id),
      games[0].examiners.map((ex) => ex.id)
    );
  });
});

describe("Game.localRemoveExaminer", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.localAddExaminer("mi2", game_id, newguy._id);
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.localRemoveExaminer("mi2", game_id, newguy._id), Match.Error);
  });

  it("should fail if game_id is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localRemoveExaminer("mi2", null, newguy._id), Match.Error);
  });

  it("should fail if game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveExaminer("mi2", "somegame", newguy._id),
      ICCMeteorError
    );
  });

  it("should fail if target user is not an examiner", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const observer = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    self.loggedonuser = us;
    Game.localRemoveExaminer("mi4", game_id, observer._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should fail if issuer is not a current examiner of the game", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const observer = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    Game.localRemoveExaminer("mi2", game_id, us._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should fail if user is to evict himself", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    chai.assert.throws(() => Game.localRemoveExaminer("mi2", game_id, us._id), ICCMeteorError);
  });

  it("should succeed if everything else is well", function () {
    const us = TestHelpers.createUser();
    const users = [];

    for (let x = 0; x < 10; x++) users.push(TestHelpers.createUser());

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);

    const observers = [];
    const examiners = [];

    for (let x = 0; x < 10; x++) {
      observers.push(users[x]);
      self.loggedonuser = users[x];
      Game.localAddObserver("add-observer-" + users[x]._id, game_id, users[x]._id);
    }

    self.loggedonuser = us;
    for (let x = 0; x < 5; x++) {
      Game.localAddExaminer("add-examiner-" + x, game_id, observers[x]._id);
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
    chai.assert.sameMembers(
      [us._id],
      games[0].examiners.map((ex) => ex.id)
    );
  });
});

describe("Game.localAddObserver", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.localAddObserver("mi2", game_id, newguy._id), Match.Error);
  });

  it("should fail if game_id is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localAddObserver("mi2", null, newguy._id), Match.Error);
  });

  it("should fail if game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localAddObserver("mi2", "somegame", newguy._id), ICCMeteorError);
  });

  it("should fail if user is trying to add another user (and not himself)", function () {
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
      "none",
      15,
      0,
      "none"
    );
    self.loggedonuser = observer;
    chai.assert.throws(() => Game.localAddObserver("mi2", game_id, victim._id), ICCMeteorError);
  });

  it("should succeed if everything else is well", function () {
    const us = TestHelpers.createUser();
    const opponent = TestHelpers.createUser();
    const observer1 = TestHelpers.createUser();
    const observer2 = TestHelpers.createUser();
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
      "none",
      15,
      0,
      "none"
    );

    self.loggedonuser = randomguy;
    const game_id2 = Game.startLocalExaminedGame("mi2", "whiteguy", "blackguy", 0);

    self.loggedonuser = observer1;
    Game.localAddObserver("mi3", game_id1, observer1._id);
    self.loggedonuser = observer2;
    Game.localAddObserver("mi4", game_id2, observer2._id);

    const ipgame = Game.collection.findOne({ status: "playing" });
    const exgame = Game.collection.findOne({ status: "examining" });
    chai.assert.isDefined(ipgame);
    chai.assert.isDefined(exgame);
    chai.assert.isDefined(ipgame.observers);
    chai.assert.isDefined(exgame.observers);
    chai.assert.equal(ipgame.observers.length, 1);
    chai.assert.equal(exgame.observers.length, 2);

    chai.assert.sameMembers(
      ipgame.observers.map((ob) => ob.id),
      [observer1._id]
    );
    chai.assert.sameMembers(
      exgame.observers.map((ob) => ob.id),
      [randomguy._id, observer2._id]
    );

    self.loggedonuser = opponent;
    Game.resignLocalGame("mi5", game_id1);

    const game3 = Game.collection.findOne({ _id: game_id1 });
    chai.assert.sameMembers(
      game3.observers.map((ob) => ob.id),
      [us._id, opponent._id, observer1._id]
    );
    chai.assert.sameMembers(
      game3.examiners.map((ex) => ex.id),
      [us._id, opponent._id]
    );
  });
});

describe("Game.localRemoveObserver", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.localRemoveObserver("mi2", game_id, newguy._id), Match.Error);
  });
  it("should fail if game_id is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(() => Game.localRemoveObserver("mi2", null, newguy._id), Match.Error);
  });
  it("should fail if game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    const newguy = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.localRemoveObserver("mi2", "somegame", newguy._id),
      ICCMeteorError
    );
  });

  it("should return a client message if user is not an observer", function () {
    const us = TestHelpers.createUser();
    const dumbguy = TestHelpers.createUser();

    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    self.loggedonuser = dumbguy;
    Game.localRemoveObserver("mi2", game_id, dumbguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], dumbguy._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_OBSERVER");
  });

  it("should only allow a user to observe one game at a time", function () {
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
      "none",
      15,
      0,
      "none"
    );

    self.loggedonuser = examiner;
    const examined_game = Game.startLocalExaminedGame("mi2", "whiteguy", "blackguy", 0);

    self.loggedonuser = observer;
    Game.localAddObserver("mi3", playing_game, observer._id);

    const pg3 = Game.collection.findOne({ status: "playing" });
    const ex3 = Game.collection.findOne({ status: "examining" });

    chai.assert.notEqual(pg3.observers.map((ob) => ob.id).indexOf(observer._id), -1);
    chai.assert.equal(ex3.observers.map((ob) => ob.id).indexOf(observer._id), -1);

    Game.localAddObserver("mi4", examined_game, observer._id);

    const pg1 = Game.collection.findOne({ status: "playing" });
    const ex1 = Game.collection.findOne({ status: "examining" });

    chai.assert.equal((pg1.observers || []).map((ob) => ob.id).indexOf(observer._id), -1);
    chai.assert.notEqual(ex1.observers.map((ob) => ob.id).indexOf(observer._id), -1);

    Game.localRemoveObserver("mi5", examined_game, observer._id);

    const pg2 = Game.collection.findOne({ status: "playing" });
    const ex2 = Game.collection.findOne({ status: "examining" });

    chai.assert.equal(pg2.observers.map((ob) => ob.id).indexOf(observer._id), -1);
    chai.assert.equal(ex2.observers.map((ob) => ob.id).indexOf(observer._id), -1);
  });

  it("should delete the record if the last examiner leaves, regardless of observers left", function () {
    const examiner = TestHelpers.createUser();
    const observer = TestHelpers.createUser();

    self.loggedonuser = examiner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);

    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);

    self.loggedonuser = examiner;
    Game.localRemoveObserver("mi3", game_id, examiner._id);

    chai.assert.equal(Game.collection.find().count(), 0);
  });
});

describe("Game.removeLegacyGame", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null", function () {
    self.loggedonuser = undefined;
    chai.assert.throws(() => Game.removeLegacyGame("mi2", 999), Match.Error);
  });
  it("should fail if legacy game number is null", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => Game.removeLegacyGame("mi2", null), Match.Error);
  });
  it("should fail if game cannot be found", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => Game.removeLegacyGame("mi2", 111), ICCMeteorError);
  });
  it("should succeed if everything else is well", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame.apply(Game, startLegacyGameParameters(us, opp));
    chai.assert.doesNotThrow(() => Game.removeLegacyGame("mi2", 999));
  });
});

function checkLastAction(gamerecord, reverse_index, type, issuer, parameter) {
  const action = gamerecord.actions[gamerecord.actions.length - 1 - reverse_index];
  if (type) chai.assert.equal(action.type, type);
  if (issuer) chai.assert.equal(action.issuer, issuer);
  if (parameter) {
    if (typeof parameter === "object") chai.assert.deepEqual(action.parameter, parameter);
    else chai.assert.equal(action.parameter, parameter);
  }
}

function checkOneTakeback(pendingcolor, takeback) {
  chai.assert.equal(pendingcolor.draw, "0");
  chai.assert.equal(pendingcolor.adjourn, "0");
  chai.assert.equal(pendingcolor.abort, "0");
  chai.assert.equal(
    pendingcolor.takeback.number,
    takeback === null || takeback === undefined ? 0 : takeback
  );
}

function checkxxx(gamerecord) {
  chai.assert.isDefined(gamerecord);
  if (gamerecord.status === "examining") {
    chai.assert.isUndefined(gamerecord.pending);
  } else {
    chai.assert.isDefined(gamerecord.pending);
    chai.assert.isDefined(gamerecord.pending.white);
    chai.assert.isDefined(gamerecord.pending.black);
    chai.assert.isDefined(gamerecord.pending.white.draw);
    chai.assert.isDefined(gamerecord.pending.white.abort);
    chai.assert.isDefined(gamerecord.pending.white.adjourn);
    chai.assert.isDefined(gamerecord.pending.white.takeback);
    chai.assert.isDefined(gamerecord.pending.white.takeback.number);
    chai.assert.isDefined(gamerecord.pending.white.takeback.mid);
    chai.assert.isDefined(gamerecord.pending.black.draw);
    chai.assert.isDefined(gamerecord.pending.black.abort);
    chai.assert.isDefined(gamerecord.pending.black.adjourn);
    chai.assert.isDefined(gamerecord.pending.black.takeback);
    chai.assert.isDefined(gamerecord.pending.black.takeback.number);
    chai.assert.isDefined(gamerecord.pending.black.takeback.mid);
  }
}

function checkTakeback(gamerecord, wtakeback, btakeback) {
  checkxxx(gamerecord);
  if (gamerecord.status === "examining") return;
  checkOneTakeback(gamerecord.pending.white, wtakeback);
  checkOneTakeback(gamerecord.pending.black, btakeback);
}

function checkDraw(gameRecord, white, black) {
  checkxxx(gameRecord);
  if (gameRecord.status === "examining") return;
  chai.assert.equal(gameRecord.pending.white.draw, white === undefined ? "0" : white);
  chai.assert.equal(gameRecord.pending.black.draw, black === undefined ? "0" : black);
}

function checkAbort(gameRecord, white, black) {
  checkxxx(gameRecord);
  if (gameRecord.status === "examining") return;
  chai.assert.equal(gameRecord.pending.white.abort, white === undefined ? "0" : white);
  chai.assert.equal(gameRecord.pending.black.abort, black === undefined ? "0" : black);
}

function checkAdjourn(gameRecord, white, black) {
  checkxxx(gameRecord);
  if (gameRecord.status === "examining") return;
  chai.assert.equal(gameRecord.pending.white.adjourn, white === undefined ? "0" : white);
  chai.assert.equal(gameRecord.pending.black.adjourn, black === undefined ? "0" : black);
}

describe("Takeback behavior", function () {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  it("restores both clocks to the same time as the move taken back to", function () {
    let timer = 0;
    self.gameNow.callsFake(() => {
      const t = timer;
      timer += (Random.fraction() * 60000) | 0;
      return t;
    });

    // So if say:
    // move 20, white clock: 25:00, black clock: 15:00,
    // at move 22, white clock: 5:00, black clock: 2:00,
    // if we takeback 2, then we are back at the position after move 19,
    //   with white clock at 25:00 and black clock at 15:00!
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    const current = [];
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      const game = Game.collection.findOne();
      current.push(game.clocks[game.tomove].current);
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());

    self.loggedonuser = p1;
    Game.requestLocalTakeback("mi4", game_id, 4);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    Game.acceptLocalTakeback("mi4", game_id);

    const game = Game.collection.findOne();
    chai.assert.equal(game.clocks.white.current, current[2]);
    chai.assert.equal(game.clocks.black.current, current[3]);
  });

  // giver_request  -> giver_request(same)        -> message, already pending
  it("will write a client message when takeback asker asks for another takeback with the same ply count", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi3", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_ALREADY_PENDING");

    const game = Game.collection.findOne();
    const takeback = game.actions[game.actions.length - 1];
    const lastmove = game.actions[game.actions.length - 2];

    checkOneTakeback(game.pending.white, 4);
    checkOneTakeback(game.pending.black, 0);
    chai.assert.equal(takeback.type, "takeback_requested");
    chai.assert.equal(takeback.parameter, 4);
    chai.assert.equal(lastmove.type, "move");
    chai.assert.deepEqual(lastmove.parameter, {
      move: "c6",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
  });

  //                -> giver_request(different)   -> message, already pending
  it("will write a client message when takeback asker asks for another takeback with a different ply count", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi3", game_id, 2));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_ALREADY_PENDING");

    const game = Game.collection.findOne();
    const takeback = game.actions[game.actions.length - 1];
    const lastmove = game.actions[game.actions.length - 2];

    checkOneTakeback(game.pending.white, 4);
    checkOneTakeback(game.pending.black, 0);
    chai.assert.equal(takeback.type, "takeback_requested");
    chai.assert.equal(takeback.parameter, 4);
    chai.assert.equal(lastmove.type, "move");
    chai.assert.deepEqual(lastmove.parameter, {
      move: "c6",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
  });
  //                -> taker_request(same)        -> same as an accept
  it("will behave like a takeback accept when takeback receiver asks for takeback with the same ply count", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi3", game_id, 4));
    chai.assert.equal(self.clientMessagesSpy.args[0][0], p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_ACCEPTED");
    const game = Game.collection.findOne();
    checkTakeback(game);

    const takebacka = game.actions[game.actions.length - 1];
    const takebackr = game.actions[game.actions.length - 2];

    chai.assert.equal(takebackr.type, "takeback_requested");
    chai.assert.equal(takebackr.parameter, 4);
    chai.assert.equal(takebacka.type, "takeback_accepted");
    chai.assert.isUndefined(takebacka.parameter);

    self.loggedonuser = p1;
    chai.assert.doesNotThrow(() => Game.saveLocalMove("mi5", game_id, "c3")); // A move now replacing c4
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
  });

  //                -> taker_request(different)   -> Invalidates givers, then functions as a giver_request
  it("will create a takeback owned by the giver (as the asker) when the giver requests a takeback with a different ply count", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi3", game_id, 5));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    const game = Game.collection.findOne();
    checkTakeback(game, 4, 5);

    const takebackr2 = game.actions[game.actions.length - 1];
    const takebackr1 = game.actions[game.actions.length - 2];

    chai.assert.equal(takebackr2.type, "takeback_requested");
    chai.assert.equal(takebackr2.parameter, 5);
    chai.assert.equal(takebackr1.type, "takeback_requested");
    chai.assert.equal(takebackr1.parameter, 4);
  });
  //                -> giver_decline              -> message, not pending
  it("will send a client message to the asker if the asker tries to decline his own takeback request", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() => Game.declineLocalTakeback("mi3", game_id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_TAKEBACK_PENDING");
    checkTakeback(Game.collection.findOne(), 4, 0);
  });
  //                -> taker_decline              -> declines
  it("will decline a takeback and send a client message to the asker if the giver declines the takeback", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => Game.declineLocalTakeback("mi3", game_id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_DECLINED");
    checkTakeback(Game.collection.findOne());
  });
  //                -> giver_accept               -> message, not pending
  it("will send a client message to the asker if the asker tries to accept his own takeback request", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() => Game.acceptLocalTakeback("mi3", game_id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_TAKEBACK_PENDING");
    checkTakeback(Game.collection.findOne(), 4, 0);
  });
  //                -> taker_accept               -> do it!
  it("will accept a takeback and send a client message to the asker if the giver accepts the takeback", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    let other = p2;
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
      "none",
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi2", game_id, 4));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => Game.acceptLocalTakeback("mi3", game_id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_ACCEPTED");
    checkTakeback(Game.collection.findOne());
  });

  it("should place the next move following a take back at the start of the variation instead of the end", function() {
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
      "none",
      15,
      0,
      "none",
      "white"
    );

    // eslint-disable-next-line prettier/prettier
    const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
    let chess_obj = new Chess.Chess();
    const tomove = [us, them];
    let tm = 0;
    moves1.forEach(move => {
      self.loggedonuser = tomove[tm];
      let result = chess_obj.move(move);
      chai.assert.isDefined(result, "Illegal move made");
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });

    self.loggedonuser = us;
    chai.assert.doesNotThrow(()=> Game.requestLocalTakeback("mi1", game_id, 1));

    self.loggedonuser = them;
    chai.assert.doesNotThrow(() => Game.acceptLocalTakeback("mi1", game_id));
    let game = Game.GameCollection.findOne( { _id: game_id });

    self.loggedonuser = us;
    Game.saveLocalMove("Nc3", game_id, "Nc3");
    game = Game.GameCollection.findOne( { _id: game_id });
    chai.assert.isDefined(game, "Game does not exist");
    chai.assert.equal(game.variations.movelist[game.variations.movelist[4].variations[0]].move, "Nc3");
    chai.assert.equal(game.variations.movelist[game.variations.movelist[4].variations[1]].move, "Bg2");
  });
});

describe("Game.requestLocalTakeback", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.requestLocalTakeback("mi1", "somegame", 5);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("works on their move", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    Game.requestLocalTakeback("mi2", game_id, 3);
    const game1 = Game.collection.findOne();
    checkTakeback(game1, 3, 0);
    Game.saveLocalMove("mi3", game_id, "b4");
    const game2 = Game.collection.findOne();
    checkTakeback(game2, 3, 0);
    checkLastAction(game2, 0, "move", us._id, {
      move: "b4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game2, 1, "takeback_requested", us._id, 3);
  });

  it("works on their opponents move", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is blacks move here.
    self.loggedonuser = us;
    Game.requestLocalTakeback("mi2", game_id, 4);
    const game1 = Game.collection.findOne();
    checkTakeback(game1, 4, 0);
    self.loggedonuser = them;
    Game.saveLocalMove("mi3", game_id, "b5");
    const game2 = Game.collection.findOne();
    checkTakeback(game2);
    checkLastAction(game2, 0, "move", them._id, {
      move: "b5",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game2, 1, "takeback_requested", us._id, 4);
  });

  it("fails if number is null", function () {
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
      "none",
      15,
      0,
      "none"
    );
    chai.assert.throws(() => Game.requestLocalTakeback("mi2", game_id), Match.Error);
    chai.assert.throws(() => Game.requestLocalTakeback("mi2", game_id, null), Match.Error);
    chai.assert.throws(() => Game.requestLocalTakeback("mi2", game_id, -1), Match.Error);
    chai.assert.throws(() => Game.requestLocalTakeback("mi2", game_id, 0), Match.Error);
    chai.assert.throws(() => Game.requestLocalTakeback("mi2", game_id, "four"), Match.Error);
  });

  it("should make it accepters move if tomove requests takeback with an odd number", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is blacks move here.
    self.loggedonuser = us;
    Game.requestLocalTakeback("mi2", game_id, 5);
    Game.collection.findOne();
    self.loggedonuser = them;
    Game.acceptLocalTakeback("mi3", game_id);
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.tomove, "white");
  });

  it("should leave it requesters move if tomove requests takeback with an even number", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is blacks move here.
    self.loggedonuser = us;
    Game.requestLocalTakeback("mi2", game_id, 4);
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.tomove, "black");
  });
  it("should make it accepters move if tomove requests takeback with an odd number and requestor makes a move (it should also takeback + 1, taking back requesters move plus accepters move)", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is blacks move here.
    self.loggedonuser = them;
    Game.requestLocalTakeback("mi2", game_id, 5);
    Game.saveLocalMove("mi3", game_id, "Bg7");
    self.loggedonuser = us;
    Game.acceptLocalTakeback("mi4", game_id);
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.fen, "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2");
  });

  it("should revoke the takeback if requester requests an even takeback but then makes a move (i.e. if you are requesting taking back your own half move, you cannot make a move afterwards)", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let other = them;
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
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
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach((move) => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is blacks move here.
    self.loggedonuser = them;
    Game.requestLocalTakeback("mi2", game_id, 4);
    Game.saveLocalMove("mi3", game_id, "Bg7");
    const game1 = Game.collection.findOne();
    checkTakeback(game1);
  });
});

describe("Game.acceptLocalTakeback", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.acceptLocalTakeback("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Game.declineLocalTakeback", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.declineLocalTakeback("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("sends a client message if a takeback is not pending", function () {
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
      "none",
      15,
      0,
      "none"
    );
    Game.declineLocalTakeback("mi1", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_TAKEBACK_PENDING");
  });

  it("send a client message if the game is examined", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.requestLocalTakeback("mi2", game_id, 5);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game draw behavior", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a draw request on your move, record the draw, and leave it in effect after you make your move for your opponent to accept or decline", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkDraw(Game.collection.findOne(), "0", "0");
    Game.requestLocalDraw("mi2", game_id);
    checkDraw(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkDraw(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi4", game_id, "e5");

    const game = Game.collection.findOne();
    checkDraw(game, "0", "0");
    checkLastAction(game, 0, "move", opp._id, {
      move: "e5",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "draw_requested", us._id);
  });

  it("should explicitly decline the draw with a client message if a draw request is declined", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkDraw(Game.collection.findOne(), "0", "0");
    Game.requestLocalDraw("mi2", game_id);
    checkDraw(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkDraw(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.declineLocalDraw("mi4", game_id);

    const game = Game.collection.findOne();
    checkDraw(game, "0", "0");
    checkLastAction(game, 0, "draw_declined", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "draw_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "DRAW_DECLINED");
  });

  it("should explicitly accept the draw with a client message, and end the game, if a draw request is accepted", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkDraw(Game.collection.findOne(), "0", "0");
    Game.requestLocalDraw("mi2", game_id);
    checkDraw(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkDraw(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.acceptLocalDraw("mi4", game_id);

    const game = Game.collection.findOne();
    checkDraw(game, "0", "0");
    checkLastAction(game, 0, "draw_accepted", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "draw_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b13");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a draw request is already pending", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkDraw(Game.collection.findOne(), "0", "0");
    Game.requestLocalDraw("mi2", game_id);
    checkDraw(Game.collection.findOne(), "mi2", "0");
    Game.requestLocalDraw("mi3", game_id);

    const game = Game.collection.findOne();
    checkDraw(game, "mi2", "0");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "DRAW_ALREADY_PENDING");
    chai.assert.equal(game.actions.length, 1);
    checkLastAction(game, 0, "draw_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a draw", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a draw", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting a draw", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.requestLocalDraw("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game abort behavior", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a abort request on your move, record the abort, and leave it in effect after you make your move for your opponent to accept or decline", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    self.loggedonuser = us;
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.saveLocalMove("mi4", game_id, "Nc3");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi5", game_id, "Nf6");
    self.loggedonuser = us;
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi6", game_id);
    checkAbort(Game.collection.findOne(), "mi6", "0");
    Game.saveLocalMove("mi8", game_id, "Nf3");
    checkAbort(Game.collection.findOne(), "mi6", "0");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi10", game_id, "Nc6");

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "move", opp._id, {
      move: "Nc6",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 1, "move", us._id, {
      move: "Nf3",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "abort_requested", us._id);
  });

  it("should explicitly decline the abort with a client message if an abort request is declined", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = us;
    Game.saveLocalMove("mi4", game_id, "Nf3");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi5", game_id, "Nc6");
    checkAbort(Game.collection.findOne(), "0", "0");
    self.loggedonuser = us;
    Game.requestLocalAbort("mi6", game_id);
    checkAbort(Game.collection.findOne(), "mi6", "0");
    Game.saveLocalMove("mi7", game_id, "Nc3");
    checkAbort(Game.collection.findOne(), "mi6", "0");
    self.loggedonuser = opp;
    Game.declineLocalAbort("mi8", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "abort_declined", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "Nc3",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "abort_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi6");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ABORT_DECLINED");
  });

  it("should explicitly accept the abort with a client message, and end the game, if a abort request is accepted", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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

    Game.saveLocalMove("mi3", game_id, "e4");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi4", game_id, "e5");
    self.loggedonuser = us;
    Game.saveLocalMove("mi5", game_id, "Nf3");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi6", game_id, "Nc6");

    self.loggedonuser = us;
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi7", game_id);
    checkAbort(Game.collection.findOne(), "mi7", "0");
    Game.saveLocalMove("mi8", game_id, "Nc3");
    checkAbort(Game.collection.findOne(), "mi7", "0");
    self.loggedonuser = opp;
    Game.acceptLocalAbort("mi9", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "abort_accepted", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "Nc3",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "abort_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b30");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a abort request is already pending", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    ["a4", "a5", "b4", "b5", "c4", "c5", "d4", "d5", "e4", "e5"].forEach((move) => {
      Game.saveLocalMove(move, game_id, move);
      if (self.loggedonuser._id === us._id) self.loggedonuser = opp;
      else self.loggedonuser = us;
    });
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi2", game_id);
    checkAbort(Game.collection.findOne(), "mi2", "0");
    Game.requestLocalAbort("mi3", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "mi2", "0");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ABORT_ALREADY_PENDING");
    chai.assert.equal(game.actions.length, 11);
    checkLastAction(game, 0, "abort_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a abort", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a abort", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting an abort", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.requestLocalAbort("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game adjourn behavior", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a adjourn request on your move, record the adjourn, and leave it in effect after you make your move for your opponent to accept or decline", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkAdjourn(Game.collection.findOne(), "0", "0");
    Game.requestLocalAdjourn("mi2", game_id);
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi4", game_id, "e5");

    const game = Game.collection.findOne();
    checkAdjourn(game, "0", "0");
    checkLastAction(game, 0, "move", opp._id, {
      move: "e5",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "adjourn_requested", us._id);
  });

  it("should explicitly decline the adjourn with a client message if a adjourn request is declined", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkAdjourn(Game.collection.findOne(), "0", "0");
    Game.requestLocalAdjourn("mi2", game_id);
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.declineLocalAdjourn("mi4", game_id);

    const game = Game.collection.findOne();
    checkAdjourn(game, "0", "0");
    checkLastAction(game, 0, "adjourn_declined", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "adjourn_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ADJOURN_DECLINED");
  });

  it("should explicitly accept the adjourn with a client message, and end the game, if an adjourn request is accepted", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkAdjourn(Game.collection.findOne(), "0", "0");
    Game.requestLocalAdjourn("mi2", game_id);
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.acceptLocalAdjourn("mi4", game_id);

    const game = Game.collection.findOne();
    checkAdjourn(game, "0", "0");
    checkLastAction(game, 0, "adjourn_accepted", opp._id);
    checkLastAction(game, 1, "move", us._id, {
      move: "e4",
      ping: 456,
      lag: 0,
      gamelag: 0,
      gameping: 0,
    });
    checkLastAction(game, 2, "adjourn_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b24");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a adjourn request is already pending", function () {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      opp,
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
    checkAdjourn(Game.collection.findOne(), "0", "0");
    Game.requestLocalAdjourn("mi2", game_id);
    checkAdjourn(Game.collection.findOne(), "mi2", "0");
    Game.requestLocalAdjourn("mi3", game_id);

    const game = Game.collection.findOne();
    checkAdjourn(game, "mi2", "0");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ADJOURN_ALREADY_PENDING");
    chai.assert.equal(game.actions.length, 1);
    checkLastAction(game, 0, "adjourn_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a adjourn", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a adjourn", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting an adjourn", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.requestLocalAdjourn("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Game.resignLocalGame", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("send a client message if user is not playing a game", function () {
    self.loggedonuser = TestHelpers.createUser();
    Game.resignLocalGame("mi2", "somegame");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("works on their move", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game1_id = Game.startLocalGame(
      "mi1",
      them,
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
    Game.resignLocalGame("mi2", game1_id);
    const game1 = Game.collection.findOne({ _id: game1_id });
    checkLastAction(game1, 0, "resign", us._id);
    chai.assert.equal(game1.status, "examining");
    chai.assert.equal(game1.result, "0-1");

    self.loggedonuser = us;
    const game2_id = Game.startLocalGame(
      "mi1",
      them,
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
    Game.saveLocalMove("mi2", game2_id, "e4");
    self.loggedonuser = them;
    Game.resignLocalGame("mi3", game2_id);
    const game2 = Game.collection.findOne({ _id: game2_id });
    checkLastAction(game2, 0, "resign", them._id);
    chai.assert.equal(game2.status, "examining");
    chai.assert.equal(game2.result, "1-0");
  });

  it("works on their opponents move", function () {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game1_id = Game.startLocalGame(
      "mi1",
      them,
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
    self.loggedonuser = them;
    Game.resignLocalGame("mi2", game1_id);
    const game1 = Game.collection.findOne({ _id: game1_id });
    checkLastAction(game1, 0, "resign", them._id);
    chai.assert.equal(game1.status, "examining");
    chai.assert.equal(game1.result, "1-0");

    self.loggedonuser = us;
    const game2_id = Game.startLocalGame(
      "mi1",
      them,
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
    Game.saveLocalMove("mi2", game2_id, "e4");
    Game.resignLocalGame("mi3", game2_id);
    const game2 = Game.collection.findOne({ _id: game2_id });
    checkLastAction(game2, 0, "resign", us._id);
    chai.assert.equal(game2.status, "examining");
    chai.assert.equal(game2.result, "0-1");
  });

  it("should, on a resign", function () {
    it("should reset a pending draws", function () {
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game1_id = Game.startLocalGame(
        "mi1",
        them,
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
      Game.requestLocalDraw("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkDraw(Game.collection.findOne());
    });

    it("should reset a pending aborts", function () {
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game1_id = Game.startLocalGame(
        "mi1",
        them,
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
      Game.requestLocalAbort("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkAbort(Game.collection.findOne());
    });

    it("should reset a pending adjourns", function () {
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game1_id = Game.startLocalGame(
        "mi1",
        them,
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
      Game.requestLocalAdjourn("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkAdjourn(Game.collection.findOne());
    });
    it("should reset a pending takebacks", function () {
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game1_id = Game.startLocalGame(
        "mi1",
        them,
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
      Game.requestLocalTakeback("mi2", game1_id, 5);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkTakeback(Game.collection.findOne());
    });
  });
});

describe("Game.moveBackward", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("fails if game is not an examined game", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const examiner = TestHelpers.createUser();
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
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $push: { examiners: { id: examiner._id, username: examiner.username } } }
    );
    Game.moveBackward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("fails if user is not an examiner", function () {
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
      0,
      "none",
      15,
      0,
      "none"
    );
    Game.moveBackward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("writes an action and undoes the move if possible", function () {
    const examiner = TestHelpers.createUser();
    self.loggedonuser = examiner;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.moveBackward("mi3", game_id);
    const game = Game.collection.findOne({ _id: game_id });
    checkLastAction(game, 0, "move_backward", examiner._id, 1);
    checkLastAction(game, 1, "move", examiner._id, {move: "e4"});
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    checkLastAction(game, 0, "move_backward", examiner._id, 1);
    checkLastAction(game, 1, "move", examiner._id, {move: "e4"});
  });

  it("move back multiple moves if a number > 1 i specified", function () {
    const examiner = TestHelpers.createUser();
    self.loggedonuser = examiner;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    ["e4", "e5", "Nf3", "Nc6", "Be2", "Be7"].forEach((move) =>
      Game.saveLocalMove("mi2", game_id, move)
    );
    Game.moveBackward("mi3", game_id, 3);
    const game = Game.collection.findOne({ _id: game_id });
    checkLastAction(game, 0, "move_backward", examiner._id, 3);
    checkLastAction(game, 1, "move", examiner._id, {move: "Be7"});
    Game.saveLocalMove("mi2", game_id, "Na6", {type: "insert", index: 0});
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.collection.findOne({ _id: game_id });
    checkLastAction(game2, 0, "move", examiner._id, {move: "Na6", variationtype: "insert", variationindex: 0});
    checkLastAction(game2, 1, "move_backward", examiner._id, 3);
  });

  it("writes a client message if there is no move to undo", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.moveBackward("mi3", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "BEGINNING_OF_GAME");
  });

  it("moves up to the previous variation and continues on", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi0", "whiteguy", "blackguy", 0);
    Game.saveLocalMove("mi1", game_id, "e4");
    Game.saveLocalMove("mi2", game_id, "e5");
    Game.saveLocalMove("mi3", game_id, "Nf3");
    Game.saveLocalMove("mi4", game_id, "Nc6");
    Game.moveBackward("mi5", game_id, 2);
    Game.saveLocalMove("mi6", game_id, "Ne2", {type: "insert", index: 0});
    Game.saveLocalMove("mi7", game_id, "Nc6");
    Game.saveLocalMove("mi8", game_id, "g3");
    Game.saveLocalMove("mi9", game_id, "g6");
    Game.moveBackward("mi10", game_id, 3);
    Game.saveLocalMove("mi11", game_id, "Nh6", {type: "insert", index: 0});

    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({});

    checkLastAction(game, 0, "move", self.loggedonuser._id, {move: "Nh6", variationtype: "insert", variationindex: 0});
    checkLastAction(game, 1, "move_backward", self.loggedonuser._id, 3);
    checkLastAction(game, 2, "move", self.loggedonuser._id, {move: "g6"});
    checkLastAction(game, 3, "move", self.loggedonuser._id, {move: "g3"});
    checkLastAction(game, 4, "move", self.loggedonuser._id, {move: "Nc6"});
    checkLastAction(game, 5, "move", self.loggedonuser._id, {move: "Ne2", variationtype: "insert", variationindex: 0});
    checkLastAction(game, 6, "move_backward", self.loggedonuser._id, 2);
    checkLastAction(game, 7, "move", self.loggedonuser._id, {move: "Nc6"});
    checkLastAction(game, 8, "move", self.loggedonuser._id, {move: "Nf3"});
    checkLastAction(game, 9, "move", self.loggedonuser._id, {move: "e5"});
    checkLastAction(game, 10, "move", self.loggedonuser._id,{move: "e4"});
  });
});

describe("Takebacks", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("Must always keep the entire variation tree in the record, forever", function () {
    const player = {
      white: TestHelpers.createUser(),
      black: TestHelpers.createUser(),
    };

    self.loggedonuser = player.white;
    const game_id = Game.startLocalGame(
      "mi1",
      player.black,
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

    const actions = [
      { type: "move", parameter: {move: "e4" }},
      { type: "move", parameter: {move: "e5" }},
      { type: "move", parameter: {move: "Nf3" }},
      { type: "move", parameter: {move: "Nc6" }},
      { type: "move", parameter: {move: "Bc4" }},
      { type: "move", parameter: {move: "Be7" }},
      { type: "move", parameter: {move: "d4" }},
      { type: "move", parameter: {move: "Nxd4" }},
      { type: "move", parameter: {move: "c3" }},
      { type: "move", parameter: {move: "d5" }},
      { type: "move", parameter: {move: "exd5" }},
      { type: "move", parameter: {move: "b5" }},
      { type: "move", parameter: {move: "cxd4" }},
      { type: "move", parameter: {move: "bxc4" }},
      { type: "takeback_requested", parameter: 8 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "c3" }},
      { type: "move", parameter: {move: "d6" }},
      { type: "move", parameter: {move: "d4" }},
      { type: "move", parameter: {move: "exd4" }},
      { type: "move", parameter: {move: "cxd4" }},
      { type: "takeback_requested", parameter: 7 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "Be2" }},
      { type: "move", parameter: {move: "Be7" }},
      { type: "move", parameter: {move: "O-O" }},
      { type: "move", parameter: {move: "d5" }},
      { type: "takeback_requested", parameter: 2 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "c3"} },
      { type: "move", parameter: {move: "d6"} },
      { type: "move", parameter: {move: "d4"} },
      { type: "takeback_requested", parameter: 2 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "d5"} },
      { type: "move", parameter: {move: "d4"} },
      { type: "takeback_requested", parameter: 7 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "f4" }},
      { type: "move", parameter: {move: "Nc6" }},
      { type: "move", parameter: {move: "Nf3" }},
      { type: "takeback_requested", parameter: 3 },
      { type: "takeback_accepted" },
      { type: "move", parameter: {move: "Nf3" }},
      { type: "move", parameter: {move: "Nc6" }},
      { type: "move", parameter: {move: "Bc4" }},
      { type: "move", parameter: {move: "Be7" }},
      { type: "move", parameter: {move: "c3" }},
      { type: "move", parameter: {move: "d6" }},
      { type: "move", parameter: {move: "d4" }},
      { type: "move", parameter: {move: "exd4" }},
      { type: "move", parameter: {move: "cxd4" }},
    ];
    this.timeout(5000);
    actions.forEach((action) => {
      const tomove = Game.collection.findOne({}).tomove;
      switch (action.type) {
        case "move":
          self.loggedonuser = player[tomove];
          Game.saveLocalMove(action.parameter.move, game_id, action.parameter.move);
          break;
        case "takeback_requested":
          self.loggedonuser = player[tomove];
          Game.requestLocalTakeback("requst takeback", game_id, action.parameter);
          break;
        case "takeback_accepted":
          const tbcolor = tomove === "white" ? "black" : "white";
          self.loggedonuser = player[tbcolor];
          Game.acceptLocalTakeback("accept takeback", game_id);
          break;
        default:
          chai.assert.fail("Unknown action: " + action);
      }
    });

    const game = Game.collection.findOne({});

    const pgn = buildPgnFromMovelist(game.variations.movelist);
    // I got this from an SCID export of these moves, but removed the whitespace around the parens
    // SCID wrote: ( 1. e4 ) ... and I changed it to (1.e4)
    const expectedpgn =
      "1. e4 e5 2. Nf3 (2. f4 Nc6 3. Nf3) 2. ... Nc6 3. Bc4 (3. Be2 Be7 4. c3 (4. O-O d5) 4. ... d5 (4. ... d6 5. d4) 5. d4) 3. ... Be7 4. c3 (4. d4 Nxd4 5. c3 d5 6. exd5 b5 7. cxd4 bxc4) 4. ... d6 5. d4 exd4 6. cxd4";
    //const expectedpgn =
    //  "1.e4e52.Nf3(2.f4Nc63.Nf3)2...Nc63.Bc4(3.Be2Be74.O-O(4.c3d6(4...d55.d4)5.d4)4...d5)3...Be74.d4(4.c3d65.d4exd46.cxd4)4...Nxd45.c3d56.exd5b57.cxd4bxc4";
    // So Let's not remove the whitespace, and it should match exactly.
    //pgn.replace(/\s/g, "");

    chai.assert.equal(pgn, expectedpgn);
  });
});

describe.skip("Game.buildMovelistFromPgn", function () {
  it("needs to be written", function () {
    // eslint-disable-next-line no-unused-vars
    const pgn =
      "1.e4 e5 2.Nf3 (2.f4 Nc6 3.Nf3) 2...Nc6 3.Bc4 (3.Be2 Be7 4.O-O (4.c3 d6 (4...d5 5.d4) 5.d4) 4...d5) 3...Be7 4.d4 (4.c3 d6 5.d4 exd4 6.cxd4) 4...Nxd4 5.c3 d5 6.exd5 b5 7.cxd4 bxc4";
    chai.assert.fail("do me");
  });
});

describe("Game.moveForward", function () {
  const self = TestHelpers.setupDescribe.apply(this);
  it("fails if game is not an examined game", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const examiner = TestHelpers.createUser();
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
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $push: { examiners: { id: examiner._id, username: examiner.username } } }
    );
    Game.moveForward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("fails if user is not an examiner", function () {
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
      0,
      "none",
      15,
      0,
      "none"
    );
    Game.moveForward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("writes an action and moves forward if there is no variation", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 3);
    Game.moveForward("mi7", game_id, 3);
    const game = Game.collection.findOne({});
    checkLastAction(game, 0, "move_forward", us._id, {
      movecount: 3,
    });
    checkLastAction(game, 1, "move_backward", us._id, 3);
    checkLastAction(game, 2, "move", us._id, {move: "Nc6"});
    checkLastAction(game, 3, "move", us._id, {move: "Nf3"});
    checkLastAction(game, 4, "move", us._id, {move: "e5"});
    checkLastAction(game, 5, "move", us._id, {move: "e4"});
  });

  it("writes a client message if there is no move to go to", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.moveBackward("mi2", game_id, 3);
    Game.moveForward("mi3", game_id, 3);

    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.actions.length, 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "BEGINNING_OF_GAME");
    chai.assert.equal(self.clientMessagesSpy.args[1][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "END_OF_GAME");
  });

  it("writes a client message if there is a variation and none is specified", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 3);
    Game.saveLocalMove("mi7", game_id, "c5", {type: "insert", index: 0});
    Game.moveBackward("mi8", game_id);
    Game.moveForward("mi9", game_id, 2);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi9");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "VARIATION_REQUIRED");
  });

  it("moves to the correct variation, and future forwards follow the new variation, when one is specified", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 3);
    Game.saveLocalMove("mi7", game_id, "c5", {type: "insert", index: 0});
    Game.moveBackward("mi8", game_id);
    Game.moveForward("mi9", game_id, 1, 1);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({});
    checkLastAction(game, 0, "move_forward", us._id, {
      movecount: 1,
      variation: 1,
    });
  });

  it("allows zero to be the default variation when there is no variation", function () {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 4);
    Game.moveForward("mi7", game_id, 4);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({});
    checkLastAction(game, 0, "move_forward", us._id, {
      movecount: 4,
    });
    checkLastAction(game, 1, "move_backward", us._id, 4);
  });

  it("requires zero to be the mainline, and 1+ to be subsequent variations (i.e. zero based)", function () {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 3);
    Game.saveLocalMove("mi7", game_id, "c5", {type: "insert", index: 0});
    Game.moveBackward("mi8", game_id);
    Game.moveForward("mi9", game_id, 1, 0);
    Game.saveLocalMove("mi10", game_id, "d4", {type: "insert", index: 0});
    Game.saveLocalMove("mi11", game_id, "c4"); // Will fail if not for the previous c5
    Game.moveBackward("mi12", game_id, 3);
    Game.moveForward("mi13", game_id, 3, 1);
    Game.saveLocalMove("mi14", game_id, "c4", {type: "insert", index: 0});
    Game.saveLocalMove("mi15", game_id, "a5");
    Game.saveLocalMove("mi16", game_id, "c5"); // Will fail if we are still on the c5 branch
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });
});

describe("When a user disconnects while playing a game", function () {
  it("should adjourn the game and write an action", function () {});
  it("should write a connect and disconnect action to the adjourned game every time they connect and disconnect", function () {});
});

describe("Game publication", function () {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should not send engine scores to either player, but should send to all observers in a played game", function (done) {
    this.timeout(5000);
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const o1 = TestHelpers.createUser();
    const o2 = TestHelpers.createUser();
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
      "none",
      "white"
    );
    self.loggedonuser = o1;
    Game.localAddObserver("mi2", game_id, o1._id);
    self.loggedonuser = o2;
    Game.localAddObserver("mi3", game_id, o2._id);
    chai.assert.equal(Game.collection.find().count(), 1);
    self.loggedonuser = p1;
    Game.saveLocalMove("mi4", game_id, "e4");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi5", game_id, "e5");
    self.loggedonuser = p1;
    Game.saveLocalMove("mi4", game_id, "e4");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi5", game_id, "e5");
    const game = Game.collection.findOne({});
    chai.assert.equal(game.white.id, p1._id);
    chai.assert.equal(game.black.id, p2._id);
    chai.assert.sameMembers(
      game.observers.map((ob) => ob.id),
      [o1._id, o2._id]
    );

    function check(user, playing, player) {
      return new Promise((resolve) => {
        self.loggedonuser = user;
        const collector = new PublicationCollector({
          userId: user._id,
        });

        collector.collect("games", (collection) => {
          if (playing === player) {
            chai.assert.equal(collection.game.length, 1);
            if (playing) chai.assert.isUndefined(collection.game[0].computer_variations);
            else chai.assert.isDefined(collection.game[0].computer_variations);
          } // observers get this now  else chai.assert.isTrue(!collection.game || !collection.game.length);
          resolve();
        });
      });
    }

    check(p1, false, true)
      .then(() => check(p1, true, true))
      .then(() => check(p2, false, true))
      .then(() => check(p2, true, true))
      .then(() => check(o1, false, false))
      .then(() => check(o1, true, false))
      .then(() => check(o2, false, false))
      .then(() => check(o2, true, false))
      .then(() => done());
  });
});

describe("When making a move in a game being played", function () {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  it("needs to update the users time correctly after a move", function () {
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const game_id = Game.startLocalGame(
      "mi1",
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

    const game0 = Game.collection.findOne({});
    chai.assert.equal(game0.clocks.white.current, 900000);
    chai.assert.equal(game0.clocks.black.current, 900000);

    self.clock.tick(2356);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 897644);
    chai.assert.equal(game1.clocks.black.current, 900000);

    self.loggedonuser = player2;
    self.clock.tick(5454);
    Game.saveLocalMove("mi3", game_id, "e5");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 897644);
    chai.assert.equal(game2.clocks.black.current, 894546);

    self.loggedonuser = player1;
    self.clock.tick(8569);
    Game.saveLocalMove("mi4", game_id, "Nf3");
    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 889075);
    chai.assert.equal(game3.clocks.black.current, 894546);
  });

  it("needs to compensate for the move makers lag", function () {
    const player1 = TestHelpers.createUser();
    const player2 = TestHelpers.createUser();
    self.loggedonuser = player1;
    const game_id = Game.startLocalGame(
      "mi1",
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

    const game0 = Game.collection.findOne({});
    chai.assert.equal(game0.clocks.white.current, 900000);
    chai.assert.equal(game0.clocks.black.current, 900000);

    self.clock.tick(2356);
    Game.saveLocalMove("mi2", game_id, "e4");
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 897644);
    chai.assert.equal(game1.clocks.black.current, 900000);

    self.loggedonuser = player2;
    self.clock.tick(5454);
    Game.saveLocalMove("mi3", game_id, "e5");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 897644);
    chai.assert.equal(game2.clocks.black.current, 894546);

    self.loggedonuser = player1;
    self.clock.tick(8569);
    Game.saveLocalMove("mi4", game_id, "Nf3");
    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 889075);
    chai.assert.equal(game3.clocks.black.current, 894546);
  });
});

describe("when playing a game", function () {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  it.skip("should write a ping to the record each second, and record both blacks and whites responses", function (done) {
    // This no longer occurs in unit/integration tests
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
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    const game0 = Game.collection.findOne({});
    chai.assert.equal(game0.lag.white.active.length, 0);
    chai.assert.equal(game0.lag.black.active.length, 0);
    chai.assert.equal(game0.lag.white.pings.length, 0);
    chai.assert.equal(game0.lag.black.pings.length, 0);

    self.clock.tick(1000);

    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.lag.white.active.length, 1);
    chai.assert.equal(game1.lag.black.active.length, 1);
    chai.assert.equal(game1.lag.white.pings.length, 0);
    chai.assert.equal(game1.lag.black.pings.length, 0);
    chai.assert.equal(game1.lag.white.active[0].originate, 1000);
    chai.assert.equal(game1.lag.black.active[0].originate, 1000);

    self.clock.tick(150);

    const client = new TimestampClient((key, msg) => {
      Meteor.call("gamepong", game_id, msg, (error) => {
        if (!!error) chai.assert.fail(error);
        const game2 = Game.collection.findOne({});
        chai.assert.equal(game2.lag.white.active.length, 0);
        chai.assert.equal(game2.lag.black.active.length, 1);
        chai.assert.equal(game2.lag.white.pings.length, 1);
        chai.assert.equal(game2.lag.black.pings.length, 0);
        chai.assert.equal(game2.lag.white.pings[0], 150);
        done();
      });
    });

    client.pingArrived(game1.lag.white.active[0]);
  });

  it("needs to calculate game lag correctly (by using the last two game pings)", function () {
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
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.collection.update(
      { _id: game_id, status: "playing" },
      {
        $set: {
          "lag.white.pings": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          "lag.black.pings": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        },
      }
    );
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi2", game_id, "e5");

    const game = Game.collection.findOne({});
    chai.assert.equal(game.actions[0].parameter.gameping, 10);
    chai.assert.equal(game.actions[0].parameter.gamelag, 9);
    chai.assert.equal(game.actions[1].parameter.gameping, 20);
    chai.assert.equal(game.actions[1].parameter.gamelag, 19);
  });

  it.skip("should throw an error if the meteor method is called with a an invalid game id", function (done) {
    // It no longer throws errors.
    this.timeout(5000);
    self.loggedonuser = TestHelpers.createUser();
    Meteor.call("gamepong", "game_id", { msg: "msg" }, (error) => {
      chai.assert.equal(
        error.message,
        "Unable to locate game to ping (2) [Unable to update game ping]"
      );
      done();
    });
  });

  it.skip("should throw an error if the meteor method is called with a valid game but it's examined", function (done) {
    // ping code no longer throws errors
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
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    self.clock.tick(1000);

    const game1 = Game.collection.findOne({});
    self.clock.tick(150);

    Game.resignLocalGame("mi2", game_id);

    const client = new TimestampClient((key, msg) => {
      Meteor.call("gamepong", game_id, msg, (error) => {
        chai.assert.equal(
          error.message,
          "Unable to locate game to ping (2) [Unable to update game ping]"
        );
        done();
      });
    });

    client.pingArrived(game1.lag.white.active[0]);
  });
});

describe("Game clocks", function () {
  const self = TestHelpers.setupDescribe.call(this, { timer: true, averagelag: 0 });

  it("should remove time as wall clock when lag is not involved", function () {
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
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 15 * 60 * 1000); // 15 minutes in milliseconds
    chai.assert.equal(game1.clocks.black.current, 15 * 60 * 1000); // 15 minutes in milliseconds

    self.clock.tick(6000);
    Game.saveLocalMove("mi2", game_id, "e4");

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15 * 60 * 1000 - 6000); // 15 minutes minus six seconds
    chai.assert.equal(game2.clocks.black.current, 15 * 60 * 1000); // 15 minutes
  });

  it("should remove a minimum of time as specified by the system configuration", function () {
    self.sandbox.replace(SystemConfiguration, "minimumMoveTime", self.sandbox.fake.returns(500));
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
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 15 * 60 * 1000); // 15 minutes in milliseconds
    chai.assert.equal(game1.clocks.black.current, 15 * 60 * 1000); // 15 minutes in milliseconds

    self.clock.tick(6);
    Game.saveLocalMove("mi2", game_id, "e4");

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15 * 60 * 1000 - 500); // 15 minutes minus 500ms, the minimum move time
    chai.assert.equal(game2.clocks.black.current, 15 * 60 * 1000); // 15 minutes
  });

  it("should start with an increment and add the increment in if specified", function () {
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
      45,
      "inc",
      15,
      45,
      "inc",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, (15 * 60 + 45) * 1000); // 15 minutes + 45s inc in milliseconds
    chai.assert.equal(game1.clocks.black.current, 15 * 60 * 1000); // 15 minutes in milliseconds

    self.clock.tick(6000);
    Game.saveLocalMove("mi2", game_id, "e4");

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, (15 * 60 + 45) * 1000 - 6000); // 15 minutes minus 6s
    chai.assert.equal(game2.clocks.black.current, (15 * 60 + 45) * 1000);        // 15 minutes + 45s increment
  });

  it("should not change the clock time if under the us delay when us delay is specified", function () {
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
      45,
      "us",
      15,
      45,
      "us",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 15 * 60 * 1000); // 15 minutes in milliseconds
    chai.assert.equal(game1.clocks.black.current, 15 * 60 * 1000); // 15 minutes in milliseconds

    self.clock.tick(6000);
    Game.saveLocalMove("mi2", game_id, "e4");

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15 * 60 * 1000); // 15 minutes, since 6s is less than the 45s delay
    chai.assert.equal(game2.clocks.black.current, 15 * 60 * 1000); // 15 minutes

    self.loggedonuser = p2;

    self.clock.tick(60000);
    Game.saveLocalMove("mi2", game_id, "e5");

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 15 * 60 * 1000); // 15 minutes
    chai.assert.equal(game3.clocks.black.current, 15 * 60 * 1000 - (60 - 45) * 1000); // 15 minutes minus the difference between the move time (60s) and the delay (45s), so 15s should be removed
  });

  it("should change the clock, by 'wall time minus delay' when move is over us delay time and us delay is specified", function () {
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
      45,
      "us",
      15,
      45,
      "us",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 15 * 60 * 1000); // 15 minutes in milliseconds
    chai.assert.equal(game1.clocks.black.current, 15 * 60 * 1000); // 15 minutes in milliseconds

    self.clock.tick(60000);
    Game.saveLocalMove("mi2", game_id, "e4");

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15 * 60 * 1000 - (60 - 45) * 1000); // 15 minutes minus the difference between the move time (60s) and the delay (45s), so 15s should be removed
    chai.assert.equal(game2.clocks.black.current, 15 * 60 * 1000); // 15 minutes
  });

  it.skip("should automatically end the game when time expires", function () {
    // It no longer starts timers in tests
    this.timeout(200000);
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "bullet", true, 1, 45, "us", 1, 45, "us", "white");
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(100000); // 60s + 40s

    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.status, "playing");

    self.clock.tick(5000); // the last 5s

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.result, "0-1");
    chai.assert.equal(game3.status, "examining");
  });

  it("should not end the game when time=5s and us delay=10s and player takes 8s to move", function () {
    this.timeout(30000);
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      10,
      "us",
      1,
      10,
      "us",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(65 * 1000); // 65s goes by -- Have to account for the 10s delay

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 5000); // 5s left
    chai.assert.equal(game2.clocks.black.current, 60 * 1000);

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");

    self.loggedonuser = p1;
    self.clock.tick(8000); // 8s delay

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 5000);
    chai.assert.equal(game3.status, "playing");

    Game.saveLocalMove("mi3", game_id, "Nf3");

    const game4 = Game.collection.findOne({});
    chai.assert.equal(game4.clocks.white.current, 5000);
    chai.assert.equal(game4.status, "playing");
  });

  it("should leave the clock at 15s if starting time is 15s, us delay is 5s, and they take 3s to move", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      5,
      "us",
      1,
      5,
      "us",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(50000); // Leave the clock at 15s (use 50s, 5s delay = 45s)

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15000); // 5ms left plus the 10s delay
    chai.assert.equal(game2.clocks.black.current, 60 * 1000);

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");

    self.clock.tick(3000); // 3s think time

    self.loggedonuser = p1;
    Game.saveLocalMove("mi3", game_id, "Nf3");

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 15000); // 5ms left plus the 10s delay
  });
  it("should reset the clock to 15s if starting time is 15s, bronstein delay is 5s, and they take 3s to move", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      5,
      "bronstein",
      1,
      5,
      "bronstein",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(50000); // Leave the clock at 15s (use 50s, 5s delay = 45s)

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15000); // 5ms left plus the 10s delay
    chai.assert.equal(game2.clocks.black.current, 60 * 1000);

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");

    self.clock.tick(3000); // 3s think time

    self.loggedonuser = p1;
    Game.saveLocalMove("mi3", game_id, "Nf3");

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 15000); // 5ms left plus the 10s delay
  });

  it("should set the clock to 14s left if starting time is 15s, us delay is 5s, and they take 6s to move", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      5,
      "us",
      1,
      5,
      "us",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(50000); // Leave the clock at 15s (use 50s, 5s delay = 45s)

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15000); // 5ms left plus the 10s delay
    chai.assert.equal(game2.clocks.black.current, 60 * 1000);

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");

    self.clock.tick(6000); // 3s think time

    self.loggedonuser = p1;
    Game.saveLocalMove("mi3", game_id, "Nf3");

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 14000); // 5ms left plus the 10s delay
  });

  it("should set the clock to 14s left if starting time is 15s, bronstein delay is 5s, and they take 6s to move", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      5,
      "bronstein",
      1,
      5,
      "bronstein",
      "white"
    );
    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.clocks.white.current, 60 * 1000);
    chai.assert.equal(game1.clocks.black.current, 60 * 1000);

    self.clock.tick(50000); // Leave the clock at 15s (use 50s, 5s delay = 45s)

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.clocks.white.current, 15000); // 5ms left plus the 10s delay
    chai.assert.equal(game2.clocks.black.current, 60 * 1000);

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");

    self.clock.tick(6000); // 3s think time

    self.loggedonuser = p1;
    Game.saveLocalMove("mi3", game_id, "Nf3");

    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.clocks.white.current, 14000); // 5ms left plus the 10s delay
  });
});

describe("tomove in the game record", function () {
  const self = TestHelpers.setupDescribe.call(this, { timer: true, averagelag: 0 });
  it("needs to match the side it is to move", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "bullet",
      true,
      1,
      5,
      "bronstein",
      1,
      5,
      "bronstein",
      "white"
    );

    const game1 = Game.collection.findOne({});
    chai.assert.equal(game1.tomove, "white");

    Game.saveLocalMove("mi2", game_id, "e4");
    const game2 = Game.collection.findOne({});
    chai.assert.equal(game2.tomove, "black");

    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");
    const game3 = Game.collection.findOne({});
    chai.assert.equal(game3.tomove, "white");

    self.loggedonuser = p1;
    Game.saveLocalMove("mi4", game_id, "d5");
    const game4 = Game.collection.findOne({});
    chai.assert.equal(game4.tomove, "white");
  });
});

describe("Starting a game", function () {
  const self = TestHelpers.setupDescribe.call(this);
  it("should fail if the players opponent is not online with a client message", function () {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser({ login: false });
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
  });
});

describe("Starting an examined game", function () {
  const self = TestHelpers.setupDescribe.call(this);
  it("should fail if the user starting an examined game is not online", function () {
    self.loggedonuser = TestHelpers.createUser({ login: false });
    chai.assert.throws(
      () => Game.startLocalExaminedGame("mi1", "white", "black", 0),
      ICCMeteorError
    );
  });

  describe("moveToCMI", function () {
    it("should work", function () {
      self.loggedonuser = TestHelpers.createUser();
      const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
      Game.saveLocalMove("e4", game_id, "e4");
      Game.saveLocalMove("c5", game_id, "c5");
      // rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2
      Game.saveLocalMove("Nf3", game_id, "Nf3");
      Game.moveBackward("mb", game_id, 2);
      Game.saveLocalMove("e5", game_id, "e5", {type: "insert", index: 0});
      // rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2
      Game.saveLocalMove("Bc4", game_id, "Bc4");

      const game1 = Game.collection.findOne();
      chai.assert.equal(
        game1.fen,
        "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"
      );

      Game.moveToCMI("m1", game_id, 3);
      const game2 = Game.collection.findOne();
      chai.assert.equal(
        game2.fen,
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
      );

      Game.moveToCMI("m2", game_id, 3);
      const game3 = Game.collection.findOne();
      chai.assert.equal(
        game3.fen,
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
      );

      Game.moveToCMI("m3", game_id, 5);
      const game4 = Game.collection.findOne();
      chai.assert.equal(
        game4.fen,
        "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"
      );

      Game.moveToCMI("m4", game_id, 5);
      const game5 = Game.collection.findOne();
      chai.assert.equal(
        game5.fen,
        "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"
      );

      Game.moveToCMI("m5", game_id, 0);
      const game6 = Game.collection.findOne();
      chai.assert.equal(game6.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      Game.moveToCMI("m6", game_id, 3);
      const game7 = Game.collection.findOne();
      chai.assert.equal(
        game7.fen,
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
      );

      Game.moveToCMI("m7", game_id, 0);
      const game8 = Game.collection.findOne();
      chai.assert.equal(game8.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      Game.moveToCMI("m8", game_id, 5);
      const game9 = Game.collection.findOne();
      chai.assert.equal(
        game9.fen,
        "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"
      );

      Game.moveToCMI("m9", game_id, 0);
      const game10 = Game.collection.findOne();
      chai.assert.equal(game10.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

      Game.moveToCMI("m10", game_id, 0);
      const game11 = Game.collection.findOne();
      chai.assert.equal(game11.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    });
  });

  it("should not crash when a takeback is requested on a new game (bug found 4/27/21)", function () {
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
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.doesNotThrow(() => Game.requestLocalTakeback("mi1", game_id, 1));
    const game = Game.collection.findOne();
    chai.assert.equal(game.pending.white.takeback.number, 0);
    chai.assert.equal(game.pending.white.takeback.mid, "0");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_BEGINNING_OF_GAME");
  });
});
