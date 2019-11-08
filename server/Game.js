import Chess from "chess.js";
import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { PlayedGameSchema } from "./PlayedGameSchema";
import { ExaminedGameSchema } from "./ExaminedGameSchema";

export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};

GameCollection.attachSchema(ExaminedGameSchema, {
  selector: { status: "examining" }
});
GameCollection.attachSchema(PlayedGameSchema, {
  selector: { status: "playing" }
});

function getAndCheck(message_identifier, game_id) {
  const self = Meteor.user();
  check(self, Object);
  check(game_id, String);

  const game = GameCollection.findOne({ _id: game_id });

  if (!game) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  if (game.legacy_game_number)
    throw new ICCMeteorError(message_identifier, "Found a legacy game record");

  if (!active_games[game_id])
    throw new ICCMeteorError(
      "server",
      "Unable to find chessboard validator for game"
    );

  return game;
}

Game.startLocalGame = function(
  message_identifier,
  other_user,
  wild_number,
  rating_type,
  rated,
  white_initial,
  white_increment,
  black_initial,
  black_increment,
  color /*,
  irregular_legality,
  irregular_semantics,
  uses_plunkers,
  fancy_timecontrol,
  promote_to_king*/
) {
  const self = Meteor.user();

  check(self, Object);
  check(message_identifier, String);
  check(other_user, Object);
  check(wild_number, Number);
  check(rating_type, String);
  check(rated, Boolean);
  check(white_initial, Number);
  check(white_increment, Number);
  check(black_initial, Number);
  check(black_increment, Number);
  check(color, Match.Maybe(String));
  if (!self.loggedOn) {
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start game",
      "User starting game is not logged on"
    );
  }

  if (!!color && color !== "white" && color !== "black")
    throw new Match.Error("color must be undefined, 'white' or 'black");

  if (!other_user.loggedOn) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_OPPONENT"
    );
    return;
  }

  if (
    !Roles.userIsInRole(self, "play_" + (rated ? "" : "un") + "rated_games")
  ) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_" + (rated ? "" : "UN") + "RATED_GAMES"
    );
    return;
  }

  if (
    !Roles.userIsInRole(
      other_user,
      "play_" + (rated ? "" : "un") + "rated_games"
    )
  ) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_OPPONENT"
    );
    return;
  }

  if (
    !SystemConfiguration.meetsTimeAndIncRules(white_initial, white_increment)
  ) {
    throw new ICCMeteorError(
      "Unable to start game",
      "White time/inc fails validation"
    );
  }
  if (
    !SystemConfiguration.meetsTimeAndIncRules(black_initial, black_increment)
  ) {
    throw new ICCMeteorError(
      "Unable to start game",
      "White time/inc fails validation"
    );
  }

  const white = determineWhite(self, other_user, color);
  const black = white._id === self._id ? other_user : self;

  const game = {
    starttime: new Date(),
    result: "*",
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
      id: white._id,
      name: white.username,
      rating: white.ratings[rating_type].rating
    },
    black: {
      id: black._id,
      name: black.username,
      rating: black.ratings[rating_type].rating
    },
    wild: wild_number,
    rating_type: rating_type,
    rated: rated,
    clocks: {
      white: {
        initial: white_initial,
        inc: white_increment,
        current: white_initial
      },
      black: {
        initial: black_initial,
        inc: black_increment,
        current: black_initial
      }
    },
    status: "playing",
    actions: [],
    observers: []
  };
  const game_id = GameCollection.insert(game);
  active_games[game_id] = new Chess.Chess();
  return game_id;
};

