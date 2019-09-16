import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const GameCollection = new Mongo.Collection("game");
let log = new Logger("server/Game_js");

let active_games = {};

// eslint-disable-next-line no-unused-vars
const playerSchema = new SimpleSchema({
  name: { type: String },
  userid: { type: String, regEx: SimpleSchema.RegEx.Id },
  rating: { type: SimpleSchema.Integer }
});

const actionSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ["move", "takeBack", "draw", "resigned", "aborted", "game"]
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
  white: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id },
    rating: { type: SimpleSchema.Integer },
    time: {
      type: SimpleSchema.Integer,
      autoValue: function() {
        return 1000;
      }
    }
  }),
  black: new SimpleSchema({
    name: { type: String },
    userid: { type: String, regEx: SimpleSchema.RegEx.Id },
    rating: { type: SimpleSchema.Integer },
    time: {
      type: SimpleSchema.Integer,
      autoValue: function() {
        return 2000;
      }
    }
  }),
  moves: [String],
  actions: [actionSchema]
});

GameCollection.attachSchema(GameSchema);

function setActiveGame(user_id, game_id) {
  const active = GameCollection.findOne({
    status: "playing",
    $or: [
      { white: { userId: user_id, active: true } },
      { black: { userId: user_id, active: true } }
    ]
  });

  if (active) {
    if (active._id === game_id) return;
    if (active.white.userId === user_id) {
      active.white.active = false;
    } else {
      active.black.active = false;
    }
    GameCollection.update({ _id: active._id }, active);
  }

  const newgame = GameCollection.findOne({ _id: game_id });
  if (!newgame) return;
  if (newgame.white.userId === user_id) {
    newgame.white.active = true;
  } else {
    newgame.black.active = true;
  }
  GameCollection.update({ _id: game_id }, newgame);
}

//
// TODO: Change this to something more descriptive, like "active-games". We will likely be
// publishing a whole bunch of different game sets. Let's make this game set "the set of
// games the user is playing, examining, or observing."
// TODO: Make sure the schema has certain characteristics:
//   (1) A played game cannot be changed by anyone
//   (2) An examined and saved, or uploaded (i.e. non-played) game is owned by a player, and can be modified and deleted
//   (3) We need a list, either in the game object or another schema, of the examiners and observers
// I write some of this here because if we are going to use this as the active game publication,
// we need something like "x is examiner or x is observer or x is player" rather than whatever this is.
//
Meteor.publish("game", function tasksPublication() {
  if (!Meteor.userId()) {
    return [];
  }
  return GameCollection.find({
    $or: [{ "black.name": Meteor.userId() }, { "white.name": Meteor.userId() }]
  });
});

function getOtherUser(name) {
  // TODO: Get user record of other user (remember usernames can be reused)
  // Presumably this will be a mongo find, in another class?
}

function canPlay(rated, us, them) {
  // TODO: Exists, not norated, not tournament game, whatever else makes sense
  // Aren't censoring each other
  // can play rated
  // etc. etc. etc.
  // us and them are both the user records
  return null;
}

function determineWhite(p1, p2, color) {
  if (color === "white") return p1;
  if (color === "black") return p2;

  // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
  if (Math.random() <= 0.5) return p1;
  else return p2;
}

function decline_draw() {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  throw new Meteor.error("Not implemented"); // Have to look for a pending draw in the moves
}

function decline_abort() {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  throw new Meteor.error("Not implemented"); // Have to look for a pending abort in the moves
}

function decline_adjourn() {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  throw new Meteor.error("Not implemented"); // Have to look for a adjourn draw in the moves
}

function decline_by_name(name) {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  throw new Meteor.error("Not implemented"); // Have to look for a game with that users name and see if amything is pending
}

function decline_in_general() {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  throw new Meteor.error("Not implemented"); // Have to look for a played game and see if amything is pending
}

