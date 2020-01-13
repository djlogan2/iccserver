import Chess from "chess.js";
import { _ } from "underscore";
import { check, Match } from "meteor/check";
import { Mongo } from "meteor/mongo";

import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { PlayedGameSchema } from "./PlayedGameSchema";
import { ExaminedGameSchema } from "./ExaminedGameSchema";
import { LegacyUser } from "../lib/server/LegacyUsers";
import { UCI } from "./UCI";
import { Timestamp } from "../lib/server/timestamp";
import { TimestampServer } from "../lib/Timestamp";
import { DynamicRatings } from "./DynamicRatings";
import { Users } from "../imports/collections/users";
import { GameHistorySchema } from "./GameHistorySchema";

const x = [
  [0, "Res", "Black resigns"],
  [1, "Mat", "Black checkmated"],
  [2, "Fla", "Black forfeits on time."],
  [3, "Adj", "White declared the winner by adjudication"],
  [4, "BQ", "Black disconnected and forfeits"],
  [5, "BQ", "Black got disconnected and forfeits"],
  [6, "BQ", "Unregistered player Black disconnected and forfeits"],
  [7, "Res", "Black's partner resigns"],
  [8, "Mat", "Black's partner checkmated"],
  [9, "Fla", "Black's partner forfeits on time"],
  [10, "BQ", "Black's partner disconnected and forfeits"],
  [11, "BQ", "Black disconnected and forfeits [obsolete?]"],
  [12, "1-0", "White wins [specific reason unknown]"],
  [13, "Agr", "Game drawn by mutual agreement"],
  [14, "Sta", "Black stalemated"],
  [15, "Rep", "Game drawn by repetition"],
  [16, "50", "Game drawn by the 50 move rule"],
  [17, "TM", "Black ran out of time and White has no material to mate"],
  [18, "NM", "Game drawn because neither player has mating material"],
  [19, "NT", "Game drawn because both players ran out of time"],
  [20, "Adj", "Game drawn by adjudication"],
  [21, "Agr", "Partner's game drawn by mutual agreement"],
  [22, "NT", " Partner's game drawn because both players ran"],
  [23, "1/2", "Game drawn [specific reason unknown]"],
  [24, "?", "Game adjourned by mutual agreement"],
  [25, "?", "Game adjourned when Black disconnected"],
  [26, "?", "Game adjourned by system shutdown"],
  [27, "?", "Game courtesyadjourned by Black"],
  [28, "?", "Game adjourned by an administrator"],
  [29, "?", "Game adjourned when Black got disconnected"],
  [30, "Agr", "Game aborted by mutual agreement"],
  [31, "BQ", "Game aborted when Black disconnected"],
  [32, "SD", "Game aborted by system shutdown"],
  [33, "BA", "Game courtesyaborted by Black"],
  [34, "Adj", "Game aborted by an administrator"],
  [35, "Sho", "Game aborted because it's too short to adjourn"],
  [36, "BQ", " Game aborted when Black's partner disconnected"],
  [37, "Sho", "Game aborted by Black at move 1"],
  [38, "Sho", "Game aborted by Black's partner at move 1"],
  [39, "Sho", "Game aborted because it's too short"],
  [40, "Adj", "Game aborted because Black's account expired"],
  [41, "BQ", "Game aborted when Black got disconnected"],
  [42, "?", "No result [specific reason unknown]"]
];

export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};
const game_pings = {};
const move_timers = {};

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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  if (game.legacy_game_number)
    throw new ICCMeteorError(message_identifier, "Found a legacy game record");

  if (!active_games[game_id])
    throw new ICCMeteorError("server", "Unable to find chessboard validator for game");

  return game;
}

Game.startLocalGame = function(
  message_identifier,
  other_user,
  wild_number,
  rating_type,
  rated,
  white_initial,
  white_increment_or_delay,
  white_increment_or_delay_type,
  black_initial,
  black_increment_or_delay,
  black_increment_or_delay_type,
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
  check(white_increment_or_delay, Number);
  check(white_increment_or_delay_type, String);
  check(black_initial, Number);
  check(black_increment_or_delay, Number);
  check(black_increment_or_delay_type, String);
  check(color, Match.Maybe(String));

  check(white_increment_or_delay, Number);
  check(black_increment_or_delay, Number);
  check(white_increment_or_delay_type, String);
  check(black_increment_or_delay_type, String);

  check(self.ratings[rating_type], Object); // Rating type needs to be valid!
  if (!self.status.online) {
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start game",
      "User starting game is not logged on"
    );
  }

  if (!!color && color !== "white" && color !== "black")
    throw new Match.Error("color must be undefined, 'white' or 'black");

  if (!other_user.status.online) {
    ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
    return;
  }

  if (!Users.isAuthorized(self, "play_" + (rated ? "" : "un") + "rated_games")) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_" + (rated ? "" : "UN") + "RATED_GAMES"
    );
    return;
  }

  if (!Users.isAuthorized(other_user, "play_" + (rated ? "" : "un") + "rated_games")) {
    ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
    return;
  }

  if (self.limit_to_group || other_user.limit_to_group) {
    const g1 = self.groups || [];
    const g2 = other_user.groups || [];
    if (!_.intersection(g1, g2).length) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
      return;
    }
  }

  if (
    !DynamicRatings.meetsRatingTypeRules(
      message_identifier,
      "white",
      rating_type,
      white_initial,
      white_increment_or_delay,
      white_increment_or_delay_type,
      rated,
      "start",
      !!color
    )
  ) {
    throw new ICCMeteorError("Unable to start game", "White time/inc/delay fails validation");
  }

  if (
    !DynamicRatings.meetsRatingTypeRules(
      message_identifier,
      "black",
      rating_type,
      black_initial,
      black_increment_or_delay,
      black_increment_or_delay_type,
      rated,
      "start",
      !!color
    )
  ) {
    throw new ICCMeteorError("Unable to start game", "Black time/inc/delay fails validation");
  }

  if (
    GameCollection.find({
      status: "playing",
      $or: [{ "white.id": self._id }, { "black.id": self._id }]
    }).count() !== 0
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  Game.localUnobserveAllGames(message_identifier, self._id);

  const chess = new Chess.Chess();

  const white = determineWhite(self, other_user, color);
  const black = white._id === self._id ? other_user : self;

  const game = {
    starttime: new Date(),
    result: "*",
    fen: chess.fen(),
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
        inc_or_delay: white_increment_or_delay,
        delaytype: white_increment_or_delay_type,
        current: white_initial * 60 * 1000, // milliseconds
        starttime: new Date().getTime()
      },
      black: {
        initial: black_initial,
        inc_or_delay: black_increment_or_delay,
        delaytype: black_increment_or_delay_type,
        current: black_initial * 60 * 1000, //milliseconds
        starttime: 0
      }
    },
    status: "playing",
    actions: [],
    observers: [],
    variations: { hmtb: 0, cmi: 0, movelist: [{}] },
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

  Users.setGameStatus(message_identifier, white, "playing");
  Users.setGameStatus(message_identifier, black, "playing");

  const game_id = GameCollection.insert(game);

  active_games[game_id] = chess;
  startGamePing(game_id);
  startMoveTimer(
    game_id,
    "white",
    (game.clocks.white.inc_or_delay | 0) * 1000,
    game.clocks.white.delaytype,
    game.clocks.white.current
  );

  return game_id;
};