Game.startLocalExaminedGame = function(
  message_identifier,
  white_name,
  black_name,
  wild_number,
  rating_type,
  white_initial,
  white_increment,
  black_initial,
  black_increment,
  other_headers
) {
  const self = Meteor.user();

  check(self, Object);
  check(message_identifier, String);
  check(white_name, String);
  check(black_name, String);
  check(wild_number, Number);
  check(rating_type, String);
  check(white_initial, Number);
  check(white_increment, Number);
  check(black_initial, Number);
  check(black_increment, Number);
  check(other_headers, Match.Maybe(Object));

  if (!self.loggedOn) {
    throw new ICCMeteorError(
      message_identifier,
      "Unable to examine game",
      "User examining game is not logged on"
    );
  }

  const game = {
    starttime: new Date(),
    result: "*",
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
      name: white_name,
      rating: 1600
    },
    black: {
      name: black_name,
      rating: 1600
    },
    wild: wild_number,
    rating_type: rating_type,
    clocks: {
      white: {
        initial: white_initial,
        inc: white_increment
      },
      black: {
        initial: black_initial,
        inc: black_increment
      }
    },
    status: "examining",
    actions: [],
    observers: [self._id],
    examiners: [self._id]
  };

  if (!!other_headers) game.tags = other_headers;
  const game_id = GameCollection.insert(game);
  active_games[game_id] = new Chess.Chess();
  return game_id;
};

Game.startLegacyGame = function(
  message_identifier,
  gamenumber,
  whitename,
  blackname,
  wild_number,
  rating_type,
  rated,
  white_initial,
  white_increment,
  black_initial,
  black_increment,
  played_game,
  white_rating,
  black_rating,
  game_id,
  white_titles,
  black_titles,
  ex_string,
  irregular_legality,
  irregular_semantics,
  uses_plunkers,
  fancy_timecontrol,
  promote_to_king
) {
  check(message_identifier, String);

  check(gamenumber, Number);

  check(whitename, String);

  check(blackname, String);

  check(wild_number, Number);

  check(rating_type, String);

  check(rated, Boolean);

  check(white_initial, Number);

  check(white_increment, Number);

  check(black_initial, Number);

  check(black_increment, Number);

  check(played_game, Boolean);

  check(ex_string, String);

  check(white_rating, Number);

  check(black_rating, Number);

  check(game_id, String);

  check(white_titles, Array);

  check(black_titles, Array);

  check(irregular_legality, Match.Maybe(String));

  check(irregular_semantics, Match.Maybe(String));

  check(uses_plunkers, Match.Maybe(String));

  check(fancy_timecontrol, Match.Maybe(String));

  check(promote_to_king, Match.Maybe(String));

  const whiteuser = Meteor.users.findOne({
    "profile.legacy.username": whitename
  });

  const blackuser = Meteor.users.findOne({
    "profile.legacy.username": blackname
  });

  const self = Meteor.user();
  const iswhite = !!self && !!whiteuser && whiteuser._id === self._id;
  const isblack = !!self && !!blackuser && blackuser._id === self._id;
  if (!self || (!iswhite && !isblack))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start legacy game",
      "Unable to find user"
    );

  if (!self.loggedOn)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start legacy game",
      "User is not logged on"
    );

  const exists = GameCollection.find({
    legacy_game_number: gamenumber
  }).count();
  if (exists)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start game",
      "There is already a game in the database with the same game number"
    );

  const game = {
    starttime: new Date(),
    legacy_game_number: gamenumber,
    legacy_game_id: game_id,
    white: {
      name: "(L) " + whitename,
      rating: white_rating
    },
    black: {
      name: "(L) " + blackname,
      rating: black_rating
    },
    wild: wild_number,
    rating_type: rating_type,
    rated: rated,
    clocks: {
      white: {
        initial: white_initial,
        inc: white_increment,
        current: white_initial
      },
      black: {
        initial: black_initial,
        inc: black_increment,
        current: black_initial
      }
    },
    status: played_game ? "playing" : "examining",
    result: "*",
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
    actions: []
  };

  game.examiners = [];
  if (!!whiteuser) {
    game.white.id = whiteuser._id;
    if (!played_game) game.examiners.push(whiteuser._id);
  }
  if (!!blackuser) {
    game.black.id = blackuser._id;
    if (!played_game) game.examiners.push(blackuser._id);
  }

  return GameCollection.insert(game);
};

