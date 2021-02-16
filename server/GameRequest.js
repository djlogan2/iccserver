import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Match, check } from "meteor/check";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { Game } from "./Game";
import SimpleSchema from "simpl-schema";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { DynamicRatings } from "./DynamicRatings";
import { titles } from "../imports/server/userConstants";
import { Users } from "../imports/collections/users";
import { Singular } from "./singular";

const GameRequestCollection = new Mongo.Collection("game_requests");
const LocalSeekSchema = new SimpleSchema({
  create_date: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  isolation_group: String,
  type: String,
  owner: String,
  wild: Number,
  rating_type: String,
  time: Number,
  inc_or_delay: Number,
  delaytype: String,
  rated: Boolean,
  autoaccept: Boolean,
  color: { type: String, optional: true, allowedValues: ["white", "black"] },
  minrating: { type: Number, optional: true },
  maxrating: { type: Number, optional: true },
  formula: { type: String, optional: true },
  matchingusers: [String],
  eligibleplayers: {
    type: Number,
    autoValue() {
      if (!this.field("matchingusers").isSet) return 0;
      const array = this.field("matchingusers").value;
      if (!array) return 0;
      else return array.length;
    }
  }
});
const LegacyMatchSchema = {
  create_date: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  isolation_group: String,
  type: String,
  challenger: String,
  challenger_rating: Number,
  challenger_established: String,
  challenger_titles: { type: Array, optional: true },
  "challenger_titles.$": { type: String, allowedValues: titles },
  receiver: String,
  receiver_rating: Number,
  receiver_established: String,
  receiver_titles: { type: Array, optional: true },
  "receiver_titles.$": { type: String, allowedValues: titles },
  wild_number: Number,
  rating_type: String,
  rated: Boolean,
  adjourned: Boolean,
  challenger_time: Number,
  challenger_inc: Number,
  receiver_time: Number,
  receiver_inc: Number,
  challenger_color_request: {
    type: String,
    optional: true,
    allowedValues: ["white", "black"]
  },
  challenger_id: { type: String, optional: true },
  receiver_id: { type: String, optional: true }
};
const LocalMatchSchema = {
  create_date: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  isolation_group: String,
  type: String,
  challenger: String,
  challenger_rating: Number,
  challenger_titles: { type: Array, optional: true },
  "challenger_titles.$": { type: String, allowedValues: titles },
  challenger_established: Boolean,
  challenger_id: String,
  message_identifier: String,
  receiver: String,
  receiver_rating: Number,
  receiver_established: Boolean,
  receiver_titles: { type: Array, optional: true },
  receiver_id: String,
  "receiver_titles.$": { type: String, allowedValues: titles },
  wild_number: Number,
  rating_type: String,
  rated: Boolean,
  adjourned: Boolean,
  challenger_time: Number,
  challenger_inc_or_delay: Number,
  challenger_delaytype: String,
  receiver_time: Number,
  receiver_inc_or_delay: Number,
  receiver_delaytype: String,
  challenger_color_request: {
    type: String,
    allowedValues: ["white", "black"],
    optional: true
  },
  assess_loss: Number,
  assess_draw: Number,
  assess_win: Number,
  fancy_time_control: { type: String, optional: true }
};
const LegacySeekSchema = {
  create_date: {
    type: Date,
    autoValue: function() {
      return new Date();
    }
  },
  isolation_group: String,
  type: String,
  owner: String,
  legacy_index: Number,
  name: String,
  titles: Array,
  "titles.$": { type: String, allowedValues: titles },
  provisional_status: Number,
  wild: Number,
  rating_type: String,
  time: Number,
  inc: Number,
  rated: Boolean,
  color: { type: String, allowedValues: ["white", "black"], optional: true },
  minrating: Number,
  maxrating: Number,
  autoaccept: Boolean,
  formula: { type: String, optional: true }
};
GameRequestCollection.attachSchema(LocalSeekSchema, {
  selector: { type: "seek" }
});
GameRequestCollection.attachSchema(LocalMatchSchema, {
  selector: { type: "match" }
});
GameRequestCollection.attachSchema(LegacyMatchSchema, {
  selector: { type: "legacymatch" }
});
GameRequestCollection.attachSchema(LegacySeekSchema, {
  selector: { type: "legacyseek" }
});