Game.startLocalExaminedGame = function(
  message_identifier,
  white_name,
  black_name,
  wild_number,
  other_headers
) {
  const self = Meteor.user();

  check(self, Object);
  check(message_identifier, String);
  check(white_name, String);
  check(black_name, String);
  check(wild_number, Number);
  check(other_headers, Match.Maybe(Object));

  if (!self.status.online) {
    throw new ICCMeteorError(
      message_identifier,
      "Unable to examine game",
      "User examining game is not logged on"
    );
  }

  if (
    GameCollection.find({
      status: "playing",
      $or: [{ "white.id": self._id }, { "black.id": self._id }]
    }).count() !== 0
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  Game.localUnobserveAllGames(message_identifier, self._id);

  const chess = new Chess.Chess();

  const game = {
    starttime: new Date(),
    result: "*",
    fen: chess.fen(),
    tomove: "white",
    white: {
      name: white_name,
      rating: 1600
    },
    black: {
      name: black_name,
      rating: 1600
    },
    wild: wild_number,
    status: "examining",
    actions: [],
    observers: [{ id: self._id, username: self.username }],
    examiners: [{ id: self._id, username: self.username }],
    variations: { hmtb: 0, cmi: 0, movelist: [{}] }
  };

  if (!!other_headers) game.tags = other_headers;
  const game_id = GameCollection.insert(game);
  active_games[game_id] = chess;
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
    "profile.legacy.username": whitename,
    "profile.legacy.validated": true
  });

  const blackuser = Meteor.users.findOne({
    "profile.legacy.username": blackname,
    "profile.legacy.validated": true
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

  if (!self.status.online)
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

  if (
    !!whiteuser &&
    !!blackuser &&
    LegacyUser.isLoggedOn(whiteuser) &&
    LegacyUser.isLoggedOn(blackuser)
  )
    throw new ICCMeteorError(
      message_identifier,
      "Unable to start game",
      "Both players are logged on locally. Begin a local game"
    );

  if (
    GameCollection.find({
      status: "playing",
      $or: [{ "white.id": self._id }, { "black.id": self._id }]
    }).count() !== 0
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  Game.localUnobserveAllGames(message_identifier, self._id);

  const game = {
    starttime: new Date(),
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tomove: "white",
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
        inc_or_delay: white_increment,
        delaytype: "inc",
        current: white_initial * 60 * 1000,
        starttime: 0
      },
      black: {
        initial: black_initial,
        inc_or_delay: black_increment,
        delaytype: "inc",
        current: black_initial * 60 * 1000,
        starttime: 0
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
    actions: [],
    variations: { hmtb: 0, cmi: 0, movelist: [{}] },
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

  game.examiners = [];
  if (!!whiteuser) {
    game.white.id = whiteuser._id;
    if (!played_game) game.examiners.push({ id: whiteuser._id, username: whiteuser.username });
  }
  if (!!blackuser) {
    game.black.id = blackuser._id;
    if (!played_game) game.examiners.push({ id: blackuser._id, username: blackuser.username });
  }

  if (!!whiteuser) Users.setGameStatus(message_identifier, whiteuser, "playing");
  if (!!blackuser) Users.setGameStatus(message_identifier, blackuser, "playing");

  return GameCollection.insert(game);
};

Game.saveLegacyMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, Number);
  check(move, String);

  const self = Meteor.user();
  check(self, Object);

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

function calculateGameLag(lagobject) {
  let gamelag;
  let totallag = 0;
  const lagvalues = lagobject.pings.slice(-2);
  const now = new Date().getTime();
  if (lagvalues.length) {
    totallag = lagvalues.reduce((total, cur) => total + cur, 0);
    totallag = totallag | 0; // convert double to int
    let lastlag = lagobject.active.reduce((total, cur) => now - cur.originate + total, 0);
    gamelag = (totallag + lastlag) / lagvalues.length;
    if (gamelag > SystemConfiguration.minimumLag()) gamelag -= SystemConfiguration.minimumLag();
  }
  return gamelag;
}

Game.saveLocalMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;
  const chessObject = active_games[game_id];
  const variation = game.variations;

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
  } else if (game.examiners.map(e => e.id).indexOf(self._id) === -1) {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
    return;
  }

  log.debug(
    "Trying to make move " +
      move +
      " for user " +
      self._id +
      ", username=" +
      self.username +
      ", white=" +
      game.white.id +
      "," +
      game.white.name +
      ", black=" +
      game.black.id +
      "," +
      game.black.name
  );
  const result = chessObject.move(move);
  if (!result) {
    ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "ILLEGAL_MOVE", [move]);
    return;
  }

  endMoveTimer(game_id);

  const setobject = { fen: chessObject.fen() };

  const unsetobject = {};
  let gamelag = 0;
  let gameping = 0;
  const bw = self._id === game.white.id ? "white" : "black";
  const otherbw = bw === "white" ? "black" : "white";
  const analyze = addMoveToMoveList(
    variation,
    move,
    game.status === "playing" ? game.clocks[bw].current : null
  );

  if (game.status === "playing") {
    if (active_games[game_id].in_draw() && !active_games[game_id].in_threefold_repetition()) {
      setobject.result = "1/2-1/2";
    } else if (active_games[game_id].in_checkmate()) {
      setobject.result = active_games[game_id].turn() === "w" ? "0-1" : "1-0";
    }

    if (!!setobject.result) {
      setobject.status = "examining";
      setobject.examining = [game.white.id, game.black.id];
      unsetobject.pending = "";
    } else {
      setobject["pending." + otherbw + ".draw"] = "0";
      setobject["pending." + otherbw + ".abort"] = "0";
      setobject["pending." + otherbw + ".adjourn"] = "0";
      setobject["pending." + otherbw + ".takeback.number"] = 0;
      setobject["pending." + otherbw + ".takeback.mid"] = "0";
      // If user made an even-number takeback request, that means they are requesting that they take take
      // their own previous move(s), making it their move. If they do this, and then move, we revoke the
      // takeback request.
      // However, if they make an odd-number takeback request, they are requesting to take back their
      // opponents move. In this case, if they then make a move, we increment the half moves so that if
      // their opponent acccepts, it takes back their last move(s) and continues.
      if (game.pending[bw].takeback.number && game.pending[bw].takeback.number % 2 === 0) {
        setobject["pending." + bw + ".takeback.number"] = 0;
        setobject["pending." + bw + ".takeback.mid"] = "0";
        game.variations.hmtb = 0;
      } else if (game.variations.hmtb) setobject.variations = { hmtb: game.variations.hmtb + 1 };
    }

    if (!setobject.result) {
      const timenow = new Date().getTime();
      gamelag = calculateGameLag(game.lag[bw]) | 0;
      gameping = game.lag[bw].pings.slice(-1) | 0;
      log.debug("timenow=" + timenow + ", gamelag=" + gamelag + ", gameping=" + gameping);
      log.trace("lag=", game.lag);

      let used = timenow - game.clocks[bw].starttime + gamelag;
      let addback = 0;

      if (game.clocks[bw].delaytype !== "none") {
        if (game.clocks[bw].delaytype === "inc") {
          addback = game.clocks[bw].inc_or_delay * 1000;
        } else if (game.clocks[bw].inc_or_delay * 1000 >= used) {
          addback = used;
        } else if (game.clocks[bw].inc_or_delay * 1000 < used) {
          addback = game.clocks[bw].inc_or_delay * 1000;
        }
      }

      //
      // Add the expected lag to the oppnents clock for the receiving of this move
      //
      let opponentlag = calculateGameLag(game.lag[otherbw]) | 0;
      if (!opponentlag) opponentlag = Timestamp.averageLag(game[otherbw].id) | 0;
      if (!opponentlag) opponentlag = 0;

      log.debug("used=" + used + ", addback=" + addback);
      if (used <= SystemConfiguration.minimumMoveTime())
        used = SystemConfiguration.minimumMoveTime();
      log.debug("used=" + used);
      setobject["clocks." + bw + ".current"] = game.clocks[bw].current - used + addback;
      // TODO: check for current <= 0 and end the game, yes?
      setobject["clocks." + otherbw + ".current"] = game.clocks[otherbw].current + opponentlag;
    } else {
      endGamePing(game_id);
    }
  }

  log.debug("final gamelag=" + gamelag + ", gameping=" + gameping);
  const move_parameter =
    game.status === "playing"
      ? {
          move: move,
          lag: Timestamp.averageLag(self._id),
          ping: Timestamp.pingTime(self._id),
          gamelag: gamelag,
          gameping: gameping
        }
      : move;

  const pushobject = {
    actions: { type: "move", issuer: self._id, parameter: move_parameter }
  };
  setobject.variations = variation;
  setobject.tomove = otherbw;
  setobject["clocks." + otherbw + ".starttime"] = new Date().getTime();

  if (setobject.result) {
    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");
    GameHistory.savePlayedGame(message_identifier, game_id);
  }

  GameCollection.update(
    { _id: game_id, status: game.status },
    { $unset: unsetobject, $set: setobject, $push: pushobject }
  );

  if (analyze) {
    log.debug("Starting getting score for game " + game_id + " fen " + active_games[game_id].fen());
    UCI.getScoreForFen(active_games[game_id].fen())
      .then(score => {
        log.debug("Score for game " + game_id + " is " + score);
        const setobject = {};
        setobject["variations.movelist." + (variation.movelist.length - 1) + ".score"] = score;
        const result = GameCollection.update(
          { _id: game_id, status: game.status },
          { $set: setobject }
        );
        if (!result && game.status === "playing") {
          const result2 = GameCollection.update(
            { _id: game_id, status: "examining" },
            { $set: setobject }
          );
          if (!result2) log.error("Unable to update computer score");
        }
      })
      .catch(error => {
        log.error("Error setting score for game move", error);
      });
  }

  if (game.status === "playing")
    startMoveTimer(
      game_id,
      otherbw,
      (game.clocks[otherbw].inc_or_delay | 0) * 1000,
      game.clocks[otherbw].delaytype,
      game.clocks[otherbw].current
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
    throw new ICCMeteorError(message_identifier, "Unable to end game", "Game is not being played");
  if (become_examined) {
    const examiners = [];
    if (game.white.id) {
      examiners.push({ id: game.white.id, username: game.white.name });
      Users.setGameStatus(message_identifier, game.white.id, "examining");
    }
    if (game.black.id) {
      examiners.push({ id: game.black.id, username: game.black.name });
      Users.setGameStatus(message_identifier, game.black.id, "examining");
    }
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
  } else {
    if (game.white.id) Users.setGameStatus(message_identifier, game.white.id, "none");
    if (game.black.id) Users.setGameStatus(message_identifier, game.black.id, "none");
    GameCollection.remove({ _id: game._id });
  }
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

  if (!game.examiners || game.examiners.map(e => e.id).indexOf(self._id) === -1)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove examiner",
      "Issuer is not an examiner"
    );

  if (!game.examiners || game.examiners.map(e => e.id).indexOf(id_to_remove) === -1) {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
    return;
  }

  Users.setGameStatus(message_identifier, id_to_remove, "observing");

  GameCollection.update(
    { _id: game_id, status: "examining" },
    { $pull: { examiners: { id: id_to_remove } } }
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

  if (!game.examiners || game.examiners.map(e => e.id).indexOf(self._id) === -1) {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
    return;
  }

  const observer = game.observers && game.observers.find(o => o.id === id_to_add);
  if (!observer) {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_OBSERVER");
    return;
  }

  if (!!game.examiners && game.examiners.map(e => e.id).indexOf(id_to_add) !== -1) {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "ALREADY_AN_EXAMINER");
    return;
  }

  Users.setGameStatus(message_identifier, id_to_add, "examining");

  GameCollection.update({ _id: game_id, status: "examining" }, { $push: { examiners: observer } });
};