Game.saveLegacyMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, Number);
  check(move, String);

  const self = Meteor.user();
  check(self, Object);

  log.debug("Game Move", move);

  const game = GameCollection.findOne({ legacy_game_number: game_id });

  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to make move",
      "Unable to find legacy game record"
    );

  if (game.white.id !== self._id && game.black.id !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to make move",
      "User does not seem to be either player"
    );

  GameCollection.update(
    { _id: game._id, status: "playing" },
    { $push: { actions: { type: "move", issuer: "legacy", parameter: move } } }
  );
};

Game.saveLocalMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);
  const self = Meteor.user();
  check(self, Object);
  /*
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;
  const chessObject = active_games[game_id];

  if (game.status === "playing") {
    const turn_id = chessObject.turn() === "w" ? game.white.id : game.black.id;
    if (self._id !== turn_id) {
      ClientMessages.sendMessageToClient(
        Meteor.user(),
        message_identifier,
        "COMMAND_INVALID_NOT_YOUR_MOVE"
      );
      return;
    }
  } else if (game.examiners.indexOf(self._id) === -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "NOT_AN_EXAMINER"
    );
    return;
  }

  const result = chessObject.move(move);
  if (!result) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "ILLEGAL_MOVE",
      [move]
    );
    return;
  }

  const updateobject = {
    $push: { actions: { type: "move", issuer: self._id, parameter: move } }
  };

  const setobject = {};

  if (game.status === "playing") {
    if (
      active_games[game_id].in_draw() &&
      !active_games[game_id].in_threefold_repetition()
    ) {
      setobject.result = "1/2-1/2";
    } else if (active_games[game_id].in_stalemate()) {
      setobject.result = "1/2-1/2";
    } else if (active_games[game_id].in_checkmate()) {
      setobject.result = active_games[game_id].turn() === "w" ? "0-1" : "1-0";
    } else if (active_games[game_id].insufficient_material()) {
      setobject.result = "1/2-1/2";
    }
    if (!!setobject.result) {
      setobject.status = "examining";
      setobject.examining = [game.white.id, game.black.id];
      updateobject["$unset"] = { pending: "" };
    }
    const bw = self._id === game.white.id ? "black" : "white";
    const color = bw === "white" ? "black" : "white";
    setobject["pending." + bw + ".draw"] = "0";
    setobject["pending." + bw + ".abort"] = "0";
    setobject["pending." + bw + ".adjourn"] = "0";
    setobject["pending." + bw + ".takeback.number"] = 0;
    setobject["pending." + bw + ".takeback.mid"] = "0";

    //
    // Add a half move to the takeback request if the user requested a takeback and then
    // made their own move.
    //
    if (!setobject.result && game.pending[color].takeback.number)
      setobject["pending." + color + ".takeback.number"] =
        game.pending[color].takeback.number + 1;

    updateobject["$set"] = setobject;
  }
 // log.debug("udaodetObject---1", updateobject);
 */
  log.debug(
    "Record Data",
    GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: {
          actions: {
            type: "move",
            issuer: "8rdTGmZ3D6SNqXipN",
            parameter: "b6"
          }
        },
        $set: {
          "pending.black.draw": "0",
          "pending.black.abort": "0",
          "pending.black.adjourn": "0",
          "pending.black.takeback.number": 0,
          "pending.black.takeback.mid": "0"
        }
      }
    )
  );
};