const log = new Logger("server/GameRequest_js");

export const GameRequests = {};
GameRequests.collection = GameRequestCollection;

GameRequests.addLegacyGameSeek = function(
  message_identifier,
  index,
  name,
  titles,
  rating,
  provisional_status,
  wild,
  rating_type,
  time,
  inc,
  rated,
  color,
  minrating,
  maxrating,
  autoaccept,
  formula
) {
  check(message_identifier, String);
  check(index, Number);
  check(name, String);
  check(titles, Array);
  check(rating, Number);
  check(provisional_status, Number);
  check(wild, Number);
  check(rating_type, String);
  check(time, Number);
  check(inc, Number);
  check(rated, Boolean);
  check(color, Match.Maybe(String));
  check(minrating, Number);
  check(maxrating, Number);
  check(autoaccept, Boolean);
  check(formula, String);

  const self = Meteor.user();
  check(self, Object);
  if (!!color && color !== "white" && color !== "black")
    throw new Match.Error("Color must be null, 'white' or 'black'");

  const upsertReturn = GameRequestCollection.upsert(
    { type: "legacyseek", legacy_index: index, owner: self._id },
    {
      $set: {
        isolation_group: "public",
        name: name,
        titles: titles,
        provisional_status: provisional_status,
        wild: wild,
        rating_type: rating_type,
        time: time,
        inc: inc,
        rated: rated,
        color: color,
        minrating: minrating,
        maxrating: maxrating,
        autoaccept: autoaccept,
        formula: formula
      }
    }
  );
  if (upsertReturn.numberAffected === 1) return upsertReturn.insertedId;
};

GameRequests.addLocalGameSeek = function(
  message_identifier,
  wild,
  rating_type,
  time,
  inc_or_delay,
  inc_or_delay_type,
  rated,
  color,
  minrating,
  maxrating,
  autoaccept,
  formula
) {
  check(message_identifier, String);
  check(wild, Number);
  check(rating_type, String);
  check(time, Number);
  check(inc_or_delay, Number);
  check(inc_or_delay_type, String);
  check(rated, Boolean);
  check(color, Match.Maybe(String));
  check(minrating, Match.Maybe(Number));
  check(maxrating, Match.Maybe(Number));
  check(autoaccept, Match.Maybe(Boolean));
  check(formula, Match.Maybe(String));
  const self = Meteor.user();
  check(self, Object);

  if (wild !== 0) throw new Match.Error(wild + " is an invalid wild type");
  if (color !== null && color !== undefined && color !== "white" && color !== "black")
    throw new Match.Error("Invalid color specification");
  if (!self.ratings[rating_type])
    throw new ICCMeteorError(message_identifier, "Invalid rating type");
  if (
    rated &&
    !DynamicRatings.meetsRatingTypeRules(
      message_identifier,
      "white",
      rating_type,
      time,
      inc_or_delay,
      inc_or_delay_type,
      "seek",
      !!color
    )
  )
    throw new ICCMeteorError(
      message_identifier,
      "seek fails to meet whites rating type rules for time and inc"
    );
  if (
    rated &&
    !DynamicRatings.meetsRatingTypeRules(
      message_identifier,
      "black",
      rating_type,
      time,
      inc_or_delay,
      inc_or_delay_type,
      "seek",
      !!color
    )
  )
    throw new ICCMeteorError(
      message_identifier,
      "seek fails to meet blacks rating type rules for time and inc"
    );

  if (!!formula) throw new ICCMeteorError(message_identifier, "Formula is not yet supported");

  if (!Users.isAuthorized(self, rated ? "play_rated_games" : "play_unrated_games")) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_" + (rated ? "" : "UN") + "RATED_GAMES"
    );
    return;
  }

  const game = {
    type: "seek",
    owner: self._id,
    isolation_group: self.isolation_group,
    wild: wild,
    rating_type: rating_type,
    time: time,
    inc_or_delay: inc_or_delay,
    delaytype: inc_or_delay_type,
    rated: rated,
    autoaccept: autoaccept || false
  };

  if (!!color) game.color = color;
  if (!!minrating) game.minrating = minrating;
  if (!!maxrating) game.maxrating = maxrating;
  if (!!formula) game.formula = formula;

  const existing_seek = GameRequestCollection.findOne(game);
  if (existing_seek) return existing_seek._id;

  Meteor.users.update(
    { _id: self._id },
    {
      $set: {
        "settings.seek_default": {
          wild: wild,
          rating_type: rating_type,
          time: time,
          inc_or_delay: inc_or_delay,
          inc_or_delay_type: inc_or_delay_type,
          rated: rated
        }
      }
    }
  );

  const other_seeks = GameRequestCollection.find({
    type: "seek",
    isolation_group: self.isolation_group,
    wild: wild,
    rating_type: rating_type,
    time: time,
    inc_or_delay: inc_or_delay,
    delaytype: inc_or_delay_type,
    rated: rated,
    matchingusers: self._id
  }).fetch();

  if (!!other_seeks.length) {
    const random_seek = other_seeks[Math.floor(Math.random() * other_seeks.length)];
    return GameRequests.acceptGameSeek(message_identifier, random_seek._id);
    // TODO: Handle auto-accept.
    // TODO: Also, don't just select random people, weight and sort by days since played each other and difference in actual ratings
  }

  const users = Meteor.users
    .find({ "status.online": true, isolation_group: self.isolation_group })
    .fetch();
  let matchingusers = [];
  if (!!users) {
    matchingusers = users
      .filter(user => seekMatchesUser(message_identifier, user, game))
      .map(user => user._id);
  }
  game.matchingusers = matchingusers || [];

  return GameRequestCollection.insert(game);
};

