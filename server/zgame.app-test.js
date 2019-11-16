import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { Meteor } from "meteor/meteor";
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
  const self = TestHelpers.setupDescribe.apply(this);

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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi5");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
  });
});

describe("Game.startLocalGame", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
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
    self.sandbox.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      self.sandbox.fake.returns(false)
    );
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame("mi1", otherguy, 0, "standard", true, 15, 0, 15, 0),
      ICCMeteorError
    );
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
  const self = TestHelpers.setupDescribe.apply(this);

  it.skip("should error if we try to start a legacy game when both players are actually logged on here", function() {
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
  const self = TestHelpers.setupDescribe.apply(this);

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
  const self = TestHelpers.setupDescribe.apply(this);

  it("should error out if a game cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.saveLocalMove("mi1", "somegame", "e4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_MOVE");
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

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "move2");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );

    chai.assert.equal(self.clientMessagesSpy.args[1][0]._id, them._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "move4");
    chai.assert.equal(
      self.clientMessagesSpy.args[1][2],
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );
  });
});

describe("Game.legacyGameEnded", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
  const self = TestHelpers.setupDescribe.apply(this);

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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_OBSERVER");
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_AN_EXAMINER");
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
  const self = TestHelpers.setupDescribe.apply(this);

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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi4");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
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
  const self = TestHelpers.setupDescribe.apply(this);

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
  const self = TestHelpers.setupDescribe.apply(this);

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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], dumbguy._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_OBSERVER");
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

  it("should delete the record if the last examiner leaves, regardless of observers left", function() {
    const examiner = TestHelpers.createUser();
    const observer = TestHelpers.createUser();

    self.loggedonuser = examiner;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );

    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);

    self.loggedonuser = examiner;
    Game.localRemoveObserver("mi3", game_id, examiner._id);

    chai.assert.equal(Game.collection.find().count(), 0);
  });
});

describe("Game.removeLegacyGame", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
  it("should succeed if everything else is well", function() {
    const us = TestHelpers.createUser();
    const opp = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.startLegacyGame.apply(null, startLegacyGameParameters(us, opp));
    chai.assert.doesNotThrow(() => Game.removeLegacyGame("mi2", 999));
  });
});

function checkLastAction(gamerecord, reverse_index, type, issuer, parameter) {
  const action =
    gamerecord.actions[gamerecord.actions.length - 1 - reverse_index];
  if (type) chai.assert.equal(action.type, type);
  if (issuer) chai.assert.equal(action.issuer, issuer);
  if (parameter) chai.assert.equal(action.parameter, parameter);
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
  chai.assert.equal(
    gameRecord.pending.white.draw,
    white === undefined ? "0" : white
  );
  chai.assert.equal(
    gameRecord.pending.black.draw,
    black === undefined ? "0" : black
  );
}

function checkAbort(gameRecord, white, black) {
  checkxxx(gameRecord);
  if (gameRecord.status === "examining") return;
  chai.assert.equal(
    gameRecord.pending.white.abort,
    white === undefined ? "0" : white
  );
  chai.assert.equal(
    gameRecord.pending.black.abort,
    black === undefined ? "0" : black
  );
}

function checkAdjourn(gameRecord, white, black) {
  checkxxx(gameRecord);
  if (gameRecord.status === "examining") return;
  chai.assert.equal(
    gameRecord.pending.white.adjourn,
    white === undefined ? "0" : white
  );
  chai.assert.equal(
    gameRecord.pending.black.adjourn,
    black === undefined ? "0" : black
  );
}