//	There are three outcome codes, given in the following order:
// 	(1) game_result, e.g. "Mat" (the 3-letter codes used in game lists)
// 	(2) score_string2, "0-1", "1-0", "1/2-1/2", "*", or "aborted"
// 	(3) description_string, e.g. "White checkmated"
Game.legacyGameEnded = function(
  message_identifier,
  gamenumber,
  become_examined,
  game_result_code,
  score_string2
  //description_string,
  //eco
) {
  check(message_identifier, String);
  check(gamenumber, Number);
  check(become_examined, Boolean);
  //check(game_result_code, String);
  check(score_string2, String);
  //check(description_string, String);

  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({ legacy_game_number: gamenumber });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to end game",
      "Unable to locate legacy game record"
    );
  if (game.white.id !== self._id && game.black.id !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to end game",
      "User does not seem to be black or white"
    );
  if (game.status !== "playing")
    throw new ICCMeteorError(
      message_identifier,
      "Unable to end game",
      "Game is not being played"
    );
  if (become_examined) {
    const examiners = [];
    if (game.white.id) examiners.push(game.white.id);
    if (game.black.id) examiners.push(game.black.id);
    GameCollection.update(
      { _id: game._id, status: "playing" },
      {
        $set: {
          result: score_string2,
          status: "examining",
          examiners: examiners
        },
        $push: { observers: { $each: examiners } }
      }
    );
  } else GameCollection.remove({ _id: game._id });
};

Game.localRemoveExaminer = function(message_identifier, game_id, id_to_remove) {
  check(message_identifier, String);
  check(game_id, String);
  check(id_to_remove, String);
  const self = Meteor.user();
  check(self, Object);

  if (id_to_remove === self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove examiner",
      "Cannot remove yourself"
    );

  const game = GameCollection.findOne({
    _id: game_id
  });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove examiner",
      "game id does not exist"
    );

  if (!game.examiners || game.examiners.indexOf(self._id) === -1)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove examiner",
      "Issuer is not an examiner"
    );

  if (!game.examiners || game.examiners.indexOf(id_to_remove) === -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "NOT_AN_EXAMINER"
    );
    return;
  }
  GameCollection.update(
    { _id: game_id, status: "examining" },
    { $pull: { examiners: id_to_remove } }
  );
};

Game.localAddExamainer = function(message_identifier, game_id, id_to_add) {
  check(message_identifier, String);
  check(game_id, String);
  check(id_to_add, String);
  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({ _id: game_id });

  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add examiner",
      "Unable to find game record"
    );

  if (!game.examiners || game.examiners.indexOf(self._id) === -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "NOT_AN_EXAMINER"
    );
    return;
  }

  if (!game.observers || game.observers.indexOf(id_to_add) === -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "NOT_AN_OBSERVER"
    );
    return;
  }

  if (!!game.examiners && game.examiners.indexOf(id_to_add) !== -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "ALREADY_AN_EXAMINER"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "examining" },
    { $push: { examiners: id_to_add } }
  );
};

Game.localRemoveObserver = function(message_identifier, game_id, id_to_remove) {
  check(message_identifier, String);
  check(game_id, String);
  check(id_to_remove, String);
  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({
    _id: game_id
  });

  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove observer",
      "game id does not exist"
    );

  if (!game.observers || game.observers.indexOf(id_to_remove) === -1) {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "NOT_AN_OBSERVER"
    );
    return;
  }

  if (id_to_remove !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove observer",
      "You can only remove yourself"
    );

  if (
    !!game.examiners &&
    game.examiners.length === 1 &&
    game.examiners[0] === id_to_remove
  )
    GameCollection.remove({ _id: game_id });
  else
    GameCollection.update(
      { _id: game_id, status: game.status },
      { $pull: { examiners: id_to_remove, observers: id_to_remove } }
    );
};

Game.localAddObserver = function(message_identifier, game_id, id_to_add) {
  check(message_identifier, String);
  check(game_id, String);
  check(id_to_add, String);

  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({ _id: game_id });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add examiner",
      "game id does not exist"
    );
  if (Meteor.users.find({ _id: id_to_add }).count() !== 1)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add observer",
      "Unable to find user record for ID"
    );
  if (game.legacy_game_number)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add observer",
      "Game is a legacy game"
    );
  if (self._id !== id_to_add)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add observer",
      "Currently no support for adding another observer"
    );
  GameCollection.update(
    { _id: game_id, status: game.status },
    { $push: { observers: id_to_add } }
  );
};

