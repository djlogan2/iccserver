import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { Match, check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Logger } from "../lib/server/Logger";
import { LegacyUser } from "./LegacyUser";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";

export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};

const actionSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ["move", "takeBack", "draw", "resign", "abort", "game"]
  },
  value: String,
  actionBy: String
});

const GameSchema = new SimpleSchema({
  startTime: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  requestBy: { type: String, required: false }, // TODO: This is ok, yes? I'm not sure why it wouldn't be.
  legacy_game_id: { type: Number, required: false },
  wild: { type: Number, required: false },
  rating_type: { type: String, required: false },
  rated: { type: String, required: false },
  status: String,
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      time: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    }),
    black: new SimpleSchema({
      time: SimpleSchema.Integer,
      inc: Number,
      current: SimpleSchema.Integer
    })
  }),
  white: new SimpleSchema({
    name: String,
    userid: { type: String, regEx: SimpleSchema.RegEx.Id, required: false },
    rating: SimpleSchema.Integer
  }),
  black: new SimpleSchema({
    name: String,
    userid: { type: String, regEx: SimpleSchema.RegEx.Id, required: false },
    rating: SimpleSchema.Integer
  }),
  moves: [String],
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

  const game = GameCollection.findOne({ _id: game_id });
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to find a game to make a move for"
    );
  if (!self || (self._id !== game.white.id && self._id !== game.black.id))
    throw new ICCMeteorError("server", "Who are we?");

  if (!active_games[game_id])
    throw new ICCMeteorError(
      "server",
      "Unable to find chessboard validator for game"
    );

  if (!must_be_my_turn) return game;

  if (
    (self._id !== active_games[game_id].turn()) === "w"
      ? game.white.id
      : game.black.id
  ) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "COMMAND_INVALID_NOT_YOUR_MOVE"
    );
    return null;
  }

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
  GameCollection.insert(game);
  active_games[game._id] = new Chess();
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
  ex_string,
  white_rating,
  black_rating,
  game_id,
  white_titles,
  black_titles,
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
  check(game_id, Number);
  check(white_titles, Array);
  check(black_titles, Array);
  check(irregular_legality, Match.Maybe(String));
  check(irregular_semantics, Match.Maybe(String));
  check(uses_plunkers, Match.Maybe(String));
  check(fancy_timecontrol, Match.Maybe(String));
  check(promote_to_king, Match.Maybe(String));
  const whiteuser = Meteor.users.findOne({
    "profile.legay.username": whitename
  });
  log.debug(whiteuser);
  const blackuser = Meteor.users.findOne({
    "profile.legay.username": blackname
  });

  const self = Meteor.user();
  if (!self || (self._id !== whiteuser._id && self._id !== blackuser._id))
    throw new ICCMeteorError(message_identifier, "Unable to find user");

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

  if (!!whiteuser) game.white._id = whiteuser._id;
  if (!!blackuser) game.black._id = blackuser._id;

  GameCollection.insert(game);
};

Game.saveLegacyMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);
};

Game.makeMove = function(message_identifier, game_id, move) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);
  const game = getAndCheck(message_identifier, game_id, true);
  if (!game) return;

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to find legacy user for this game"
      );
    lu.move(move);
    return;
  }

  const result = active_games[game_id].move(move);
  if (!result) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      "ILLEGAL_MOVE",
      move
    );
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();

  const updateobject = { $push: { actions: [ms, move] } };
  if (active_games[game_id].in_draw()) {
    updateobject["$set"] = { result: "1/2" };
  } else if (active_games[game_id].in_stalemate()) {
    updateobject["$set"] = { result: "1/2" };
  } else if (active_games[game_id].in_checkmate()) {
    updateobject["$set"] = {
      result: active_games[game_id].turn() === "w" ? "0-1" : "1-0"
    };
  } else if (active_games[game_id].insufficient_material()) {
    updateobject["$set"] = { result: "1/2" };
  }

  if (updateobject["$set"]) {
    delete active_games[game_id];
    updateobject["$set"].status = "examining";
  }

  game.update({ _id: game_id }, updateobject);
};

Game.requestTakeback = function(message_identifier, game_id, number) {
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

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to find legacy user for this game"
      );
    lu.requestTakeback(number);
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();
  Meteor.update({ _id: game_id }, { $push: [ms, { takeback: number }] });
};

Game.acceptTakeback = function(message_identifier, game_id) {
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

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to find legacy user for this game"
      );
    lu.requestTakeback();
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();

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
    { $push: [ms, { accept_takeback: takeback_legal }] }
  );
  for (let x = 0; x < takeback_legal; x++) active_games[game_id].undo();
};

Game.declineTakeback = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  check(move, String);
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

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to find legacy user for this game"
      );
    lu.requestTakeback();
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();

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
    { $push: [ms, { decline_takeback: takeback_legal }] }
  );
};

Game.requestDraw = function(message_identifier, game_id) {
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

  const ms = new Date().getTime() - game.starttime.getTime();

  if (active_games[game_id].in_threefold_repetition()) {
    GameCollection.update(
      { _id: game_id },
      {
        $push: { actions: [ms, { requestdraw: "threefold" }] },
        $set: { status: "examining" }
      }
    );
    return;
  }
  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { requestdraw: 1 }] } }
  );
};

Game.acceptDraw = function(message_identifier, game_id) {
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

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { acceptdraw: 1 }] } }
  );
};

Game.declineDraw = function(message_identifier, game_id) {
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

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { declinedraw: 1 }] } }
  );
};

Game.resignGame = function(message_identifier, game_id) {
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

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { resign: 1 }] }, $set: { status: "examining" } }
  );
};

function determineWhite(p1, p2, color) {
  if (color === "white") return p1;
  if (color === "black") return p2;

  // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
  if (Math.random() <= 0.5) return p1;
  else return p2;
}

Game.offerMoretime = function(message_identifier, game_id, issuer, seconds) {};

Game.declineMoretime = function(message_identifier, game_id) {};

Game.acceptMoretime = function(message_identifier, game_id) {};

Game.moveBackward = function(message_identifier, game_id, issuer, halfmoves) {};

Game.moveForward = function(message_identifier, game_id, issuer, halfmoves) {};

Game.drawCircle = function(message_identifier, game_id, issuer, square) {};

Game.removeCircle = function(message_identifier, game_id, issuer, square) {};

Game.drawArrow = function(message_identifier, game_id, issuer, square) {};

Game.removeArrow = function(message_identifier, game_id, issuer, square) {};

Game.changeHeaders = function(message_identifier, game_id, other_arguments) {};

Game.updateClock = function(
  message_identifier,
  game_id,
  color,
  milliseconds
) {};

Game.addVariation = function(message_identifier, game_id, issuer) {};

Game.deleteVariation = function(message_identifier, game_id, issuer) {};

Game.deleteVariation = function(self, game_id, issuer) {};

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