describe.skip("Takeback behavior", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it.skip("restores both clocks to the same time as the move taken back to", function() {
    // So if say:
    // move 20, white clock: 25:00, black clock: 15:00,
    // at move 22, white clock: 5:00, black clock: 2:00,
    // if we takeback 2, then we are back at the position after move 19,
    //   with white clock at 25:00 and black clock at 15:00!
    chai.assert.fail("do me");
  });

  // giver_request  -> giver_request(same)        -> message, already pending
  it("will write a client message when takeback asker asks for another takeback with the same ply count", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi3", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "TAKEBACK_ALREADY_PENDING"
    );

    const game = Game.collection.findOne();
    const takeback = game.actions[game.actions.length - 1];
    const lastmove = game.actions[game.actions.length - 2];

    checkOneTakeback(game.pending.white, 4);
    checkOneTakeback(game.pending.black, 0);
    chai.assert.equal(takeback.type, "takeback_requested");
    chai.assert.equal(takeback.parameter, 4);
    chai.assert.equal(lastmove.type, "move");
    chai.assert.equal(lastmove.parameter, "c6");
  });

  //                -> giver_request(different)   -> message, already pending
  it("will write a client message when takeback asker asks for another takeback with a different ply count", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi3", game_id, 2)
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "TAKEBACK_ALREADY_PENDING"
    );

    const game = Game.collection.findOne();
    const takeback = game.actions[game.actions.length - 1];
    const lastmove = game.actions[game.actions.length - 2];

    checkOneTakeback(game.pending.white, 4);
    checkOneTakeback(game.pending.black, 0);
    chai.assert.equal(takeback.type, "takeback_requested");
    chai.assert.equal(takeback.parameter, 4);
    chai.assert.equal(lastmove.type, "move");
    chai.assert.equal(lastmove.parameter, "c6");
  });
  //                -> taker_request(same)        -> same as an accept
  it("will behave like a takeback accept when takeback receiver asks for takeback with the same ply count", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi3", game_id, 4)
    );
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
  it("will create a takeback owned by the giver (as the asker) when the giver requests a takeback with a different ply count", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi3", game_id, 5)
    );
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
  it("will send a client message to the asker if the asker tries to decline his own takeback request", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
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
  it("will decline a takeback and send a client message to the asker if the giver declines the takeback", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    checkTakeback(Game.collection.findOne(), 4, 0);

    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => Game.declineLocalTakeback("mi3", game_id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "TAKEBACK_DECLINED");
    checkTakeback(Game.collection.findOne(), 4, 0);
  });
  //                -> giver_accept               -> message, not pending
  it("will send a client message to the asker if the asker tries to accept his own takeback request", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
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
  it("will accept a takeback and send a client message to the asker if the giver accepts the takeback", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    checkTakeback(Game.collection.findOne());
    chai.assert.doesNotThrow(() =>
      Game.requestLocalTakeback("mi2", game_id, 4)
    );
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
});

describe("Game.requestLocalTakeback", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.requestLocalTakeback("mi1", "somegame", 5);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("works on their move", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6"].forEach(move => {
      Game.saveLocalMove("mi2", game_id, move);
      const temp = self.loggedonuser;
      self.loggedonuser = other;
      other = temp;
    }); // It is whites move here.
    Game.requestLocalTakeback("mi2", game_id, 4);
    const game1 = Game.collection.findOne();
    checkTakeback(game1, 4, 0);
    Game.saveLocalMove("mi3", game_id, "b4");
    const game2 = Game.collection.findOne();
    checkTakeback(game2, 5, 0);
    checkLastAction(game2, 0, "move", us._id, "b4");
    checkLastAction(game2, 1, "takeback_requested", us._id, 4);
  });

  it("works on their opponents move", function() {
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
      15,
      0,
      "white"
    );
    ["d4", "Nf6", "c4", "g6", "g3", "c6", "b4"].forEach(move => {
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
    checkLastAction(game2, 0, "move", them._id, "b5");
    checkLastAction(game2, 1, "takeback_requested", us._id, 4);
  });

  it("fails if number is null", function() {
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
      0
    );
    chai.assert.throws(
      () => Game.requestLocalTakeback("mi2", game_id),
      Match.Error
    );
    chai.assert.throws(
      () => Game.requestLocalTakeback("mi2", game_id, null),
      Match.Error
    );
    chai.assert.throws(
      () => Game.requestLocalTakeback("mi2", game_id, -1),
      Match.Error
    );
    chai.assert.throws(
      () => Game.requestLocalTakeback("mi2", game_id, 0),
      Match.Error
    );
    chai.assert.throws(
      () => Game.requestLocalTakeback("mi2", game_id, "four"),
      Match.Error
    );
  });
});