Game.removeLegacyGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, Number);
  const self = Meteor.user();
  check(self, Object);

  const count = GameCollection.remove({ legacy_game_number: game_id });
  if (!count)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove legacy game",
      "Game id not found"
    );
  else if (count !== 1)
    throw new ICCMeteorError(
      message_identifier,
      "Catastrophe!",
      "Deleted more than one record!"
    );
};

Game.requestLocalTakeback = function(message_identifier, game_id, number) {
  check(message_identifier, String);
  check(game_id, String);
  check(number, Number);

  if (number < 1)
    throw new Match.Error("takeback half ply value must be greater than zero");

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const color =
    game.white.id === self._id
      ? "white"
      : game.black.id === self._id
      ? "black"
      : null;

  if (!color)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to request takeback",
      "User is not either player"
    );

  //
  // If other player has a matching takeback requested, go ahead
  // and treat this as an accepted takeback.
  //
  const othercolor = color === "white" ? "black" : "white";
  if (game.pending[othercolor].takeback.number === number)
    return this.acceptLocalTakeback(message_identifier, game_id);

  if (game.pending[color].takeback.number !== 0) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "TAKEBACK_ALREADY_PENDING"
    );
    return;
  }

  const tbobject = {};
  tbobject["pending." + color + ".takeback.number"] = number;
  tbobject["pending." + color + ".takeback.mid"] = message_identifier;

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: tbobject,
      $push: {
        actions: {
          type: "takeback_requested",
          issuer: self._id,
          parameter: number
        }
      }
    }
  );
};

Game.acceptLocalTakeback = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  if (!game.pending[othercolor].takeback.number) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NO_TAKEBACK_PENDING"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: {
        actions: {
          type: "takeback_accepted",
          issuer: self._id
        }
      },
      $set: {
        "pending.white.takeback": { number: 0, mid: "0" },
        "pending.black.takeback": { number: 0, mid: "0" }
      }
    }
  );

  for (let x = 0; x < game.pending[othercolor].takeback.number; x++)
    active_games[game_id].undo();

  const otheruser = othercolor === "white" ? game.white.id : game.black.id;
  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].takeback.mid,
    "TAKEBACK_ACCEPTED"
  );
};

Game.declineLocalTakeback = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  if (!game.pending[othercolor].takeback.number) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NO_TAKEBACK_PENDING"
    );
    return;
  }

  const setobject = {};
  setobject["pending." + othercolor + ".takeback"] = { number: 0, mid: null };
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: {
        actions: { type: "takeback_declined", issuer: self._id },
        $set: setobject
      }
    }
  );

  const otherplayer = othercolor === "white" ? game.white.id : game.black.id;
  ClientMessages.sendMessageToClient(
    otherplayer,
    game.pending[othercolor].takeback.mid,
    "TAKEBACK_DECLINED"
  );
};

Game.requestLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  if (game.legacy_game_number)
    throw new ICCMeteorError(
      self,
      message_identifier,
      "Unable to request draw",
      "Cannot request a local draw on a legacy game"
    );

  if (!game || game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  if (active_games[game_id].in_threefold_repetition()) {
    GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: {
          actions: { type: "draw", issuer: self._id },
          observers: { $each: [game.white.id, game.black.id] }
        },
        $unset: { pending: "" },
        $set: {
          status: "examining",
          result: "1/2-1/2",
          examiners: [game.white.id, game.black.id]
        }
      }
    );
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].draw !== "0") {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "DRAW_ALREADY_PENDING"
    );
    return;
  }

  const setobject = {};
  setobject["pending." + color + ".draw"] = message_identifier;

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "draw_requested", issuer: self._id } },
      $set: setobject
    }
  );
};