Game.localRemoveObserver = function(message_identifier, game_id, id_to_remove) {
  check(message_identifier, String);
  check(game_id, String);
  check(id_to_remove, String);

  // Since we call this on logout, we have to allow an invalid 'self'
  let self;
  if (message_identifier !== "server") {
    self = Meteor.user();
    check(self, Object);
  }

  const game = GameCollection.findOne({
    _id: game_id
  });

  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove observer",
      "game id does not exist"
    );

  if (!game.observers || game.observers.map(o => o.id).indexOf(id_to_remove) === -1) {
    if (!!self) ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_OBSERVER");
    return;
  }

  if (!!self && id_to_remove !== self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to remove observer",
      "You can only remove yourself"
    );

  Users.setGameStatus(message_identifier, id_to_remove, "none");

  if (!!game.examiners && game.examiners.length === 1 && game.examiners[0].id === id_to_remove) {
    GameCollection.remove({ _id: game_id });
    delete active_games[game_id];
  } else {
    GameCollection.update(
      { _id: game_id, status: game.status },
      { $pull: { examiners: { id: id_to_remove }, observers: { id: id_to_remove } } }
    );
  }
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
  const adding_user = Meteor.users.findOne({ _id: id_to_add });
  if (!adding_user)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add observer",
      "Unable to find user record for ID"
    );
  if (game.legacy_game_number)
    throw new ICCMeteorError(message_identifier, "Unable to add observer", "Game is a legacy game");
  if (self._id !== id_to_add)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add observer",
      "Currently no support for adding another observer"
    );
  Users.setGameStatus(message_identifier, id_to_add, "observing");
  GameCollection.update(
    { _id: game_id, status: game.status },
    { $push: { observers: { id: adding_user._id, username: adding_user.username } } }
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
    throw new ICCMeteorError(message_identifier, "Catastrophe!", "Deleted more than one record!");
};