describe("Game.acceptLocalTakeback", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.acceptLocalTakeback("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Game.declineLocalTakeback", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("sends a client message if user is not playing a game", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    Game.declineLocalTakeback("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("sends a client message if a takeback is not pending", function() {
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
      0
    );
    Game.declineLocalTakeback("mi1", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_TAKEBACK_PENDING");
  });

  it("send a client message if the game is examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.requestLocalTakeback("mi2", game_id, 5);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game draw behavior", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a draw request on your move, record the draw, and leave it in effect after you make your move for your opponent to accept or decline", function() {
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
      15,
      0,
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
    checkLastAction(game, 0, "move", opp._id, "e5");
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "draw_requested", us._id);
  });

  it("should explicitly decline the draw with a client message if a draw request is declined", function() {
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
      15,
      0,
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
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "draw_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "DRAW_DECLINED");
  });

  it("should explicitly accept the draw with a client message, and end the game, if a draw request is accepted", function() {
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
      15,
      0,
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
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "draw_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "DRAW_ACCEPTED");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a draw request is already pending", function() {
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
      15,
      0,
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
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "DRAW_ALREADY_PENDING"
    );
    chai.assert.equal(game.actions.length, 1);
    checkLastAction(game, 0, "draw_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a draw", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a draw", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting a draw", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalDraw("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.requestLocalDraw("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game abort behavior", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a abort request on your move, record the abort, and leave it in effect after you make your move for your opponent to accept or decline", function() {
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
      15,
      0,
      "white"
    );
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi2", game_id);
    checkAbort(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAbort(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.saveLocalMove("mi4", game_id, "e5");

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "move", opp._id, "e5");
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "abort_requested", us._id);
  });

  it("should explicitly decline the abort with a client message if a abort request is declined", function() {
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
      15,
      0,
      "white"
    );
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi2", game_id);
    checkAbort(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAbort(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.declineLocalAbort("mi4", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "abort_declined", opp._id);
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "abort_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ABORT_DECLINED");
  });

  it("should explicitly accept the abort with a client message, and end the game, if a abort request is accepted", function() {
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
      15,
      0,
      "white"
    );
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi2", game_id);
    checkAbort(Game.collection.findOne(), "mi2", "0");
    Game.saveLocalMove("mi3", game_id, "e4");
    checkAbort(Game.collection.findOne(), "mi2", "0");
    self.loggedonuser = opp;
    Game.acceptLocalAbort("mi4", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "0", "0");
    checkLastAction(game, 0, "abort_accepted", opp._id);
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "abort_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ABORT_ACCEPTED");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a abort request is already pending", function() {
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
      15,
      0,
      "white"
    );
    checkAbort(Game.collection.findOne(), "0", "0");
    Game.requestLocalAbort("mi2", game_id);
    checkAbort(Game.collection.findOne(), "mi2", "0");
    Game.requestLocalAbort("mi3", game_id);

    const game = Game.collection.findOne();
    checkAbort(game, "mi2", "0");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "ABORT_ALREADY_PENDING"
    );
    chai.assert.equal(game.actions.length, 1);
    checkLastAction(game, 0, "abort_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a abort", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a abort", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting an abort", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalAbort("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.requestLocalAbort("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Local game adjourn behavior", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a adjourn request on your move, record the adjourn, and leave it in effect after you make your move for your opponent to accept or decline", function() {
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
      15,
      0,
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
    checkLastAction(game, 0, "move", opp._id, "e5");
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "adjourn_requested", us._id);
  });

  it("should explicitly decline the adjourn with a client message if a adjourn request is declined", function() {
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
      15,
      0,
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
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "adjourn_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ADJOURN_DECLINED");
  });

  it("should explicitly accept the adjourn with a client message, and end the game, if an adjourn request is accepted", function() {
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
      15,
      0,
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
    checkLastAction(game, 1, "move", us._id, "e4");
    checkLastAction(game, 2, "adjourn_requested", us._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], us._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ADJOURN_ACCEPTED");

    chai.assert.equal(game.status, "examining");
  });

  it("should write a client message to the asker if a adjourn request is already pending", function() {
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
      15,
      0,
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
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "ADJOURN_ALREADY_PENDING"
    );
    chai.assert.equal(game.actions.length, 1);
    checkLastAction(game, 0, "adjourn_requested", us._id);
  });

  it("should write a client message to the asker if a no game is being played when accepting a adjourn", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.acceptLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when declining a adjourn", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.declineLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("should write a client message to the asker if a no game is being played when requesting an adjourn", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.requestLocalAdjourn("mi1", "somegame");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(
      self.clientMessagesSpy.args[0][0]._id,
      self.loggedonuser._id
    );
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.requestLocalAdjourn("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });
});

