import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../lib/server/Logger";
import { LegacyUser } from "./LegacyUser";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};

function parameterCheck() {
  const parameter = this.field("parameter");
  const nope = [
    {
      name: "parameter",
      type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
      value: parameter.value
    }
  ];

  switch (this.field("type")) {
    case "move":
    case "kibitz":
    case "whisper":
      if (!parameter.isSet || typeof parameter.value !== "string") return nope;
      else return;
    case "takeback_request":
      if (parameter.isSet && parameter.value === parseInt(parameter.value))
        return;
      else return nope;
    default:
      if (parameter.isSet) return nope;
  }
}

const actionSchema = new SimpleSchema({
  // TODO: I don't think we xare going to be able to use new Date() as an autovalue for this. I think we are going
  //       going to have to use some type of normal integer/long (millisecond since start of game or millisecond
  //       since last action) type of thing. Why? Because we are going to have to deal with lag. lag is subtracted
  //       from the users time to take a move. Well, that means we can't use new Date(). We have to save some type
  //       of number that can be adjusted for the current users lag.
  time: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  issuer: String,
  type: {
    type: String,
    allowedValues: [
      "move", // Obviously a normal move
      "kibitz", // A kibitz
      "whisper", // A whisper
      "disconnect", // When a user disconnects during a game
      "connect", // When a user reconnects (TODO: Like anytime? Some type of courtesy wait?")
      "adjourned", // When the game is adjourned, either by accepting, or by a disconnect adjourn
      "resumed", // Obviously, resumed
      "adjourn_requested", // When an adjourn is requested
      "adjourn_declined", // and declined
      "takeback_requested", // etc.
      "takeback_accepted",
      "takeback_declined",
      "draw",
      "draw_requested",
      "draw_accepted",
      "draw_declined",
      "resign",
      "abort_requested",
      "abort_accepted",
      "abort_declined"
    ]
  },
  parameter: {
    type: SimpleSchema.oneOf(String, Number),
    optional: true,
    custom: parameterCheck
  }
});

const GameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  result: String,
  legacy_game_number: {
    type: Number,
    required: false,
    custom() {
      if (
        this.field("legacy_game_number").isSet !==
        this.field("legacy_game_id").isSet
      )
        return [
          {
            name: "legacy_game_number and legacy_game_id",
            type: SimpleSchema.ErrorTypes.REQUIRED
          }
        ];
    }
  },
  legacy_game_id: {
    type: String,
    required: false,
    custom() {
      if (
        this.field("legacy_game_number").isSet !==
        this.field("legacy_game_id").isSet
      )
        return [
          {
            name: "legacy_game_number and legacy_game_id",
            type: SimpleSchema.ErrorTypes.REQUIRED
          }
        ];
    }
  },
  wild: Number,
  rating_type: String,
  rated: Boolean,
  status: String,
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    }),
    black: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    })
  }),
  white: new SimpleSchema({
    name: String,
    id: {
      type: String,
      required: false,
      custom() {
        let set = 0;
        if (this.field("white.id").isSet) set += 4;
        if (this.field("black.id").isSet) set += 2;
        if (this.field("legacy_game_number").isSet) set += 1;
        if (set === 5 || set === 3 || set === 6 || set === 7) return;
        return [{ name: "white.id", type: SimpleSchema.ErrorTypes.REQUIRED }];
      }
    },
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    id: {
      type: String,
      required: false,
      custom() {
        let set = 0;
        if (this.field("white.id").isSet) set += 4;
        if (this.field("black.id").isSet) set += 2;
        if (this.field("legacy_game_number").isSet) set += 1;
        if (set === 5 || set === 3 || set === 6 || set === 7) return;
        return [{ name: "black.id", type: SimpleSchema.ErrorTypes.REQUIRED }];
      }
    },
    rating: SimpleSchema.Integer
  }),
  actions: [actionSchema]
});
GameCollection.attachSchema(GameSchema);

function getLegacyUser(userId) {
  const our_legacy_user = LegacyUser.find(userId);
  if (!our_legacy_user)
    throw new ICCMeteorError(
      "server",
      "Unable to find a legacy user object for " + this.name
    );
  return our_legacy_user;
}

function getAndCheck(message_identifier, game_id, must_be_my_turn) {
  const self = Meteor.user();
  check(self, Object);

  const game = GameCollection.findOne({ _id: game_id });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to find a game to make a move for"
    );
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
  played_game,
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
  check(played_game, Boolean);
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

  if (played_game && !other_user.loggedOn) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_OPPONENT"
    );
    return;
  }

  if (
    played_game &&
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
    played_game &&
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

  if (played_game) {
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
  }

  const white = determineWhite(self, other_user, color);
  const black = white._id === self._id ? other_user : self;

  const game = {
    starttime: new Date(),
    result: "*",
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
    status: played_game ? "playing" : "examining",
    actions: []
  };
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
    actions: []
  };

  if (!!whiteuser) game.white.id = whiteuser._id;
  if (!!blackuser) game.black.id = blackuser._id;

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
    { _id: game._id },
    { $push: { actions: { type: "move", issuer: "legacy", parameter: move } } }
  );
};