Game.requestLocalTakeback = function(message_identifier, game_id, number) {
  check(message_identifier, String);
  check(game_id, String);
  check(number, Number);

  if (number < 1) throw new Match.Error("takeback half ply value must be greater than zero");

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  const color = game.white.id === self._id ? "white" : game.black.id === self._id ? "black" : null;

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
    ClientMessages.sendMessageToClient(self, message_identifier, "TAKEBACK_ALREADY_PENDING");
    return;
  }

  const setobject = {};
  setobject["pending." + color + ".takeback.number"] = number;
  setobject["pending." + color + ".takeback.mid"] = message_identifier;
  setobject["variations.hmtb"] = number;

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: setobject,
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
    ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  let tomove = game.tomove;
  let moves = game.moves;
  if (!game.pending[othercolor].takeback.number) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NO_TAKEBACK_PENDING");
    return;
  }

  const variation = game.variations;
  const action = { type: "takeback_accepted", issuer: self._id };
  const clock_reset = {};

  for (let x = 0; x < variation.hmtb; x++) {
    const undone = active_games[game_id].undo();
    const current = variation.movelist[variation.cmi];
    if (undone.san !== current.move)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to takeback",
        "Mismatch between chess object and variation object"
      );

    tomove = tomove === "white" ? "black" : "white";
    clock_reset[tomove] = variation.movelist[variation.cmi].current;
    variation.cmi = variation.movelist[variation.cmi].prev;
  }

  const setobject = {
    fen: active_games[game_id].fen(),
    tomove: tomove,
    "pending.white.takeback": { number: 0, mid: "0" },
    "pending.black.takeback": { number: 0, mid: "0" },
    "variations.cmi": variation.cmi,
    "clocks.white.current": clock_reset.white,
    "clocks.black.current": clock_reset.black
  };

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: { actions: action },
      $set: setobject
    }
  );

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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  const othercolor = self._id === game.white.id ? "black" : "white";
  if (!game.pending[othercolor].takeback.number) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NO_TAKEBACK_PENDING");
    return;
  }
  const setobject = {};
  setobject["pending." + othercolor + ".takeback"] = { number: 0, mid: "0" };

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: setobject,
      $push: {
        actions: { type: "takeback_declined", issuer: self._id }
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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  if (active_games[game_id].in_threefold_repetition()) {
    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");
    GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: {
          actions: { type: "draw", issuer: self._id },
          observers: {
            $each: [
              { id: game.white.id, username: game.white.name },
              { id: game.black.id, username: game.black.name }
            ]
          }
        },
        $unset: { pending: "" },
        $set: {
          status: "examining",
          result: "1/2-1/2",
          examiners: [
            { id: game.white.id, username: game.white.name },
            { id: game.black.id, username: game.black.name }
          ]
        }
      }
    );
    GameHistory.savePlayedGame(message_identifier, game_id);
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].draw !== "0") {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "DRAW_ALREADY_PENDING");
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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].abort !== "0") {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "ABORT_ALREADY_PENDING");
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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  const color = self._id === game.white.id ? "white" : "black";

  if (game.pending[color].adjourn !== "0") {
    ClientMessages.sendMessageToClient(self._id, message_identifier, "ADJOURN_ALREADY_PENDING");
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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  endGamePing(game_id);
  endMoveTimer(game_id);

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "1/2-1-2",
        examiners: [
          { id: game.white.id, username: game.white.name },
          { id: game.black.id, username: game.black.name }
        ]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "draw_accepted",
          issuer: self._id
        },
        observers: {
          $each: [
            { id: game.white.id, username: game.white.name },
            { id: game.black.id, username: game.black.name }
          ]
        }
      }
    }
  );
  Users.setGameStatus(message_identifier, game.white.id, "examining");
  Users.setGameStatus(message_identifier, game.black.id, "examining");
  GameHistory.savePlayedGame(message_identifier, game_id);

  const othercolor = self._id === game.white.id ? "black" : "white";
  const otheruser = self._id === game.white.id ? game.black.id : game.white.id;
  ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].draw, "DRAW_ACCEPTED");
};