describe("Game.resignLocalGame", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("send a client message if user is not playing a game", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.resignLocalGame("mi2", "somegame");
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("send a client message if the game is examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_A_GAME");
  });

  it("works on their move", function() {
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
      15,
      0,
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
      15,
      0,
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

  it("works on their opponents move", function() {
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
      15,
      0,
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
      15,
      0,
      "white"
    );
    Game.saveLocalMove("mi2", game2_id, "e4");
    Game.resignLocalGame("mi3", game2_id);
    const game2 = Game.collection.findOne({ _id: game2_id });
    checkLastAction(game2, 0, "resign", us._id);
    chai.assert.equal(game2.status, "examining");
    chai.assert.equal(game2.result, "0-1");
  });

  it("should, on a resign", function() {
    it("should reset a pending draws", function() {
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
        15,
        0,
        "white"
      );
      Game.requestLocalDraw("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkDraw(Game.collection.findOne());
    });

    it("should reset a pending aborts", function() {
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
        15,
        0,
        "white"
      );
      Game.requestLocalAbort("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkAbort(Game.collection.findOne());
    });

    it("should reset a pending adjourns", function() {
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
        15,
        0,
        "white"
      );
      Game.requestLocalAdjourn("mi2", game1_id);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkAdjourn(Game.collection.findOne());
    });
    it("should reset a pending takebacks", function() {
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
        15,
        0,
        "white"
      );
      Game.requestLocalTakeback("mi2", game1_id, 5);
      self.loggedonuser = them;
      Game.resignLocalGame("mi2", game1_id);
      checkTakeback(Game.collection.findOne());
    });
  });
});