GameRequests.removeLegacySeek = function(message_identifier, seek_index, reason_code) {
  check(message_identifier, String);
  check(seek_index, Number);
  check(reason_code, Number);
  const self = Meteor.user();
  check(self, Object);

  const request = GameRequestCollection.findOne({ legacy_index: seek_index });
  if (!request) return; // The doc says we could get removes for seeks we do not have.

  if (self._id !== request.owner)
    throw new ICCMeteorError(message_identifier, "Cannot remove another users game seek");

  GameRequestCollection.remove({ _id: request._id });
};

GameRequests.removeGameSeek = function(message_identifier, seek_id) {
  const self = Meteor.user();
  check(message_identifier, String);
  check(seek_id, String);
  check(self, Object);

  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new ICCMeteorError(message_identifier, "Unable to find seek with id " + seek_id);

  if (self._id !== request.owner)
    throw new ICCMeteorError(message_identifier, "Cannot remove another users game seek");

  if (request.type !== "seek")
    throw new ICCMeteorError(
      message_identifier,
      "Cannot remove this seek. It is of type '" + request.type + "' and must be of type 'seek'"
    );

  GameRequestCollection.remove({ _id: seek_id });
};

GameRequests.acceptGameSeek = function(message_identifier, seek_id) {
  const self = Meteor.user();
  check(self, Object);
  check(seek_id, String);
  check(message_identifier, String);

  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new ICCMeteorError(message_identifier, "Unable to find seek with id " + seek_id);
  if (self._id === request.owner)
    throw new ICCMeteorError(message_identifier, "Cannot accept a seek from yourself");
  if (request.type !== "seek")
    throw new ICCMeteorError(message_identifier, "Cannot accept a non-local seek");
  if (!Users.isAuthorized(self, request.rated ? "play_rated_games" : "play_unrated_games")) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY_" + (request.rated ? "" : "UN") + "RATED_GAMES"
    );
    return;
  }

  const challenger = Meteor.users.findOne({ _id: request.owner });
  check(challenger, Object);

  if (Game.isPlayingGame(self)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  if (Game.isPlayingGame(challenger)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  const game_id = Game.startLocalGame(
    message_identifier,
    challenger,
    request.wild,
    request.rating_type,
    request.rated,
    request.time,
    request.inc_or_delay,
    request.delaytype,
    request.time,
    request.inc_or_delay,
    request.delaytype,
    request.challenger_color_request
  );
  GameRequestCollection.remove({ _id: seek_id });
  return game_id;
};

//
//-----------------------------------------------------------------------------
//
GameRequests.addLegacyMatchRequest = function(
  message_identifier,
  challenger_name,
  challenger_rating,
  challenger_established,
  challenger_titles,
  receiver_name,
  receiver_rating,
  receiver_established,
  receiver_titles,
  wild_number,
  rating_type,
  is_it_rated,
  is_it_adjourned,
  challenger_time,
  challenger_inc,
  receiver_time,
  receiver_inc,
  challenger_color_request,
  assess_loss
) {
  check(message_identifier, String);
  check(challenger_name, String);
  check(challenger_rating, Number);
  check(challenger_established, String);
  check(challenger_titles, Match.Maybe(Array));
  check(receiver_name, String);
  check(receiver_rating, Number);
  check(receiver_established, String);
  check(receiver_titles, Match.Maybe(Array));
  check(wild_number, Number);
  check(rating_type, String);
  check(is_it_rated, Boolean);
  check(is_it_adjourned, Boolean);
  check(challenger_time, Number);
  check(challenger_inc, Number);
  check(receiver_time, Number);
  check(receiver_inc, Number);
  check(challenger_color_request, String);
  check(assess_loss, Number);
  let challenger_or_receiver = false;

  const self = Meteor.user();
  check(self, Object);

  const challenger_user = Meteor.users.findOne({
    "profile.legacy.username": challenger_name,
    "profile.legacy.validated": true
  });

  const receiver_user = Meteor.users.findOne({
    "profile.legacy.username": receiver_name,
    "profile.legacy.validated": true
  });

  if (challenger_user && challenger_user._id === self._id) challenger_or_receiver = true;
  if (receiver_user && receiver_user._id === self._id) challenger_or_receiver = true;

  if (!challenger_or_receiver)
    throw new ICCMeteorError(
      message_identifier,
      "addLegacyMatch where neither challenger nor receiver is the logged on user"
    );
  if (challenger_color_request === 1 || challenger_color_request === "white") {
    challenger_color_request = "white";
  } else {
    challenger_color_request = "black";
  }
  const record = {
    type: "legacymatch",
    isolation_group: "public",
    challenger: challenger_name,
    challenger_rating: challenger_rating,
    challenger_established: challenger_established,
    challenger_titles: challenger_titles,
    receiver: receiver_name,
    receiver_rating: receiver_rating,
    receiver_established: receiver_established,
    receiver_titles: receiver_titles,
    wild_number: wild_number,
    rating_type: rating_type,
    rated: is_it_rated,
    adjourned: is_it_adjourned,
    challenger_time: challenger_time,
    challenger_inc: challenger_inc,
    receiver_time: receiver_time,
    receiver_inc: receiver_inc,
    challenger_color_request: challenger_color_request
  };

  if (challenger_color_request) record.challenger_color_request = challenger_color_request;

  if (!!challenger_user) record.challenger_id = challenger_user._id;
  if (!!receiver_user) record.receiver_id = receiver_user._id;

  return GameRequestCollection.insert(record);
};

function established(rating_object) {
  return rating_object.won + rating_object.draw + rating_object.lost >= 20;
}

GameRequests.addLocalMatchRequest = function(
  message_identifier,
  receiver_user,
  wild_number,
  rating_type,
  is_it_rated,
  is_it_adjourned,
  challenger_time,
  challenger_inc_or_delay,
  challenger_inc_or_delay_type,
  receiver_time,
  receiver_inc_or_delay,
  receiver_inc_or_delay_type,
  challenger_color_request,
  fancy_time_control
) {
  const challenger_user = Meteor.user();
  check(challenger_user, Object);
  check(message_identifier, String);
  check(receiver_user, Match.OneOf(Object, String));
  check(wild_number, Number);
  check(rating_type, String);
  check(is_it_rated, Boolean);
  check(is_it_adjourned, Boolean);
  check(challenger_time, Number);
  check(challenger_inc_or_delay, Number);
  check(challenger_inc_or_delay_type, String);
  check(receiver_time, Number);
  check(receiver_inc_or_delay, Number);
  check(receiver_inc_or_delay_type, String);
  check(challenger_color_request, Match.Maybe(String));
  check(fancy_time_control, Match.Maybe(String));

  if (typeof receiver_user === "string")
    receiver_user = Meteor.users.findOne({ _id: receiver_user });

  if (!receiver_user || !receiver_user.status.online) {
    ClientMessages.sendMessageToClient(
      challenger_user,
      message_identifier,
      "CANNOT_MATCH_LOGGED_OFF_USER"
    );
    return;
  }

  if (
    !!challenger_color_request &&
    challenger_color_request !== "white" &&
    challenger_color_request !== "black"
  ) {
    throw new ICCMeteorError(
      message_identifier,
      "challenger_color_request must be null, 'black' or 'white'"
    );
  }

  if (!challenger_color_request) {
    if (
      challenger_time !== receiver_time ||
      challenger_inc_or_delay !== receiver_inc_or_delay ||
      challenger_inc_or_delay_type !== receiver_inc_or_delay_type
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot add match request",
        "Color not specified and time controls differ"
      );
  }

  if (challenger_color_request === "white") {
    if (
      is_it_rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "white",
        rating_type,
        challenger_time,
        challenger_inc_or_delay,
        challenger_inc_or_delay_type,
        "match",
        !!challenger_color_request
      )
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot add match request",
        "Failed time and inc rules for challenger"
      );
    if (
      is_it_rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "black",
        rating_type,
        receiver_time,
        receiver_inc_or_delay,
        receiver_inc_or_delay_type,
        "match",
        !!challenger_color_request
      )
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot add match request",
        "Failed time and inc rules for challenger"
      );
  } else {
    if (
      is_it_rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "black",
        rating_type,
        challenger_time,
        challenger_inc_or_delay,
        challenger_inc_or_delay_type,
        "match",
        !!challenger_color_request
      )
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot add match request",
        "Failed time and inc rules for challenger"
      );
    if (
      is_it_rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "black",
        rating_type,
        receiver_time,
        receiver_inc_or_delay,
        receiver_inc_or_delay_type,
        "match",
        !!challenger_color_request
      )
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot add match request",
        "Failed time and inc rules for challenger"
      );
  }

  const role = is_it_rated ? "play_rated_games" : "play_unrated_games";

  if (!Users.isAuthorized(challenger_user, role))
    throw new ICCMeteorError(message_identifier, "not_in_role", role);
  if (!Users.isAuthorized(receiver_user, role))
    throw new ICCMeteorError(message_identifier, "not_in_role", role);

  if (wild_number !== 0) throw new ICCMeteorError(message_identifier, "Wild must be zero");

  const assess = SystemConfiguration.winDrawLossAssessValues(
    challenger_user.ratings[rating_type],
    receiver_user.ratings[rating_type]
  );

  if (challenger_user.isolation_group !== receiver_user.isolation_group)
    throw new ICCMeteorError(message_identifier, "Unable to match", "Mismatch in isolation group");

  const record = {
    type: "match",
    isolation_group: challenger_user.isolation_group,
    challenger: challenger_user.username,
    challenger_rating: challenger_user.ratings[rating_type].rating,
    challenger_titles: [],
    challenger_established: established(challenger_user.ratings[rating_type]),
    challenger_id: challenger_user._id,
    message_identifier: message_identifier,
    receiver: receiver_user.username,
    receiver_rating: receiver_user.ratings[rating_type].rating,
    receiver_established: established(receiver_user.ratings[rating_type]),
    receiver_id: receiver_user._id,
    receiver_titles: [],
    wild_number: wild_number,
    rating_type: rating_type,
    rated: is_it_rated,
    adjourned: is_it_adjourned,
    challenger_time: challenger_time,
    challenger_inc_or_delay: challenger_inc_or_delay,
    challenger_delaytype: challenger_inc_or_delay_type,
    receiver_time: receiver_time,
    receiver_inc_or_delay: receiver_inc_or_delay,
    receiver_delaytype: receiver_inc_or_delay_type,
    challenger_color_request: challenger_color_request,
    assess_loss: assess.loss,
    assess_draw: assess.draw,
    assess_win: assess.win,
    fancy_time_control: fancy_time_control
  };

  if (!is_it_adjourned)
    Meteor.users.update(
      { _id: Meteor.userId() },
      {
        $set: {
          "settings.match_default": {
            wild_number: wild_number,
            rating_type: rating_type,
            rated: is_it_rated,
            challenger_time: challenger_time,
            challenger_inc_or_delay: challenger_inc_or_delay,
            challenger_delaytype: challenger_inc_or_delay_type,
            receiver_time: receiver_time,
            receiver_inc_or_delay: receiver_inc_or_delay,
            receiver_delaytype: receiver_inc_or_delay_type,
            challenger_color_request: challenger_color_request
          }
        }
      }
    );

  return GameRequestCollection.insert(record);
};