Game.acceptLocalAbort = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  endGamePing(game_id);
  endMoveTimer(game_id);

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "aborted",
        examiners: [
          { id: game.white.id, username: game.white.name },
          { id: game.black.id, username: game.black.name }
        ]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "abort_accepted",
          issuer: self._id
        },
        observers: {
          $each: [
            { id: game.white.id, username: game.white.name },
            { id: game.black.id, username: game.black.name }
          ]
        }
      }
    }
  );

  const othercolor = self._id === game.white.id ? "black" : "white";
  const otheruser = self._id === game.white.id ? game.black.id : game.white.id;
  Users.setGameStatus(message_identifier, game.white.id, "examining");
  Users.setGameStatus(message_identifier, game.black.id, "examining");
  GameHistory.savePlayedGame(message_identifier, game_id);
  ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].abort, "ABORT_ACCEPTED");
};

Game.acceptLocalAdjourn = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  endGamePing(game_id);
  endMoveTimer(game_id);

  Users.setGameStatus(message_identifier, game.white.id, "examining");
  Users.setGameStatus(message_identifier, game.black.id, "examining");

  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $set: {
        status: "examining",
        result: "adjourned",
        examiners: [
          { id: game.white.id, username: game.white.name },
          { id: game.black.id, username: game.black.name }
        ]
      },
      $unset: { pending: "" },
      $push: {
        actions: {
          type: "adjourn_accepted",
          issuer: self._id
        },
        observers: {
          $each: [
            { id: game.white.id, username: game.white.name },
            { id: game.black.id, username: game.black.name }
          ]
        }
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

Game.drawCircle = function(message_identifier, game_id, square, color, size) {
  check(message_identifier, String);
  check(square, String);
  check(color, String);
  check(size, Number);
  const self = Meteor.user();
  check(self, Object);

  if (!Game.isSquareValid(square)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_SQUARE", square);
    return;
  }
  const game = GameCollection.findOne({ _id: game_id });
  if (!game) {
    throw new ICCMeteorError(message_identifier, "Unable to draw circle", "Game doesn't exist");
  }
  if (game.status !== "examining") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  } else if (!game.examiners.includes(self._id)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  }
  const resultFind = game.circles.find(circle => circle.square === square);
  if (resultFind) {
    resultFind.color = color;
    resultFind.size = size;
  } else {
    game.circles.push({ square: square, color: color, size: size });
  }
  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $set: { circles: game.circles },
      $push: {
        actions: {
          type: "draw_circle",
          issuer: self._id,
          parameter: { square: square, color: color, size: size }
        }
      }
    }
  );
};
Game.removeCircle = function(message_identifier, game_id, square) {
  check(message_identifier, String);
  check(square, String);
  const self = Meteor.user();
  check(self, Object);

  if (!Game.isSquareValid(square)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_SQUARE", square);
    return;
  }
  const game = GameCollection.findOne({ _id: game_id });
  if (!game) {
    throw new ICCMeteorError(message_identifier, "Unable to remove circle", "Game doesn't exist");
  }
  if (game.status !== "examining") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  } else if (!game.examiners.includes(self._id)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  }

  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $push: {
        actions: { type: "remove_circle", issuer: self._id, parameter: { square: square } }
      },
      $pull: { circles: { square: square } }
    }
  );
  return;
};