describe("Game.moveBackward", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("fails if game is not an examined game", function() {
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
      15,
      0
    );
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $push: { examiners: examiner._id } }
    );
    Game.moveBackward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("fails if user is not an examiner", function() {
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
      15,
      0
    );
    Game.moveBackward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("writes an action and undoes the move if possible", function() {
    const examiner = TestHelpers.createUser();
    self.loggedonuser = examiner;
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
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.moveBackward("mi3", game_id);
    const game = Game.collection.findOne({ _id: game_id });
    checkLastAction(game, 0, "move_backward", examiner._id, 1);
    checkLastAction(game, 1, "move", examiner._id, "e4");
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    checkLastAction(game, 0, "move_backward", examiner._id, 1);
    checkLastAction(game, 1, "move", examiner._id, "e4");
  });

  it("move back multiple moves if a number > 1 i specified", function() {
    const examiner = TestHelpers.createUser();
    self.loggedonuser = examiner;
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
    ["e4", "e5", "Nf3", "Nc6", "Be2", "Be7"].forEach(move =>
      Game.saveLocalMove("mi2", game_id, move)
    );
    Game.moveBackward("mi3", game_id, 3);
    const game = Game.collection.findOne({ _id: game_id });
    checkLastAction(game, 0, "move_backward", examiner._id, 3);
    checkLastAction(game, 1, "move", examiner._id, "Be7");
    Game.saveLocalMove("mi2", game_id, "Na6");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.collection.findOne({ _id: game_id });
    checkLastAction(game2, 0, "move", examiner._id, "Na6");
    checkLastAction(game2, 1, "move_backward", examiner._id, 3);
  });

  it("writes a client message if there is no move to undo", function() {
    self.loggedonuser = TestHelpers.createUser();
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
    Game.moveBackward("mi3", game_id);
    Game.moveBackward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(
      self.clientMessagesSpy.args[0][2],
      "TOO_MANY_MOVES_BACKWARD"
    );
  });

  it("moves up to the previous variation and continues on", function() {
    this.timeout(500000);
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame(
      "mi0",
      "whiteguy",
      "blackguy",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.saveLocalMove("mi1", game_id, "e4");
    Game.saveLocalMove("mi2", game_id, "e5");
    Game.saveLocalMove("mi3", game_id, "Nf3");
    Game.saveLocalMove("mi4", game_id, "Nc6");
    Game.moveBackward("mi5", game_id, 2);
    Game.saveLocalMove("mi6", game_id, "Ne2");
    Game.saveLocalMove("mi7", game_id, "Nc6");
    Game.saveLocalMove("mi8", game_id, "g3");
    Game.saveLocalMove("mi9", game_id, "g6");
    Game.moveBackward("mi10", game_id, 3);
    Game.saveLocalMove("mi11", game_id, "Nh6");

    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({});

    checkLastAction(game, 0, "move", self.loggedonuser._id, "Nh6");
    checkLastAction(game, 1, "move_backward", self.loggedonuser._id, 3);
    checkLastAction(game, 2, "move", self.loggedonuser._id, "g6");
    checkLastAction(game, 3, "move", self.loggedonuser._id, "g3");
    checkLastAction(game, 4, "move", self.loggedonuser._id, "Nc6");
    checkLastAction(game, 5, "move", self.loggedonuser._id, "Ne2");
    checkLastAction(game, 6, "move_backward", self.loggedonuser._id, 2);
    checkLastAction(game, 7, "move", self.loggedonuser._id, "Nc6");
    checkLastAction(game, 8, "move", self.loggedonuser._id, "Nf3");
    checkLastAction(game, 9, "move", self.loggedonuser._id, "e5");
    checkLastAction(game, 10, "move", self.loggedonuser._id, "e4");
  });
});

describe.skip("Game.buildMoveListFromActions", function() {
  // eslint-disable-next-line no-undef
  before(function(done) {
    Meteor.startup(() => done());
  });
  it("needs to work correctly", function() {
    const game = {
      actions: [
        { type: "move", parameter: "e4" },
        { type: "move", parameter: "e5" },
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "move", parameter: "Bc4" },
        { type: "move", parameter: "Be7" },
        { type: "move", parameter: "d4" },
        { type: "move", parameter: "Nxd4" },
        { type: "move", parameter: "c3" },
        { type: "move", parameter: "d5" },
        { type: "move", parameter: "exd5" },
        { type: "move", parameter: "b5" },
        { type: "move", parameter: "cxd4" },
        { type: "move", parameter: "bxc4" },
        { type: "takeback_requested", parameter: 8 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "c3" },
        { type: "move", parameter: "d6" },
        { type: "move", parameter: "d4" },
        { type: "move", parameter: "exd4" },
        { type: "move", parameter: "cxd4" },
        { type: "takeback_requested", parameter: 7 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "Be2" },
        { type: "move", parameter: "Be7" },
        { type: "move", parameter: "O-O" },
        { type: "move", parameter: "d5" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "c3" },
        { type: "move", parameter: "d6" },
        { type: "move", parameter: "d4" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "d5" },
        { type: "move", parameter: "d4" },
        { type: "takeback_requested", parameter: 7 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "f4" },
        { type: "move", parameter: "Nc6" },
        { type: "move", parameter: "Nf3" },
        { type: "takeback_requested", parameter: 3 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "move", parameter: "Bc4" },
        { type: "move", parameter: "Be7" },
        { type: "move", parameter: "d4" },
        { type: "move", parameter: "Nxd4" },
        { type: "move", parameter: "c3" },
        { type: "move", parameter: "d5" },
        { type: "move", parameter: "exd5" },
        { type: "move", parameter: "b5" },
        { type: "move", parameter: "cxd4" },
        { type: "move", parameter: "bxc4" }
      ]
    };
    const variation_object = { hmtb: 0, cmi: 0, movelist: [{}] };
    game.actions.forEach(action =>
      Game.addActionToMoveList(variation_object, action)
    );

    const pgn = Game.buildPgnFromMovelist(variation_object.movelist);
    const expectedpgn =
      "1.e4e52.Nf3(2.f4Nc63.Nf3)2...Nc63.Bc4(3.Be2Be74.O-O(4.c3d6(4...d55.d4)5.d4)4...d5)3...Be74.d4(4.c3d65.d4exd46.cxd4)4...Nxd45.c3d56.exd5b57.cxd4bxc4";
    const actualpgn = pgn.replace(/\s/g, "");
    chai.assert.equal(actualpgn, expectedpgn);
  });
});

