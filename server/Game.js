import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};

function examinerCheck() {
  //
  // Basically, this says:
  // If status=playing, examiners has to not exist or be empty
  // Otherwise, examiners has to exist and not be empty
  //
  const examiners = this.field("examiners");
  const status = this.field("status");
  const nope = [
    {
      name: "examiners",
      type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
      value: examiners.value
    }
  ];
  if (!status.isSet) return; // We'll let somebody else complain about this.
  if (status.value === "playing") {
    if (!examiners.isSet) return;
    if (!examiners.value.length) return;
    return nope;
  } else {
    if (examiners.isSet && examiners.value.length > 0) return;
    return nope;
  }
}

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
  rated: {
    type: Boolean,
    required: false,
    custom() {
      if (this.field("status").value === "examining") return;
      if (!this.field("rated").isSet)
        return [{ name: "rated", type: SimpleSchema.ErrorTypes.REQUIRED }];
    }
  },
  status: String,
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: {
        type: SimpleSchema.Integer,
        required: false,
        custom() {
          if (this.field("status").value === "examining") return;
          if (!this.field("clocks.white.current").isSet)
            return [
              {
                name: "clocks.white.current",
                type: SimpleSchema.ErrorTypes.REQUIRED
              }
            ];
        }
      }
    }),
    black: new SimpleSchema({
      initial: SimpleSchema.Integer,
      inc: Number,
      current: {
        type: SimpleSchema.Integer,
        required: false,
        custom() {
          if (this.field("status").value === "examining") return;
          if (!this.field("clocks.black.current").isSet)
            return [
              {
                name: "clocks.black.current",
                type: SimpleSchema.ErrorTypes.REQUIRED
              }
            ];
        }
      }
    })
  }),
  white: new SimpleSchema({
    name: String,
    id: {
      type: String,
      required: false,
      custom() {
        let set = 0;
        if (this.field("status").value === "examining") return;
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
        if (this.field("status").value === "examining") return;
        if (this.field("white.id").isSet) set += 4;
        if (this.field("black.id").isSet) set += 2;
        if (this.field("legacy_game_number").isSet) set += 1;
        if (set === 5 || set === 3 || set === 6 || set === 7) return;
        return [{ name: "black.id", type: SimpleSchema.ErrorTypes.REQUIRED }];
      }
    },
    rating: SimpleSchema.Integer
  }),
  tags: { type: Object, required: false },
  actions: [actionSchema],
  examiners: { type: Array, required: false, custom: examinerCheck },
  "examiners.$": String,
  observers: { type: Array, defaultValue: [] },
  "observers.$": String
});
GameCollection.attachSchema(GameSchema);

function getAndCheck(message_identifier, game_id) {
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
    updateobject["$set"].examining = [game.white.id, game.black.id];
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
  if (become_examined) {
    const examiners = [];
    if (game.white.id) examiners.push(game.white.id);
    if (game.black.id) examiners.push(game.black.id);
    GameCollection.update(
      { _id: game._id },
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
    { _id: game_id },
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

  GameCollection.update({ _id: game_id }, { $push: { examiners: id_to_add } });
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
      { _id: game_id },
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
  GameCollection.update({ _id: game_id }, { $push: { observers: id_to_add } });
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
        $push: {
          actions: { type: "draw", issuer: self._id },
          observers: { $each: [game.white.id, game.black.id] }
        },
        $set: {
          status: "examining",
          result: "1/2-1/2",
          examiners: [game.white.id, game.black.id]
        }
      }
    );
    return;
  }
  GameCollection.update(
    { _id: game_id },
    { $push: { actions: { type: "draw_requested", issuer: self._id } } }
  );
};

Game.acceptLocalDraw = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self);
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
      $set: { examiners: [game.white.id, game.black.id] },
      $push: {
        actions: {
          type: "draw_accepted",
          issuer: self._id
        },
        observers: { $each: [game.white.id, game.black.id] }
      }
    }
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
      $push: {
        actions: { type: "resign", issuer: self._id },
        observers: { $each: [game.white.id, game.black.id] }
      },
      $set: { status: "examining", examiners: [game.white.id, game.black.id] }
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