Game.drawArrow = function(message_identifier, game_id, from, to, color, size) {
  check(message_identifier, String);
  check(from, String);
  check(to, String);
  check(color, String);
  check(size, Number);
  const self = Meteor.user();
  check(self, Object);

  if (!Game.isSquareValid(from) || !Game.isSquareValid(to)) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "INVALID_SQUARE",
      from + " to " + to
    );
    return;
  }
  const game = GameCollection.findOne({ _id: game_id });
  if (!game) {
    throw new ICCMeteorError(message_identifier, "Unable to draw arrow", "Game doesn't exist");
  }
  if (game.status !== "examining") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  } else if (!game.examiners.includes(self._id)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  }
  const resultFind = game.arrows.find(arrow => arrow.from === from && arrow.to === to);
  if (resultFind) {
    resultFind.color = color;
    resultFind.size = size;
  } else {
    game.arrows.push({ from: from, to: to, color: color, size: size });
  }
  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $set: { arrows: game.arrows },
      $push: {
        actions: {
          type: "draw_arrow",
          issuer: self._id,
          parameter: { from: from, to: to, color: color, size: size }
        }
      }
    }
  );
};
Game.removeArrow = function(message_identifier, game_id, from, to) {
  check(message_identifier, String);
  check(from, String);
  check(to, String);
  const self = Meteor.user();
  check(self, Object);

  if (!Game.isSquareValid(from) || !Game.isSquareValid(to)) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "INVALID_SQUARE",
      from + " to " + to
    );
    return;
  }
  const game = GameCollection.findOne({ _id: game_id });
  if (!game) {
    throw new ICCMeteorError(message_identifier, "Unable to remove circle", "Game doesn't exist");
  }
  if (game.status !== "examining") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  } else if (
    !GameCollection.findOne({ _id: game_id, status: "examining" }).examiners.includes(self._id)
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  }
  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $pull: {
        arrow: { from: from, to: to },
        $push: {
          actions: { type: "remove_arrow", issuer: self._id, parameter: { from: from, to: to } }
        }
      }
    }
  );
  return;
};

Game.isSquareValid = function(square) {
  check(square, String);
  return !(square[0] < "a" || square[0] > "h" || square[1] < "1" || square[1] > "8");
};

Game.declineLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
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

  ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].draw, "DRAW_DECLINED");
};

Game.declineLocalAbort = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
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

  ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].abort, "ABORT_DECLINED");
};

Game.declineLocalAdjourn = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(game_id, String);
  const self = Meteor.user();
  const game = getAndCheck(message_identifier, game_id);

  if (!game) return;

  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
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
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
    return;
  }

  endGamePing(game_id);
  endMoveTimer(game_id);

  const result = self._id === game.white.id ? "0-1" : "1-0";
  GameCollection.update(
    { _id: game_id, status: "playing" },
    {
      $push: {
        actions: { type: "resign", issuer: self._id },
        observers: {
          $each: [
            { id: game.white.id, username: game.white.name },
            { id: game.black.id, username: game.black.name }
          ]
        }
      },
      $unset: { pending: "" },
      $set: {
        status: "examining",
        examiners: [
          { id: game.white.id, username: game.white.name },
          { id: game.black.id, username: game.black.name }
        ],
        result: result
      }
    }
  );
  Users.setGameStatus(message_identifier, game.white.id, "examining");
  Users.setGameStatus(message_identifier, game.black.id, "examining");
  GameHistory.savePlayedGame(message_identifier, game_id);
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

// Game.isPlayingGame = function(user_or_id) {
//   check(user_or_id, Match.OneOf(Object, String));
//   const id = typeof user_or_id === "object" ? user_or_id._id : user_or_id;
//   return (
//     GameCollection.find({
//       $and: [{ status: "playing" }, { $or: [{ "white.id": id }, { "black.id": id }] }]
//     }).count() !== 0
//   );
// };

Game.moveForward = function(message_identifier, game_id, move_count, variation_index) {
  const movecount = move_count || 1;
  check(game_id, String);
  check(movecount, Number);
  check(variation_index, Match.Maybe(Number));

  const self = Meteor.user();
  check(self, Object);

  let vi = variation_index;
  const game = GameCollection.findOne({
    _id: game_id,
    status: "examining",
    "examiners.id": self._id
  });
  if (!game) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
    return;
  }

  if (!active_games[game_id])
    throw new ICCMeteorError(
      message_identifier,
      "Unable to move forward",
      "Unable to find active game"
    );

  const chessObject = active_games[game_id];
  const variation = game.variations;

  for (let x = 0; x < move_count; x++) {
    const move = variation.movelist[variation.cmi];
    if (!move.variations || !move.variations.length) {
      ClientMessages.sendMessageToClient(self, message_identifier, "END_OF_GAME");
      return;
    } else if (move.variations.length === 1 && !!vi) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_VARIATION");
      break;
    } else if (
      move.variations.length > 1 &&
      (vi === undefined || vi === null || vi >= move.variations.length)
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "VARIATION_REQUIRED");
      break;
    } else {
      variation.cmi = variation.movelist[variation.cmi].variations[vi || 0];
      const forwardmove = variation.movelist[variation.cmi];
      const result = chessObject.move(forwardmove.move);
      if (!result)
        throw new ICCMeteorError(
          message_identifier,
          "Unable to movr forward",
          "Somehow we have an illegal move in the variation tree"
        );
    }
    vi = undefined;
  }

  // TODO: We had to update the fen, so now we are here.
  //       But, the actual forward move count is incorrect! We need to do what?
  //       Either record the requested AND actual move count, or
  //       just record the actual, throwing away the requested move count.
  //       OR, figure out how to undo what was done to the chess object
  //       and the variations.cmi
  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $set: { "variations.cmi": variation.cmi, fen: chessObject.fen() },
      $push: {
        actions: {
          type: "move_forward",
          issuer: self._id,
          parameter: { movecount: movecount, variation: variation_index }
        }
      }
    }
  );
};