describe("Game.buildMovelistFromPgn", function() {
  it.skip("needs to be written", function() {
    const pgn =
      "1.e4 e5 2.Nf3 (2.f4 Nc6 3.Nf3) 2...Nc6 3.Bc4 (3.Be2 Be7 4.O-O (4.c3 d6 (4...d5 5.d4) 5.d4) 4...d5) 3...Be7 4.d4 (4.c3 d6 5.d4 exd4 6.cxd4) 4...Nxd4 5.c3 d5 6.exd5 b5 7.cxd4 bxc4";
    chai.assert.fail("do me");
   });
});

describe("Game.moveForward", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("fails if game is not an examined game", function() {
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
      15,
      0
    );
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $push: { examiners: examiner._id } }
    );
    Game.moveForward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("fails if user is not an examiner", function() {
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
      15,
      0
    );
    Game.moveForward("mi2", game_id, 1);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("writes an action and moves forward if there is no variation", function() {
    const us = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame(
      "mi1",
      "white",
      "black",
      0,
      "standard",
      15,
      0,
      15,
      0
    );
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi3", game_id, "e5");
    Game.saveLocalMove("mi4", game_id, "Nf3");
    Game.saveLocalMove("mi5", game_id, "Nc6");
    Game.moveBackward("mi6", game_id, 3);
    Game.moveForward("mi7", game_id, 3);
    const game = Game.collection.findOne({});
    checkLastAction(game, 0, "move_forward", us._id, 3);
    checkLastAction(game, 1, "move_backward", us._id, 3);
    checkLastAction(game, 2, "move", us._id, "Nc6");
    checkLastAction(game, 3, "move", us._id, "Nf3");
    checkLastAction(game, 4, "move", us._id, "e5");
    checkLastAction(game, 5, "move", us._id, "e4");
  });

  it.skip("writes a client message if there is no move to go to", function() {
    chai.assert.fail("do me");
  });
  it.skip("writes a client message if there is a variation and none is specified", function() {
    chai.assert.fail("do me");
  });
  it.skip("moves to the correct variation, and future forwards follow the new variation, when one is specified", function() {
    chai.assert.fail("do me");
  });
  it.skip("allows zero to be the default variation when there is no variation", function() {
    chai.assert.fail("do me");
  });
  it.skip("requires zero to be the first variation, and 1+ to be subsequent variations (i.e. zero based)", function() {
    chai.assert.fail("do me");
  });
});

describe.skip("When a user disconnects while playing a game", function() {
  it("should adjourn the game and write an action", function() {});
  it("should write a connect and disconnect action to the adjourned game every time they connect and disconnect", function() {});
});
