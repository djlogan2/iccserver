import Chess from "chess.js";
import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { LegacyUser } from "./LegacyUser";
//
// MessagesCollection
//     Date/time
//     _id of user
//     action
//     error enumeration
//     error-specific data array  <= game id, for example, or whatever
//
//
//     Example:
//        enum                     text
//        PLAY_RESTRICTED          %1 has blocked your ability to play %2 games. Please contact %3 for details.
//
// The error-specific array could have: ['djlogan', 'rated', 'freebird']
//
/** Todo: temporary change name of collection   */
const GameCollection = new Mongo.Collection("game");
let log = new Logger("server/Game_js");

let active_games = {};

// eslint-disable-next-line no-unused-vars
// TODO: Dangit, if we aren't using this, why is it in here???
const playerSchema = new SimpleSchema({
  name: { type: String },
  userid: { type: String, regEx: SimpleSchema.RegEx.Id, required: false }, // TODO: See, by putting legacy games in the database, we have to do things like make ids optional. Do we really want to do this? We could make it optional only when there is a legacy_game_id, and that would be ok.
  rating: { type: SimpleSchema.Integer }
});

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
  status: { type: String },
  clocks: new SimpleSchema({
    white: new SimpleSchema({
      time: { type: SimpleSchema.Integer },
      inc: { type: Number }
    }),
    black: new SimpleSchema({
      time: { type: SimpleSchema.Integer },
      inc: { type: Number }
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

function playMove(game_id, move) {
  const game = GameCollection.findOne({ _id: game_id });
  if (!game)
    throw new Meteor.Error("Trying to play a move in a nonexistant game");
  if (game.legacy_game_id) {
    const our_legacy_user = LegacyUser.find(this._id);
    if (!our_legacy_user)
      throw new Meteor.error(
        "Unable to find a legacy user object for " + this.name
      );
    our_legacy_user.move(move);
  } else {
    throw new Meteor.Error("Implement me - Make a local move, and check validation via chess.js");
  }
}

function updateClock(legacy_id, color, miliseconds) {
  let seconds = (miliseconds / 1000).toFixed(0);
  const game = GameCollection.findOne({ legacy_game_id: parseInt(legacy_id) });
  if (game !== undefined) {
    if (color === "w") {
      GameCollection.update(
        { _id: game._id },
        {
          $set: { "clocks.white.time": seconds }
        }
      );
    }
    if (color === "b") {
      GameCollection.update(
        { _id: game._id },
        {
          $set: { "clocks.black.time": seconds }
        }
      );
    }
  }
}
function addMoves(legacy_id, move) {
  const game = GameCollection.findOne({ legacy_game_id: parseInt(legacy_id) });
  GameCollection.update(
    { _id: game._id },
    {
      $push: { moves: move }
    },
    (error, result) => {
      if (error) log.error(error.invalidKeys);
      GameCollection.simpleSchema()
        .namedContext()
        .validationErrors();
    }
  );
  GameCollection.update(
    { _id: game._id },
    {
      $push: {
        actions: { type: "move", value: move, actionBy: Meteor.userId() }
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

function startLocalGame(
  us,
  them,
  time,
  increment,
  time2,
  increment2,
  rated,
  wild,
  color
) {
  if (!us) {
    throw new Meteor.Error("Unable to find our user");
  }
  if (!them) {
    throw new Meteor.Error("Unable to find their user");
  }

  const weCanPlayMessage = canPlay(rated, us, them);
  if (!weCanPlayMessage)
    throw new Meteor.Error("Cannot play a game: " + weCanPlayMessage);

  let white = determineWhite(us, them, color);
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
  //TODO : rating is feature implement we don't know where rationg comes from?

  white = Object.assign(white, { rating: 1000 });
  black = Object.assign(black, { rating: 1000 });
  startLocalOrLegacyGame(
    white,
    black,
    time,
    increment,
    time2,
    increment2,
    rated,
    wild,
    null,
    "pending"
  );
}

function startLegacyGame(gamenumber whitename blackname wild-number rating-type
rated
white-initial white-increment black-initial black-increment
played-game {ex-string} white-rating black-rating game-id
white-titles black-titles irregular-legality
irregular-semantics
uses-plunkers fancy-timecontrol promote-to-king) {

}

function startLocalOrLegacyGame(
  white,
  black,
  time,
  increment,
  time2,
  increment2,
  rated,
  wild,
  legacy_game_id
) {
  let game = {
    date: new Date(),
    status: "started",
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
    moves: [],
    actions: []
  };

  if (!!legacy_game_id) game.legacy_game_id = legacy_game_id;

  GameCollection.insert(game, (error, result) => {
    if (error) log.error(error.invalidKeys);
    GameCollection.simpleSchema()
      .namedContext()
      .validationErrors();
  });
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
    $or: [
      { "black.userid": Meteor.userId() },
      { "white.userid": Meteor.userId() }
    ]
  });
});

function getOtherUser(name) {
  // TODO: Get user record of other user (remember usernames can be reused)
  // Presumably this will be a mongo find, in another class?
  //let user = Meteor.users.findOne({$or: [{username:name},{userid: name}]});
  let user = Meteor.users.findOne({ $or: [{ _id: name }, { username: name }] });

  if (user) {
    return user;
  } else {
    return false;
  }
}

function canPlay(rated, us, them) {
  // TODO: Exists, not norated, not tournament game, whatever else makes sense
  // Aren't censoring each other
  // can play rated
  // etc. etc. etc.
  // us and them are both the user records
  //return null;
  return true;
}

function determineWhite(p1, p2, color) {
  if (color === "white") return p1;
  if (color === "black") return p2;

  // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
  if (Math.random() <= 0.5) return p1;
  else return p2;
}

function decline_takeback(game_id) {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  let actionBy = Meteor.userId();
  GameCollection.update(
    { _id: game_id },
    {
      $push: {
        actions: { type: "takeBack", value: "rejected", actionBy: actionBy }
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

function decline_abort(game_id) {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  let actionBy = Meteor.userId();
  GameCollection.update(
    { _id: game_id },
    {
      $push: {
        actions: { type: "abort", value: "rejected", actionBy: actionBy }
      }
    }
  );
}

function decline_resign(game_id) {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  let actionBy = Meteor.userId();
  GameCollection.update(
    { _id: game_id },
    {
      $push: {
        actions: { type: "resign", value: "rejected", actionBy: actionBy }
      }
    }
  );
}

function decline_draw(game_id) {
  if (!Meteor.userId()) throw new Meteor.error("Not authorized");
  let actionBy = Meteor.userId();
  GameCollection.update(
    { _id: game_id },
    {
      $push: {
        actions: { type: "draw", value: "rejected", actionBy: actionBy }
      }
    }
  );
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
  //
  // TODO: If the "matched" guy issues his own match command to the original matcher,
  // we have to switch everything around, leave it pending, and of course the original player
  // then gets notified somehow of the new request.
  // From the technical perspective, this means we already have a record in the DB of "pending"
  // with the guy we are matching. How to switch things around and notify the original matcher?
  //
  "game.match"(
    name,
    legacy,
    time,
    increment,
    time2,
    increment2,
    rated,
    wild,
    color
  ) {
    check(name, String);
    check(legacy, Boolean);
    check(time, Number);
    check(increment, Number);
    check(time2, Number);
    check(increment2, Number);
    check(rated, Boolean);
    check(wild, Number);
    check(color, String);
    const us = Meteor.user();

    if (!us) {
      throw new Meteor.Error("not-authorized");
    }

    if (!time) {
      throw new Meteor.Error("Invalid time specified");
    }

    if (wild !== 0) {
      throw new Meteor.Error("Only wild zero is supported at this time");
    }

    if (!!color && color !== "white" && color !== "black") {
      throw new Meteor.Error("Incorrect color value");
    }

    if (legacy) {
      const our_legacy_user = LegacyUser.find(us._id);
      if (!our_legacy_user)
        throw new Meteor.error(
          "Unable to find a legacy user object for " + us.name
        );
      our_legacy_user.match(
        name,
        time,
        increment,
        time2,
        increment2,
        rated,
        wild,
        color
      );
      our_legacy_user.sendRawData("match uiuxtest2 5 0 u w");
    } else {
      startLocalGame(
        us,
        name,
        time,
        increment,
        time2,
        increment2,
        rated,
        wild,
        color
      );
    }
  },

  "game.accept"(them_id) {
    let name = "";
    check(them_id, String);
    let game = null;
    if (!!them_id) {
      const them = getOtherUser(them_id);

      game = GameCollection.findOne({
        status: "pending",
        $or: [{ "black.userid": them._id }, { "white.userid": them._id }]
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
    GameCollection.update({ _id: game._id }, { $set: { status: "playing" } });
  },

  "game.decline"(game_id, type) {
    log.debug(type);
    // type: "draw", "abort", "adjourn", "somebodys-name", or none, and we figure it out
    check(type, String);
    check(game_id, String);
    switch (type) {
      case "draw":
        decline_draw(game_id);
        break;
      case "abort":
        decline_abort(game_id);
        break;
      case "takeBack":
        decline_takeback(game_id);
        break;
      case "adjourn":
        decline_adjourn();
        break;
      case "resign":
        decline_resign(game_id);
        break;
      default:
        if (!type) decline_in_general();
        else decline_by_name(type); // TODO: So usernames cannot be "draw", "abort" or "adjourn". Is this OK?
    }
  },

  "game.draw"(game_id, actionType) {
    check(actionType, String);
    check(game_id, String);
    check(actionType, String);

    //   if (!checkDrawAbort(name, "draw", "1/2-1/2"))
    //     throw new Meteor.error("Unimplemented");
    let actionBy = Meteor.userId();
    let action = "draw";
    GameCollection.update(
      { _id: game_id },
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
  },

  "game.adjourn"(name) {
    check(name, String);
    throw new Meteor.Error("Unimplemented");
  },

  "game.abort"(game_id, actionType) {
    check(actionType, String);
    check(game_id, String);
    let actionBy = Meteor.userId();
    /*  if (!checkDrawAbort(name, "abort", "*-*"))
      throw new Meteor.error("Unimplemented"); // look for a game to offer an abort to
 */
    GameCollection.update(
      { _id: game_id },
      {
        $push: {
          actions: { type: "abort", value: actionType, actionBy: actionBy }
        }
      }
    );
  },
  "game.resign"(game_id, actionType) {
    check(game_id, String);
    check(actionType, String);

    //   if (!checkDrawAbort(name, "draw", "1/2-1/2"))
    //     throw new Meteor.error("Unimplemented");
    let actionBy = Meteor.userId();

    const our_legacy_user = LegacyUser.find(actionBy);
    if (!our_legacy_user)
      throw new Meteor.error(
        "Unable to find a legacy user object for " + actionBy.name
      );

    our_legacy_user.sendRawData("Game is resigned by " + actionBy);
    GameCollection.update(
      { _id: game_id },
      {
        $push: {
          actions: { type: "resign", value: actionType, actionBy: actionBy }
        }
      },
      (error, result) => {
        if (error) log.error(error.invalidKeys);
        GameCollection.simpleSchema()
          .namedContext()
          .validationErrors();
      }
    );
  },

  "game.pending"() {
    throw new Meteor.Error("Unimplemented");
  },

  "game.resume"() {
    throw new Meteor.Error("Unimplemented");
  },

  "game.move"(game_id, move) {
    check(game_id, Meteor.Collection.ObjectID);
    check(move, String);
    playMove(game_id, move);
  },

  "game.takeback"(game_id, actionType) {
    check(game_id, String);
    check(actionType, String);
    let actionBy = Meteor.userId();
    let action = "takeBack";
    if (actionType === "accepted") {
      GameCollection.update(
        { _id: game_id },
        { $pop: { moves: 1 } },
        { bypassCollection2: true }
      );
    }
    GameCollection.update(
      { _id: game_id },
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