Game.moveBackward = function(message_identifier, game_id, move_count) {
  check(message_identifier, String);
  check(game_id, String);
  check(move_count, Match.Maybe(Number));

  const movecount = move_count || 1;
  check(game_id, String);
  check(movecount, Number);

  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({
    _id: game_id,
    status: "examining",
    "examiners.id": self._id
  });
  if (!game) {
    ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
  }

  if (!active_games[game_id])
    throw new ICCMeteorError(
      message_identifier,
      "Unable to move backwards",
      "Unable to find active game"
    );

  if (movecount > active_games[game_id].history().length) {
    ClientMessages.sendMessageToClient(self, message_identifier, "BEGINNING_OF_GAME");
    return;
  }

  const variation = game.variations;

  for (let x = 0; x < movecount; x++) {
    const undone = active_games[game_id].undo();
    const current = variation.movelist[variation.cmi];
    if (undone.san !== current.move)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to move backward",
        "Mismatch between chess object and variation object"
      );
    variation.cmi = variation.movelist[variation.cmi].prev;
  }

  GameCollection.update(
    { _id: game_id, status: "examining" },
    {
      $set: {
        "variations.cmi": variation.cmi,
        fen: active_games[game_id].fen()
      },
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

Game.localUnobserveAllGames = function(message_identifier, user_id) {
  check(message_identifier, String);
  check(user_id, String);
  GameCollection.find({ "observers.id": user_id }, { _id: 1 })
    .fetch()
    .forEach(game => Game.localRemoveObserver("server", game._id, user_id));
};

export const GameHistory = {};

const GameHistoryCollection = new Mongo.Collection("game_history");
GameHistoryCollection.attachSchema(GameHistorySchema);

GameHistory.savePlayedGame = function(message_identifier, game_id) {
  const self = Meteor.user();
  check(message_identifier, String);
  check(game_id, String);
  check(self, Object);
  const game = GameCollection.findOne({ _id: game_id });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to save game to game history",
      "Unable to find game to save"
    );
  return GameHistoryCollection.insert(game);
};

GameHistory.examineGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const hist = GameHistoryCollection.findOne({ _id: game_id });
  if (!hist)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to examine saved game",
      "Unable to find game"
    );

  if (
    GameCollection.find({
      status: "playing",
      $or: [{ "white.id": self._id }, { "black.id": self._id }]
    }).count() !== 0
  ) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  Game.localUnobserveAllGames(message_identifier, self._id);

  const chess = new Chess.Chess();
  if (hist.tags && hist.tags.FEN) {
    hist.fen = hist.tags.FEN;
    if (!chess.loadfen(hist.tags.FEN))
      throw new ICCMeteorError(
        message_identifier,
        "Unable to examine saved game",
        "FEN string is invalid"
      );
  } else {
    hist.fen = chess.fen();
  }

  delete hist._id;
  hist.tomove = chess.turn() === "w" ? "white" : "black";
  hist.status = "examining";
  hist.observers = [{ id: self._id, username: self.username }];
  hist.examiners = [{ id: self._id, username: self.username }];
  hist.variations.cmi = 0;
  const examined_id = GameCollection.insert(hist);
  active_games[examined_id] = chess;
  return examined_id;
};

GameHistory.search = function(message_identifier, search_parameters, offset, count) {
  const self = Meteor.user();
  check(self, Object);
  check(search_parameters, Object);
  check(offset, Number);
  check(count, Number);
  if (!Users.isAuthorized(self, "search_game_history"))
    throw new ICCMeteorError(message_identifier, "Unable to search games", "User not authorized");
  if (count > SystemConfiguration.maximumGameHistorySearchCount())
    count = SystemConfiguration.maximumGameHistorySearchCount();
  return GameHistoryCollection.find(search_parameters, { skip: offset, limit: count });
};

Game.kibitz = function(game_id, text) {};

Game.whisper = function(game_id, text) {};

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
    idx === undefined ||
    idx === null ||
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
    else string = " ";
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
      addmove(next_move_number, false, next_white_to_move, movelist, movelist[idx].variations[x]) +
      ") ";
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
  return addmove(1, false, true, movelist, 0);
}

function addMoveToMoveList(variation_object, move, current) {
  const exists = findVariation(move, variation_object.cmi, variation_object.movelist);

  if (exists) {
    variation_object.cmi = exists;
  } else {
    const newi = variation_object.movelist.length;
    variation_object.movelist.push({
      move: move,
      prev: variation_object.cmi,
      current: current
    });

    if (!variation_object.movelist[variation_object.cmi].variations) {
      variation_object.movelist[variation_object.cmi].variations = [newi];
    } else {
      variation_object.movelist[variation_object.cmi].variations.push(newi);
    }
    variation_object.cmi = newi;
  }
  return !exists;
}

function startGamePing(game_id) {
  _startGamePing(game_id, "white");
  _startGamePing(game_id, "black");
}

function _startGamePing(game_id, color) {
  if (!game_pings[game_id]) game_pings[game_id] = {};
  game_pings[game_id][color] = new TimestampServer(
    "server game",
    (key, msg) => {
      if (key === "ping") {
        const pushobject = {};
        pushobject["lag." + color + ".active"] = msg;
        GameCollection.update({ _id: game_id, status: "playing" }, { $push: pushobject });
      } else {
        //pingresult
        const game = GameCollection.findOne({
          _id: game_id,
          status: "playing"
        });
        if (!game) throw new Meteor.Error("Unable to set ping information", "game not found");

        const item = game.lag[color].active.filter(ping => ping.id === msg.id);
        if (!item || item.length !== 1)
          throw new Meteor.Error(
            "Unable to set ping information",
            "cannot find ping id in array of active pings"
          );

        const pushobject = {};
        const pullobject = {};

        pullobject["lag." + color + ".active"] = item[0];
        pushobject["lag." + color + ".pings"] = msg.delay;

        GameCollection.update(
          { _id: game._id, status: game.status },
          { $pull: pullobject, $push: pushobject }
        );
      }
    },
    () => {}
  );
}