function checkDrawAbort(name, type, result) {
  let selector;
  if (name) {
    const them = getOtherUser(name);
    selector = {
      status: { $in: ["playing", "adjourned"] },
      $and: [
        {
          $or: [
            { white: { userid: Meteor.userId() } },
            { black: { userid: them._id } }
          ]
        },
        {
          $or: [
            { white: { userid: them._id } },
            { black: { userid: Meteor.userId() } }
          ]
        }
      ]
    };
  } else {
    selector = {
      status: { $in: ["playing", "adjourned"] },
      $or: [
        { white: { userid: Meteor.userId() } },
        { black: { userid: Meteor.userId() } }
      ]
    };
  }
  const games = GameCollection.find(selector);
  if (games.count() === 0) throw new Meteor.Error("Not playing a game");
  const pending = games.fetch().filter(game => {
    return !!game.actions && game.actions[game.actions.length - 1] === type; // TODO: This isn't right because we have to get around the timestamp
  });
  if (!pending || !pending.length)
    throw new Meteor.Error("No pending draw found"); // TODO: Look for a playing game then and offer a draw

  if (pending.length > 1)
    throw new Meteor.Error("Can't figure out which game to draw"); // TODO: Better error? What to do?

  GameCollection.update(
    { _id: pending[0]._id },
    {
      status: "ended",
      result: result,
      $push: { actions: [{ type: "accepted", time: new Date() }] }
    }
  );
  delete active_games[pending[0]._id]; // In case it was an active game
}