GameRequests.acceptMatchRequest = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);

  const receiver = Meteor.user();
  check(receiver, Object);

  const match = GameRequestCollection.findOne({ _id: game_id });
  if (!match) {
    ClientMessages.sendMessageToClient(receiver, message_identifier, "NO_MATCH_FOUND");
    return;
  }

  if (match.type !== "match")
    throw new ICCMeteorError(
      message_identifier,
      "Cannot accept match",
      "Match request is a legacy request"
    );

  if (receiver._id === match.challenger_id) {
    throw new ICCMeteorError(
      message_identifier,
      "Cannot accept match",
      "Cannot accept your own match"
    );
  }

  if (receiver._id !== match.receiver_id) {
    throw new ICCMeteorError(message_identifier, "Cannot accept match", "You are not the receiver");
  }

  const challenger = Meteor.users.findOne({ _id: match.challenger_id });
  check(challenger, Object);

  if (Game.isPlayingGame(challenger)) {
    ClientMessages.sendMessageToClient(receiver, message_identifier, "ALREADY_PLAYING");
    return;
  }

  if (Game.isPlayingGame(receiver)) {
    ClientMessages.sendMessageToClient(receiver, message_identifier, "ALREADY_PLAYING");
    return;
  }

  let white_initial;
  let black_initial;
  //let white_incobj;
  //let black_incobj;
  let white_inc_or_delay;
  let black_inc_or_delay;
  let white_delaytype;
  let black_delaytype;
  let color = null;

  if (!match.challenger_color_request) {
    if (
      match.challenger_time !== match.receiver_time ||
      match.challenger_inc_or_delay !== match.receiver_inc_or_delay ||
      match.challenger_delaytype !== match.receiver_delaytype
    )
      throw new ICCMeteorError(
        message_identifier,
        "Cannot accept match",
        "No color specified and time/inc mismatch"
      );
    white_initial = black_initial = match.challenger_time;
    white_inc_or_delay = black_inc_or_delay = match.challenger_inc_or_delay;
    white_delaytype = black_delaytype = match.challenger_delaytype;
  } else if (match.challenger_color_request === "white") {
    white_initial = match.challenger_time;
    white_inc_or_delay = match.challenger_inc_or_delay;
    white_delaytype = match.challenger_delaytype;
    black_initial = match.receiver_time;
    black_inc_or_delay = match.receiver_inc_or_delay;
    black_delaytype = match.receiver_delaytype;
    color = "black";
  } else {
    white_initial = match.receiver_time;
    white_inc_or_delay = match.receiver_inc_or_delay;
    white_delaytype = match.receiver_delaytype;
    black_initial = match.challenger_time;
    black_inc_or_delay = match.challenger_inc_or_delay;
    black_delaytype = match.challenger_delaytype;
    color = "white";
  }

  const started_id = Game.startLocalGame(
    message_identifier,
    challenger,
    match.wild_number,
    match.rating_type,
    match.rated,
    white_initial,
    white_inc_or_delay,
    white_delaytype,
    black_initial,
    black_inc_or_delay,
    black_delaytype,
    color
  );
  GameRequestCollection.remove({ _id: game_id });
  return started_id;
};