function endGamePing(game_id) {
  if (!game_pings[game_id])
    throw new Meteor.Error("Unable to update game ping", "Unable to locate game to ping");
  game_pings[game_id]["white"].end();
  game_pings[game_id]["black"].end();
  delete game_pings[game_id];
}

//
// This is for simple US delay and not Bronstein delay
// In US delay, we delay countdown for the delay
// In Bronstein delay, we count down, but then add the delay back in when they make their move
//
function startDelayTimer(game_id, color, delay_milliseconds, actual_milliseconds) {
  if (!!move_timers[game_id]) Meteor.clearInterval(move_timers[game_id]);

  move_timers[game_id] = Meteor.setInterval(() => {
    Meteor.clearInterval(move_timers[game_id]);
    delete move_timers[game_id];
    startMoveTimer(game_id, color, 0, "", actual_milliseconds);
  }, delay_milliseconds);
}

function startMoveTimer(game_id, color, delay_milliseconds, delaytype, actual_milliseconds) {
  if (!!move_timers[game_id]) Meteor.clearInterval(move_timers[game_id]);

  if (delay_milliseconds && delaytype === "us") {
    startDelayTimer(game_id, color, delay_milliseconds, actual_milliseconds);
    return;
  }

  move_timers[game_id] = Meteor.setInterval(() => {
    Meteor.clearInterval(move_timers[game_id]);
    delete move_timers[game_id];
    const game = GameCollection.findOne({ _id: game_id, status: "playing" });
    if (!game) throw new Meteor.Error("Unable to find a game to expire time on");
    const setobject = {};
    const pushobject = {};
    setobject["clocks." + color + ".current"] = 0;
    setobject.result = color === "white" ? "0-1" : "1-0";
    setobject.status = "examining";
    setobject.examiners = [
      { id: game.white.id, username: game.white.name },
      { id: game.black.id, username: game.black.name }
    ];
    pushobject.observers = {
      $each: [
        { id: game.white.id, username: game.white.name },
        { id: game.black.id, username: game.black.name }
      ]
    };
    GameCollection.update(
      { _id: game_id },
      { $set: setobject, $push: pushobject, $unset: { pending: 1 } }
    );
    Users.setGameStatus("server", game.white.id, "examining");
    Users.setGameStatus("server", game.black.id, "examining");
    GameHistory.savePlayedGame("server", game_id);
  }, actual_milliseconds);
}

function endMoveTimer(game_id) {
  const interval_id = move_timers[game_id];
  if (!interval_id) return;
  Meteor.clearInterval(interval_id);
  delete move_timers[game_id];
}

function testingCleanupMoveTimers() {
  Object.keys(move_timers).forEach(game_id => {
    Meteor.clearInterval(move_timers[game_id]);
    delete move_timers[game_id];
  });
}

Meteor.startup(function() {
  GameCollection.remove({});
  Users.addLogoutHook(userId => Game.localUnobserveAllGames("", userId));
});

if (Meteor.isTest || Meteor.isAppTest) {
  Game.collection = GameCollection;
  GameHistory.collection = GameHistoryCollection;
  Game.addMoveToMoveList = addMoveToMoveList;
  Game.buildPgnFromMovelist = buildPgnFromMovelist;
  Game.calculateGameLag = calculateGameLag;
  Game.testingCleanupMoveTimers = testingCleanupMoveTimers;
}

Meteor.methods({
  gamepong(game_id, pong) {
    const user = Meteor.user();
    check(game_id, String);
    check(pong, Object);
    check(user, Object);
    if (!game_pings[game_id])
      throw new Meteor.Error("Unable to update game ping", "Unable to locate game to ping");
    const game = GameCollection.findOne(
      { _id: game_id, status: "playing" },
      { fields: { "white.id": 1 } }
    );
    if (!game)
      throw new Meteor.Error("Unable to update game ping", "Unable to locate game to ping");
    const color = game.white.id === user._id ? "white" : "black";
    game_pings[game_id][color].pongArrived(pong);
  },
  addGameMove: Game.saveLocalMove,
  requestTakeback: Game.requestLocalTakeback,
  acceptTakeBack: Game.acceptLocalTakeback,
  declineTakeback: Game.declineLocalTakeback,
  resignGame: Game.resignLocalGame,
  requestToDraw: Game.requestLocalDraw,
  acceptDraw: Game.acceptLocalDraw,
  declineDraw: Game.declineLocalDraw,
  requestToAbort: Game.requestLocalAbort,
  acceptAbort: Game.acceptLocalAbort,
  declineAbort: Game.declineLocalAbort,
  requestToAdjourn: Game.requestLocalAdjourn,
  acceptAdjourn: Game.acceptLocalAdjourn,
  declineAdjourn: Game.declineLocalAdjourn,
  searchGameHistory: GameHistory.search,
  drawCircle: Game.drawCircle,
  removeCircle: Game.removeCircle,
  startLocalExaminedGame: Game.startLocalExaminedGame,
  moveBackword: Game.moveBackward,
  moveForward: Game.moveForward,
  examineGame: GameHistory.examineGame
});

Meteor.publish("playing_games", function() {
  log.debug("Playing games method called for " + this.userId);
  return GameCollection.find(
    {
      $and: [
        { status: "playing" },
        { $or: [{ "white.id": this.userId }, { "black.id": this.userId }] }
      ]
    },
    { fields: { "variations.movelist.score": 0, "lag.white.pings": 0, "lag.black.pings": 0 } }
  );
});
Meteor.publish("observing_games", function() {
  return GameCollection.find({
    "observers.id": this.userId
  });
});