Game.saveLocalMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);

  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;

  const chessObject = active_games[game_id];
  const turn_id = chessObject.turn() === "w" ? game.white.id : game.black.id;
  if (self._id !== turn_id) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );
    return;
  }

  const result = chessObject.move(move);
  if (!result) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "ILLEGAL_MOVE",
      move
    );
    return;
  }

  const updateobject = {
    $push: { actions: { type: "move", issuer: self._id, parameter: move } }
  };

  if (
    active_games[game_id].in_draw() &&
    !active_games[game_id].in_threefold_repetition()
  ) {
    updateobject["$set"] = { result: "1/2-1/2" };
  } else if (active_games[game_id].in_stalemate()) {
    updateobject["$set"] = { result: "1/2-1/2" };
  } else if (active_games[game_id].in_checkmate()) {
    updateobject["$set"] = {
      result: active_games[game_id].turn() === "w" ? "0-1" : "1-0"
    };
  } else if (active_games[game_id].insufficient_material()) {
    updateobject["$set"] = { result: "1/2-1/2" };
  }

  if (updateobject["$set"]) {
    updateobject["$set"].status = "examining";
  }

  GameCollection.update({ _id: game_id }, updateobject);
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
  if (become_examined)
    GameCollection.update(
      { _id: game._id },
      { $set: { result: score_string2, status: "examining" } }
    );
  else GameCollection.remove({ _id: game._id });
};

Game.removeLocalGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  GameCollection.remove({ _id: game_id });
  delete active_games[game_id];
};

Game.removeLegacyGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, Number);
  const self = Meteor.user();
  check(self, Object);

  GameCollection.remove({ legacy_game_number: game_id });
};

Game.requestLocalTakeback = function(message_identifier, game_id, number) {
  check(message_identifier, String);
  check(game_id, String);
  check(number, Number);
  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  Meteor.update(
    { _id: game_id },
    {
      $push: {
        actions: {
          type: "takeback_requested",
          issuer: self._id,
          parameters: number
        }
      }
    }
  );
};

Game.acceptLocalTakeback = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  let takeback_legal;
  for (
    let x = game.actions.length - 1;
    takeback_legal !== undefined && x >= 0;
    x--
  ) {
    if (typeof game.actions[x] !== "object") takeback_legal = -1;
    else if (typeof game.actions[x].takeback === "number")
      takeback_legal = game.actions[x].takeback;
  }
  if (takeback_legal === undefined || takeback_legal === -1) {
    ClientMessages.sendMessageToClient(Meteor.user(), "ILLEGAL_TAKEBACK");
    return;
  }
  Meteor.update(
    { _id: game_id },
    { $push: { actions: { type: "takeback_accepted", issuer: self._id } } }
  );
  for (let x = 0; x < takeback_legal; x++) active_games[game_id].undo();
};

Game.declineLocalTakeback = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  let takeback_legal;
  for (
    let x = game.actions.length - 1;
    takeback_legal !== undefined && x >= 0;
    x--
  ) {
    if (typeof game.actions[x] !== "object") takeback_legal = -1;
    else if (typeof game.actions[x].takeback === "number")
      takeback_legal = game.actions[x].takeback;
  }
  if (takeback_legal === undefined || takeback_legal === -1) {
    ClientMessages.sendMessageToClient(Meteor.user(), "ILLEGAL_TAKEBACK");
    return;
  }

  Meteor.update(
    { _id: game_id },
    { $push: { actions: { type: "takeback_declined", issuer: self._id } } }
  );
};

Game.requestLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const game = getAndCheck(message_identifier, game_id);

  if (game.legacy_game_number)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to request draw",
      "Cannot request a local draw on a legacy game"
    );

  if (!game || game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  if (active_games[game_id].in_threefold_repetition()) {
    GameCollection.update(
      { _id: game_id },
      {
        $push: { actions: { type: "draw", issuer: self._id } },
        $set: { status: "examining", result: "1/2-1/2" }
      }
    );
    return;
  }
  GameCollection.update(
    { _id: game_id },
    { $push: { actions: { type: "draw_requested", issuer: self_id } } }
  );
};

Game.acceptLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: { type: "draw_accepted", issuer: self._id } } }
  );
};

Game.declineLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = getAndCheck(message_identifier, game_id);
  if (!game) return;
  if (game.status !== "playing") {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: { type: "decline_draw", issuer: self._id } } }
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
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_PLAYING"
    );
    return;
  }

  GameCollection.update(
    { _id: game_id },
    {
      $push: { actions: { type: "resign", issuer: self._id } },
      $set: { status: "examining" }
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

Meteor.startup(function() {
  GameCollection.remove();
  if (Meteor.isTest || Meteor.isAppTest) {
    Game.collection = GameCollection;
  }
});