GameRequests.declineMatchRequest = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const request = GameRequestCollection.findOne({ _id: game_id });
  if (!request)
    throw new ICCMeteorError(message_identifier, "Unable to decline match", "game id not found");
  if (request.challenger_id === self._id)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to decline match",
      "challenger cannot decline a match"
    );
  if (request.receiver_id !== self._id)
    throw new ICCMeteorError(message_identifier, "Unable to decline match", "not the receiver");

  GameRequestCollection.remove({ _id: game_id });
  ClientMessages.sendMessageToClient(
    request.challenger_id,
    request.message_identifier,
    "MATCH_DECLINED"
  );
};

GameRequests.removeLegacyMatchRequest = function(
  message_identifier,
  challenger_name,
  receiver_name,
  explanation_string
) {
  check(message_identifier, String);
  check(challenger_name, String);
  check(receiver_name, String);
  check(explanation_string, String);
  const self = Meteor.user();
  check(self, Object);

  if (
    !self.profile ||
    !self.profile.legacy ||
    !self.profile.legacy.username ||
    !self.profile.legacy.validated
  )
    throw new ICCMeteorError(
      message_identifier,
      "User is neither challenger nor receiver of removed match"
    );
  if (
    self.profile.legacy.username !== challenger_name &&
    self.profile.legacy.username !== receiver_name
  )
    throw new ICCMeteorError(
      message_identifier,
      "User is neither challenger nor receiver of removed match (2)"
    );
  const result = GameRequestCollection.remove({
    $and: [{ challenger: challenger_name }, { receiver: receiver_name }]
  });

  if (!result)
    throw new ICCMeteorError(message_identifier, "No legacy match record found to remove");

  ClientMessages.sendMessageToClient(self, message_identifier, "LEGACY_MATCH_REMOVED", [
    explanation_string
  ]);
};

