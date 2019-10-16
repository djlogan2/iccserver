import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Logger } from "../lib/server/Logger";
import { LegacyUser } from "./LegacyUser";
import { Meteor } from "meteor/meteor";

export const Game = {};

const GameCollection = new Mongo.Collection("game");

let log = new Logger("server/Game_js");

let active_games = {};

const actionSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ["move", "takeBack", "draw", "resign", "abort", "game"]
  },
  value: { type: String },
  actionBy: { type: String }
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
  status: { type: String },
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      time: { type: SimpleSchema.Integer },
      inc: { type: Number },
      current: { type: SimpleSchema.Integer }
    }),
    black: new SimpleSchema({
      time: { type: SimpleSchema.Integer },
      inc: { type: Number },
      current: { type: SimpleSchema.Integer }
    })
  }),
  white: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id, required: false },
    rating: { type: SimpleSchema.Integer }
  }),
  black: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id, required: false },
    rating: { type: SimpleSchema.Integer }
  }),
  moves: [String],
  actions: [actionSchema]
});
GameCollection.attachSchema(GameSchema);


function getLegacyUser(userId) {
  const our_legacy_user = LegacyUser.find(userId);
  if (!our_legacy_user)
    throw new Meteor.error(
      "Unable to find a legacy user object for " + this.name
    );
  return our_legacy_user;
}

function getAndCheck(self, game_id, must_be_my_turn) {
  const game = GameCollection.findOne({ _id: game_id });
  if (!game) throw new Meteor.Error("Unable to find a game to make a move for");
  if (!self || (self._id !== game.white.id && self._id !== game.black.id))
    throw new Meteor.Error("Who are we?");
  if (!active_games[game_id])
    throw new Meteor.Error("Unable to find chessboard validator for game");

  if (!must_be_my_turn) return game;

  if (
    (self._id !== active_games[game_id].turn()) === "w"
      ? game.white.id
      : game.black.id
  )
    throw new Meteor.Error("Invalid command when its not your turn");

  return game;
}

Game.startLocalGame = function(
  self,
  white,
  black,
  wild_number,
  rating_type,
  rated,
  white_initial,
  white_increment,
  black_initial,
  black_increment,
  played_game /*,
  irregular_legality,
  irregular_semantics,
  uses_plunkers,
  fancy_timecontrol,
  promote_to_king*/
) {
  if (!self || (self._id !== white._id && self._id !== black._id))
    throw new Meteor.Error("Who are we?");
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
  self,
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
  game_id /*,
  white_titles,
  black_titles,
  irregular_legality,
  irregular_semantics,
  uses_plunkers,
  fancy_timecontrol,
  promote_to_king*/
) {
  const whiteuser = Meteor.users.findOne({
    "profile.legay.username": whitename
  });
  const blackuser = Meteor.users.findOne({
    "profile.legay.username": blackname
  });

  if (!self || (self._id !== whiteuser._id && self._id !== blackuser._id))
    throw new Meteor.Error("Who are we?");

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

Game.saveLegacyMove = function(self, game_id, move) {};

Game.makeMove = function(self, game_id, move) {
  const game = getAndCheck(self, game_id, true);

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu) throw new Meteor.Error("Unable to find legacy user for this game");
    lu.move(move);
    return;
  }

  const result = active_games[game_id].move(move);
  if (!result) throw new Meteor.Error("Illegal move"); // I think we need to move this to client_messages

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

Game.requestAction = function(self, game_id, number) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu) throw new Meteor.Error("Unable to find legacy user for this game");
    lu.requestTakeback(number);
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();
  Meteor.update({ _id: game_id }, { $push: [ms, { takeback: number }] });
};

Game.requestTakeback = function(self, game_id, number) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu) throw new Meteor.Error("Unable to find legacy user for this game");
    lu.requestTakeback(number);
    return;
  }

  const ms = new Date().getTime() - game.starttime.getTime();
  Meteor.update({ _id: game_id }, { $push: [ms, { takeback: number }] });
};

Game.acceptTakeback = function(self, game_id) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");
  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu) throw new Meteor.Error("Unable to find legacy user for this game");
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
  if (takeback_legal === undefined || takeback_legal === -1)
    throw new Meteor.Error("Illegal takeback accept"); // TODO: Should probably use client_messaages
  Meteor.update(
    { _id: game_id },
    { $push: [ms, { accept_takeback: takeback_legal }] }
  );
  for (let x = 0; x < takeback_legal; x++) active_games[game_id].undo();
};

Game.declineTakeback = function(self, game_id) {
  //TODO: meteor error? client_messages?
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");
  if (game.legacy_game_number) {
    const lu = getLegacyUser(this._id);
    if (!lu) throw new Meteor.Error("Unable to find legacy user for this game");
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
  if (takeback_legal === undefined || takeback_legal === -1)
    throw new Meteor.Error("Illegal takeback decline"); // TODO: Should probably use client_messaages
  Meteor.update(
    { _id: game_id },
    { $push: [ms, { decline_takeback: takeback_legal }] }
  );
};

Game.requestDraw = function(self, game_id) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

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

Game.acceptDraw = function(self, game_id) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { acceptdraw: 1 }] } }
  );
};

Game.declineDraw = function(self, game_id) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { declinedraw: 1 }] } }
  );
};

Game.resignGame = function(self, game_id) {
  const game = getAndCheck(self, game_id);
  if (game.status !== "playing") throw new Meteor.Error("Must be playing");

  const ms = new Date().getTime() - game.starttime.getTime();

  GameCollection.update(
    { _id: game_id },
    { $push: { actions: [ms, { resign: 1 }] }, $set: { status: "examining" } }
  );
};

Game.determineWhite = function(p1, p2, color) {
  if (color === "white") return p1;
  if (color === "black") return p2;

  // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
  if (Math.random() <= 0.5) return p1;
  else return p2;
};

Game.offerMoretime = function(self, game_id, issuer, seconds) {};

Game.declineMoretime = function(self, game_id) {};

Game.acceptMoretime = function(self, game_id) {};

Game.moveBackward = function(self, game_id, issuer, halfmoves) {};

Game.moveForward = function(self, game_id, issuer, halfmoves) {};

Game.drawCircle = function(self, game_id, issuer, square) {};

Game.removeCircle = function(self, game_id, issuer, square) {};

Game.drawArrow = function(self, game_id, issuer, square) {};

Game.removeArrow = function(self, game_id, issuer, square) {};

Game.changeHeaders = function(self, game_id, other_arguments) {};

Game.updateClock = function(self, game_id, color, milliseconds) {};

Game.addVariation = function(self, game_id, issuer) {};

Game.deleteVariation = function(self, game_id, issuer) {};