Game.requestLocalAbort = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  if (game.legacy_game_number)
    throw new ICCMeteorError(
      self,
      message_identifier,
      "Unable to request abort",
      "Cannot request a local abort on a legacy game"
    );

  if (!game || game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].abort !== "0") {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "ABORT_ALREADY_PENDING"
    );
    return;
  }

  const setobject = {};
  setobject["pending." + color + ".abort"] = message_identifier;

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "abort_requested", issuer: self._id } },
      $set: setobject
    }
  );
};

Game.requestLocalAdjourn = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  if (game.legacy_game_number)
    throw new ICCMeteorError(
      self,
      message_identifier,
      "Unable to request adjourn",
      "Cannot request a local adjourn on a legacy game"
    );

  if (!game || game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].adjourn !== "0") {
    ClientMessages.sendMessageToClient(
      self._id,
      message_identifier,
      "ADJOURN_ALREADY_PENDING"
    );
    return;
  }

  const setobject = {};
  setobject["pending." + color + ".adjourn"] = message_identifier;

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "adjourn_requested", issuer: self._id } },
      $set: setobject
    }
  );
};

Game.acceptLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "1/2-1-2",
        examiners: [game.white.id, game.black.id]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "draw_accepted",
          issuer: self._id
        },
        observers: { $each: [game.white.id, game.black.id] }
      }
    }
  );

  const othercolor = self._id === game.white.id ? "black" : "white";
  const otheruser = self._id === game.white.id ? game.black.id : game.white.id;
  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].draw,
    "DRAW_ACCEPTED"
  );
};

Game.acceptLocalAbort = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "aborted",
        examiners: [game.white.id, game.black.id]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "abort_accepted",
          issuer: self._id
        },
        observers: { $each: [game.white.id, game.black.id] }
      }
    }
  );

  const othercolor = self._id === game.white.id ? "black" : "white";
  const otheruser = self._id === game.white.id ? game.black.id : game.white.id;
  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].abort,
    "ABORT_ACCEPTED"
  );
};

Game.acceptLocalAdjourn = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "adjourned",
        examiners: [game.white.id, game.black.id]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "adjourn_accepted",
          issuer: self._id
        },
        observers: { $each: [game.white.id, game.black.id] }
      }
    }
  );

  const othercolor = self._id === game.white.id ? "black" : "white";
  const otheruser = self._id === game.white.id ? game.black.id : game.white.id;
  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].adjourn,
    "ADJOURN_ACCEPTED"
  );
};

Game.declineLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  const setobject = {};
  const otheruser = othercolor === "white" ? game.white.id : game.black.id;

  setobject["pending." + othercolor + ".draw"] = "0";
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "draw_declined", issuer: self._id } },
      $set: setobject
    }
  );

  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].draw,
    "DRAW_DECLINED"
  );
};

Game.declineLocalAbort = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  const setobject = {};
  const otheruser = othercolor === "white" ? game.white.id : game.black.id;

  setobject["pending." + othercolor + ".abort"] = "0";
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "abort_declined", issuer: self._id } },
      $set: setobject
    }
  );

  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].abort,
    "ABORT_DECLINED"
  );
};

Game.declineLocalAdjourn = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  const setobject = {};
  const otheruser = othercolor === "white" ? game.white.id : game.black.id;

  setobject["pending." + othercolor + ".adjourn"] = "0";
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: { type: "adjourn_declined", issuer: self._id } },
      $set: setobject
    }
  );

  ClientMessages.sendMessageToClient(
    otheruser,
    game.pending[othercolor].adjourn,
    "ADJOURN_DECLINED"
  );
};