Meteor.methods({
  addLocalMatchRequest: GameRequests.addLocalMatchRequest,
  // Look in LegacyUsers for this
  //gameRequestAccept: GameRequests.acceptMatchRequest,
  gameRequestDecline: GameRequests.declineMatchRequest,
  createLocalGameSeek: GameRequests.addLocalGameSeek,
  acceptLocalGameSeek: GameRequests.acceptGameSeek,
  removeGameSeek: GameRequests.removeGameSeek
});

function seekMatchesUser(message_identifier, user, seek) {
  check(message_identifier, String);
  check(user, Object);
  check(seek, Object);

  if (user._id === seek.owner) return false;

  if (seek.isolation_group !== user.isolation_group) return false;

  if (!Users.isAuthorized(user, "play_rated_games") && seek.rated) return false;
  if (!Users.isAuthorized(user, "play_unrated_games") && !seek.rated) return false;

  if (!seek.minrating && !seek.maxrating) return true;

  const myrating = user.ratings[seek.rating_type].rating;
  if (!!seek.minrating && myrating < seek.minrating) return false;
  return !seek.maxrating || seek.maxrating >= myrating;
}

Meteor.publishComposite("game_requests", {
  find: function() {
    return Meteor.users.find(
      { _id: this.userId, "status.online": true, "status.game": { $ne: "playing" } },
      { fields: { "status.game": 1, isolation_group: 1 } }
    );
  },
  children: [
    {
      find(user) {
        log.debug("publishComposite game_requests, userid=" + user._id);
        return GameRequestCollection.find(
          {
            $and: [
              {
                $or: [
                  { challenger_id: user._id },
                  { receiver_id: user._id },
                  { owner: user._id },
                  { matchingusers: user._id }
                ]
              },
              { isolation_group: user.isolation_group }
            ]
          },
          { fields: { matchingusers: 0 } }
        );
      }
    }
  ]
});