Meteor.methods({
  "game.match"(name, time, increment, time2, increment2, rated, wild, color) {
    check(name, String);
    check(time, Number);
    check(increment, [Number]);
    check(time2, [Number]);
    check(increment2, [Number]);
    check(rated, Boolean);
    check(wild, Number);
    check(color, String);
    const us = Meteor.user();

    if (!us) {
      throw new Meteor.Error("not-authorized");
    }

    const them = getOtherUser(name);
    if (!them) {
      throw new Meteor.Error("Unable to find user " + name);
    }

    const weCantPlayMessage = canPlay(rated, us, them);
    if (!!weCantPlayMessage)
      throw new Meteor.Error("Cannot play a game: " + weCantPlayMessage);

    if (!time) {
      throw new Meteor.Error("Invalid time specified");
    }

    if (wild !== 0) {
      throw new Meteor.Error("Only wild zero is supported at this time");
    }

    if (!!color || color !== "white" || color !== "black") {
      throw new Meteor.Error("Incorrect color value");
    }

    const white = determineWhite(us, them, color);
    let black = white === us ? them : us;

    if (!increment) increment = 0;
    if (!increment2) increment2 = increment;
    if (!time2) time2 = time;

    if (white !== us) {
      const temp_time = time;
      const temp_inc = increment;
      time = time2;
      increment = increment2;
      time2 = temp_time;
      increment2 = temp_inc;
    }

    let game = {
      date: new Date(),
      status: them.settings.autoaccept ? "playing" : "pending",
      clocks: {
        white: { time: time * 60, inc: increment },
        black: { time: time2 * 60, inc: increment2 }
      },
      white: {
        name: white.username,
        userid: white._id,
        rating: white.rating
      },
      black: {
        name: black.username,
        userid: black._id,
        rating: black.rating
      },
      actions: []
    };

    GameCollection.insert(game, (error, result) => {
      if (error) log.error(error.invalidKeys);
      GameCollection.simpleSchema()
        .namedContext()
        .validationErrors();
    });

    if (them.settings.autoaccept) {
      // TODO: I don't think this is quite right. Check to make sure we have valid ids, but more importantly,
      // don't do this if we incur some type of mongo error from whatever the above code is doing.
      active_games[game._id] = new Chess();
      setActiveGame(us._id, game._id);
      setActiveGame(them._id, game._id);
    }
  },

  "game.accept"(name) {
    check(name, String);
    let game = null;
    if (!!name) {
      const them = getOtherUser(name);
      game = GameCollection.findOne({
        status: "pending",
        $or: [{ white: { userid: them._id } }, { black: { userid: them._id } }]
      });
    } else {
      game = GameCollection.find({ status: "pending" });
      if (game.count() > 1)
        throw new Meteor.Error(
          "More than one game to accept. Must specify name"
        );
      game = game.fetch();
    }
    if (!game) throw new Meteor.Error("No game to accept");
    GameCollection.update({ _id: game._id }, { status: "playing" });
  },

  "game.decline"(type) {
    // type: "draw", "abort", "adjourn", "somebodys-name", or none, and we figure it out
    check(type, String);
    switch (type) {
      case "draw":
        decline_draw();
        break;
      case "abort":
        decline_abort();
        break;
      case "adjourn":
        decline_adjourn();
        break;
      default:
        if (!type) decline_in_general();
        else decline_by_name(type); // TODO: So usernames cannot be "draw", "abort" or "adjourn". Is this OK?
    }
  },

  "game.draw"(name) {
    check(name, String);
    if (!checkDrawAbort(name, "draw", "1/2-1/2"))
      throw new Meteor.error("Unimplemented"); // look for a game to offer a draw to
  },

  "game.adjourn"(name) {
    check(name, String);
    throw new Meteor.Error("Unimplemented");
  },

  "game.abort"(name) {
    check(name, String);
    if (!checkDrawAbort(name, "abort", "*-*"))
      throw new Meteor.error("Unimplemented"); // look for a game to offer an abort to
  },

  "game.pending"() {
    throw new Meteor.Error("Unimplemented");
  },

  "game.resume"() {
    throw new Meteor.Error("Unimplemented");
  },

  "game.move"(move) {
    check(move, String);
    throw new Meteor.Error("Unimplemented");
  },

  "game.takeback"(moves) {
    check(moves, [Number]);
    throw new Meteor.Error("Unimplemented");
  }
  /*
TODO: Once we get this completely switched over, delete them
  "game-move.insert"(Id, move, actionBy) {
    check(Id, String);
    check(move, String);
    check(actionBy, String);
    GameCollection.update(
      { _id: Id },
      {
        $push: { moves: move }
      },
      (error, result) => {
        //The list of errors is available on `error.invalidKeys` or
        //by calling Books.simpleSchema().namedContext().validationErrors()
        if (error) log.error(error.invalidKeys);
        GameCollection.simpleSchema()
          .namedContext()
          .validationErrors();
      }
    );
    GameCollection.update(
      { _id: Id },
      {
        $push: { actions: { type: "move", value: move, actionBy: actionBy } }
      },
      (error, result) => {
        if (error) log.error(error.invalidKeys);
        GameCollection.simpleSchema()
          .namedContext()
          .validationErrors();
      }
    );
  },
  "execute-game-action"(Id, actionType, action, actionBy) {
    check(action, String);
    check(Id, String);
    check(actionType, String);
    check(actionBy, String);

    if (action === "takeBack" && actionType === "accepted") {
      log.debug(GameCollection.update({ _id: Id }, { $pull: { moves: -1 } }));
    }
    if (action === "aborted" || action === "resigned") {
      GameCollection.update(
        { _id: Id },
        {
          $push: {
            actions: { type: action, value: "game", actionBy: actionBy }
          }
        },
        (error, result) => {
          if (error) log.error(error.invalidKeys);
          GameCollection.simpleSchema()
            .namedContext()
            .validationErrors();
        }
      );
    } else {
      GameCollection.update(
        { _id: Id },
        {
          $push: {
            actions: { type: action, value: actionType, actionBy: actionBy }
          }
        },
        (error, result) => {
          if (error) log.error(error.invalidKeys);
          GameCollection.simpleSchema()
            .namedContext()
            .validationErrors();
        }
      );
    }
  }
 */
});

const Game = {
  /**
   *
   * @param {string} whiteName
   * @param {int} whiteRating
   * @param {string} blackName
   * @param {int} blackRating
   * @param {int} whiteTime
   * @param {int} blackTime
   * @returns {string} gameId
   */
  start(whiteName, whiteRating, blackName, blackRating, whiteTime, blackTime) {
    return;
  },
  end() {}
};