Game.resignLocalGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "NOT_PLAYING_A_GAME"
    );
    return;
  }

  const result = self._id === game.white.id ? "0-1" : "1-0";
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: {
        actions: { type: "resign", issuer: self._id },
        observers: { $each: [game.white.id, game.black.id] }
      },
      $unset: { pending: "" },
      $set: {
        status: "examining",
        examiners: [game.white.id, game.black.id],
        result: result
      }
    }
  );
};

Game.recordLegacyOffers = function(
  message_identifier,
  game_number,
  wdraw,
  bdraw,
  wadjourn,
  badjourn,
  wabort,
  babort,
  wtakeback,
  btakeback
) {
  check(message_identifier, String);
  check(wdraw, Boolean);
  check(bdraw, Boolean);
  check(wadjourn, Boolean);
  check(badjourn, Boolean);
  check(wabort, Boolean);
  check(babort, Boolean);
  check(wtakeback, Number);
  check(btakeback, Number);

  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({ legacy_game_number: game_number });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to record offers",
      "Unable to find legacy game record"
    );
  if (game.white.id !== self._id && game.black.id !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to record offers",
      "Player is neither white nor black"
    );
};

function determineWhite(p1, p2, color) {
  if (color === "white") return p1;
  if (color === "black") return p2;

  // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
  if (Math.random() <= 0.5) return p1;
  else return p2;
}

//TODO: Add to tests
Game.opponentUserIdList = function(ofuser) {
  check(ofuser, String);
  const array = [];
  const g1 = GameCollection.find({ "white.id": ofuser });
  g1.fetch().forEach(game => array.push(game.black.id));
  const g2 = GameCollection.find({ "black.id": ofuser });
  g2.fetch().forEach(game => array.push(game.white.id));
  return array;
};

Game.isPlayingGame = function(user_or_id) {
  check(user_or_id, Match.OneOf(Object, String));
  const id = typeof user_or_id === "object" ? user_or_id._id : user_or_id;
  return (
    GameCollection.find({
      $and: [
        { status: "playing" },
        { $or: [{ "white.id": id }, { "black.id": id }] }
      ]
    }).count() !== 0
  );
};
Meteor.methods({
  addGameMove(message_identifier, game_id, move) {
    check(message_identifier, String);
    check(game_id, String);
    check(move, String);
    Game.saveLocalMove(message_identifier, game_id, move);
  }
});

Meteor.publish("game", function() {
  const user = Meteor.user();
  if (!user || !user.loggedOn) return [];
  return GameCollection.find({
    $or: [{ "white.id": user._id }, { "black.id": user._id }]
  });
});
Game.moveBackward = function(messaage_identifier, game_id, move_count) {
  const movecount = move_count || 1;
  check(game_id, String);
  check(movecount, Match.Maybe(Number));

  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({
    _id: game_id,
    status: "examining",
    examiners: self._id
  });
  if (!game) {
    ClientMessages.sendMessageToClient(
      self,
      messaage_identifier,
      "NOT_AN_EXAMINER"
    );
  }

  if (!active_games[game_id])
    throw new ICCMeteorError(
      messaage_identifier,
      "Unable to move backwards",
      "Unable to find active game"
    );

  if (move_count > active_games[game_id].history().length) {
    ClientMessages.sendMessageToClient(
      self,
      messaage_identifier,
      "TOO_MANY_MOVES_BACKWARD"
    );
    return;
  }

  for (let x = 0; x < move_count; x++) active_games[game_id].undo();

  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $push: {
        actions: {
          type: "move_backward",
          issuer: self._id,
          parameter: movecount
        }
      }
    }
  );
};