GameRequests.removeUserFromAllSeeks = function(userId) {
  check(userId, String);
  GameRequestCollection.update(
    { type: "seek", matchingusers: userId },
    { $pull: { matchingusers: userId } },
    { multi: true }
  );
  GameRequestCollection.remove({ type: "seek", owner: userId });
};

GameRequests.updateAllUserSeeks = function(message_identifier, user) {
  check(message_identifier, String);
  check(user, Match.OneOf(Object, String));

  if (typeof user === "string") {
    user = Meteor.users.findOne({ _id: user });
    if (!user) throw new Match.Error("Unable to find user");
  }

  let add = [];
  let remove = [];

  GameRequestCollection.find({
    type: "seek",
    isolation_group: user.isolation_group,
    owner: { $ne: user._id }
  })
    .fetch()
    .forEach(seek => {
      const matches = seekMatchesUser(message_identifier, user, seek);
      const alreadymatches = seek.matchingusers.indexOf(user._id) !== -1;
      if (matches !== alreadymatches) {
        if (matches) add.push(seek._id);
        else remove.push(seek._id);
      }
    });

  if (add.length)
    GameRequestCollection.update(
      { _id: { $in: add }, type: "seek" },
      { $addToSet: { matchingusers: user._id } },
      { multi: true }
    );

  if (remove.length)
    GameRequestCollection.update(
      { _id: { $in: remove }, type: "seek" },
      { $pull: { matchingusers: user._id } },
      { multi: true }
    );

  const everybody = Meteor.users
    .find({
      isolation_group: user.isolation_group,
      "status.online": true,
      "status.game": { $ne: "playing" }
    })
    .fetch();

  const update = {};
  GameRequestCollection.find({ type: "seek", owner: user._id }).forEach(seek => {
    update.$addToSet = everybody
      .filter(
        user =>
          !seek.matchingusers.some(u => u === user) &&
          seekMatchesUser(message_identifier, user, seek)
      )
      .map(user => user._id);
    update.$pull = everybody
      .filter(
        user =>
          seek.matchingusers.some(u => u === user) &&
          !seekMatchesUser(message_identifier, user, seek)
      )
      .map(user => user._id);

    GameRequestCollection.update({ _id: seek._id, type: seek.type }, update);
  });
};