function updateGameRecordWithPGNTag(gamerecord, tag, value) {
  switch (tag) {
    case "Event":
      break;
    case "Site":
      break;
    case "Date":
      gamerecord.startTime = Date.parse(value);
      break;
    case "Round":
      break;
    case "White":
      gamerecord.white.name = value;
      break;
    case "Black":
      gamerecord.black.name = value;
      break;
    case "Result":
      gamerecord.result = value;
      break;
    case "WhiteTitle":
      break;
    case "BlackTitle":
      break;
    case "WhiteUSCF":
    case "WhiteElo":
      gamerecord.white.rating = parseInt(value);
      break;
    case "BlackUSCF":
    case "BlackElo":
      gamerecord.black.rating = parseInt(value);
      break;
    case "WhiteNA":
      break;
    case "BlackNA":
      break;
    case "WhiteType":
      break;
    case "BlackType":
      break;
    case "EventDate":
      break;
    case "EventSponsor":
      break;
    case "Section":
      break;
    case "Stage":
      break;
    case "Board":
      break;
    case "Opening":
      break;
    case "Variation":
      break;
    case "SubVariation":
      break;
    case "ECO":
      break;
    case "NIC":
      break;
    case "Time":
      break;
    case "UTCTime":
      break;
    case "UTCDate":
      break;
    case "TimeControl":
      break;
    case "SetUp":
      break;
    case "FEN":
      break;
    case "Termination":
      break;
    case "Annotator":
      break;
    case "Mode":
      break;
    case "PlyCount":
      break;
  }
}

function findVariation(move, idx, movelist) {
  if (
    !move ||
    !movelist ||
    !idx ||
    idx >= movelist.length ||
    !movelist[idx].variations
  )
    return;

  for (let x = 0; x < movelist[idx].variations.length; x++) {
    const vi = movelist[idx].variations[x];
    if (movelist[vi].move === move) return vi;
  }
}

function addmove(move_number, variations, white_to_move, movelist, idx) {
  let string = "";

  if (!movelist[idx].variations || !movelist[idx].variations.length) return "";

  if (white_to_move) {
    string += move_number + ".";
  } else {
    if (variations) string = move_number + "...";
    else string = "4";
  }
  string += movelist[movelist[idx].variations[0]].move;

  let next_move_number = move_number;
  let next_white_to_move = !white_to_move;
  if (next_white_to_move) next_move_number++;

  for (let x = 1; x < movelist[idx].variations.length; x++) {
    string +=
      " (" +
      move_number +
      (white_to_move ? "." : "...") +
      movelist[movelist[idx].variations[x]].move +
      " ";
    string +=
      addmove(
        next_move_number,
        false,
        next_white_to_move,
        movelist,
        movelist[idx].variations[x]
      ) + ") ";
  }

  string +=
    " " +
    addmove(
      next_move_number,
      movelist[idx].variations.length > 1,
      next_white_to_move,
      movelist,
      movelist[idx].variations[0]
    );
  return string;
}

function buildPgnFromMovelist(movelist) {
  let string = addmove(1, false, true, movelist, 0);
  return string;
}

function buildMoveListFromActions(gamerecord) {
  let hmtb = 0;
  let cmi = 0;
  let movelist = [{}];

  gamerecord.actions.forEach(action => {
    switch (action.type) {
      case "move":
        const move = action.parameter;
        const exists = findVariation(move, cmi, movelist);
        if (exists) cmi = exists;
        else {
          const newi = movelist.length;
          movelist.push({ move: move, prev: cmi });
          if (!movelist[cmi].variations) movelist[cmi].variations = [newi];
          else movelist[cmi].variations.push(newi);
          cmi = newi;
        }
        break;
      case "takeback_requested":
        hmtb = action.parameter;
        break;
      case "takeback_accepted":
        for (let x = 0; x < hmtb; x++) cmi = movelist[cmi].prev;
        break;
      default:
        break;
    }
  });
  return movelist;
}

Meteor.startup(function() {
  GameCollection.remove();
  if (Meteor.isTest || Meteor.isAppTest) {
    Game.collection = GameCollection;
    Game.buildMoveListFromActions = buildMoveListFromActions;
    Game.buildPgnFromMovelist = buildPgnFromMovelist;
  }
});