GameRequests.removeAllUserMatches = function(userId, loggedOff) {
  check(userId, String);
  check(loggedOff, Boolean);

  if (loggedOff) {
    GameRequestCollection.find(
      {
        receiver_id: userId
      },
      { challenger_id: 1 }
    )
      .fetch()
      .forEach(match => {
        ClientMessages.sendMessageToClient(
          match.challenger_id,
          "matchRequest",
          "CANNOT_MATCH_LOGGED_OFF_USER"
        );
      });
  }

  GameRequestCollection.remove({
    $or: [{ challenger_id: userId }, { receiver_id: userId }]
  });
};

Users.events.on("userLogin", function(fields) {
  GameRequests.removeAllUserMatches(fields.userId, false);
  GameRequests.removeUserFromAllSeeks(fields.userId);
  GameRequests.updateAllUserSeeks("server", fields.userId);
});

Users.events.on("userLogout", function(fields) {
  GameRequests.removeAllUserMatches(fields.userId, true);
  GameRequests.removeUserFromAllSeeks(fields.userId);
});

function groupChangeHook(message_identifier, userId) {
  check(message_identifier, String);
  check(userId, String);
  const user = Meteor.users.findOne({ _id: userId });
  check(user, Object);
  GameRequestCollection.update({ type: "seek", owner: user._id }, {}, { multi: true });
  GameRequests.updateAllUserSeeks(message_identifier, user);
}

if (Meteor.isTest || Meteor.isAppTest) {
  GameRequests.collection = GameRequestCollection;
  GameRequests.seekMatchesUser = seekMatchesUser;
}

Meteor.startup(function() {
  Users.addGroupChangeHook(groupChangeHook);
});

Singular.addTask(() => {
  Meteor.users.find({ "status.online": true }).observeChanges({
    changed(id, fields) {
      if ("status" in fields && "game" in fields.status) {
        log.debug(
          "Update users matches and seeks due to a change in game status, user=" +
            id +
            ", status=" +
            fields.status.game
        );
        if (fields.status.game === "playing") {
          GameRequests.removeAllUserMatches(id, false);
          GameRequests.removeUserFromAllSeeks(id);
        } else {
          GameRequests.updateAllUserSeeks("server", id);
        }
      }
    }
  });
});
