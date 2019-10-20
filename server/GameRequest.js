import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";

import { Match, check } from "meteor/check";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { Game } from "./Game";
import { LegacyUser } from "./LegacyUser";
import SimpleSchema from "simpl-schema";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { titles } from "../imports/server/userConstants";

const GameRequestCollection = new Mongo.Collection("game_requests");
const LocalSeekSchema = new SimpleSchema({
  type: String,
  owner: String,
  wild: Number,
  rating_type: String,
  time: Number,
  inc: Number,
  rated: Boolean,
  autoaccept: Boolean,
  color: { type: String, optional: true, allowedValues: ["white", "black"] },
  minrating: { type: Number, optional: true },
  maxrating: { type: Number, optional: true },
  formula: { type: String, optional: true }
});
const LegacyMatchSchema = {
  type: String,
  challenger: String,
  challenger_rating: Number,
  challenger_established: Boolean,
  challenger_titles: { type: Array, optional: true },
  "challenger_titles.$": { type: String, allowedValues: titles },
  receiver: String,
  receiver_rating: Number,
  receiver_established: Boolean,
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
  type: String,
  challenger: String,
  challenger_rating: Number,
  challenger_titles: { type: Array, optional: true },
  "challenger_titles.$": { type: String, allowedValues: titles },
  challenger_established: Boolean,
  receiver: String,
  receiver_rating: Number,
  receiver_established: Boolean,
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
    allowedValues: ["white", "black"],
    optional: true
  },
  assess_loss: Number,
  assess_draw: Number,
  assess_win: Number,
  fancy_time_control: { type: String, optional: true },
  challenger_id: { type: String, optional: true },
  receiver_id: { type: String, optional: true }
};
const LegacySeekSchema = {
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

let log = new Logger("server/GameRequest_js");

export const GameRequests = {};
//
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
  if (!self)
    throw new ICCMeteorError(message_identifier, "self is null or invalid");

  const upsertReturn = GameRequestCollection.upsert(
    { type: "legacyseek", legacy_index: index, owner: self._id },
    {
      $set: {
        //       type: "legacyseek",
        //       owner: self._id,
        //       legacy_index: index,
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
  inc,
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
  check(inc, Number);
  check(rated, Boolean);
  check(color, Match.Maybe(String));
  check(minrating, Match.Maybe(Number));
  check(maxrating, Match.Maybe(Number));
  check(autoaccept, Boolean);
  check(formula, Match.Maybe(String));
  const self = Meteor.user();
  if (!self) throw new ICCMeteorError(message_identifier, "self is null");
  if (wild !== 0) throw new Match.Error(wild + " is an invalid wild type");
  if (color !== null && color !== "white" && color !== "black")
    throw new Match.Error("Invalid color specification");
  if (!SystemConfiguration.meetsTimeAndIncRules(time, inc))
    throw new ICCMeteorError(
      message_identifier,
      "seek fails to meet time and increment configuration rules"
    );
  if (!self.ratings[rating_type])
    throw new ICCMeteorError(message_identifier, "Invalid rating type");
  if (!SystemConfiguration.meetsRatingTypeRules(rating_type, time, inc))
    throw new ICCMeteorError(
      message_identifier,
      "seek fails to meet rating type rules for time and inc"
    );

  if (
    !SystemConfiguration.meetsMinimumAndMaximumRatingRules(
      rating_type,
      self.ratings[rating_type],
      minrating,
      maxrating
    )
  )
    throw new ICCMeteorError(
      message_identifier,
      "seek fails to meet minimum or maximum rating rules"
    );
  if (!!formula)
    throw new ICCMeteorError(
      message_identifier,
      "Formula is not yet supported"
    );

  if (
    !Roles.userIsInRole(self, rated ? "play_rated_games" : "play_unrated_games")
  ) {
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY" + (rated ? "" : "UN") + "RATED_GAMES"
    );
    return;
  }

  const game = {
    type: "seek",
    owner: self._id,
    wild: wild,
    rating_type: rating_type,
    time: time,
    inc: inc,
    rated: rated,
    autoaccept: autoaccept
  };

  if (!!color) game.color = color;
  if (!!minrating) game.minrating = minrating;
  if (!!maxrating) game.maxrating = maxrating;
  if (!!formula) game.formula = formula;

  return GameRequestCollection.insert(game);
};

GameRequests.removeLegacySeek = function(message_identifier, seek_index) {
  check(message_identifier, String);
  check(seek_index, Number);
  const self = Meteor.user();
  check(self, Object);
  if (!self) throw new ICCMeteorError(message_identifier, "self is null");
  const request = GameRequestCollection.findOne({ legacy_index: seek_index });
  if (!request) return; // The doc says we could get removes for seeks we do not have.

  if (self._id !== request.owner)
    throw new ICCMeteorError(
      message_identifier,
      "Cannot remove another users game seek"
    );
  GameRequestCollection.remove({ _id: request._id });
};

GameRequests.removeGameSeek = function(message_identifier, seek_id) {
  const self = Meteor.user();
  check(message_identifier, String);
  check(seek_id, String);
  check(self, Object);

  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to find seek with id " + seek_id
    );

  if (self._id !== request.owner)
    throw new ICCMeteorError(
      message_identifier,
      "Cannot remove another users game seek"
    );

  if (request.type !== "seek")
    throw new ICCMeteorError(
      message_identifier,
      "Cannot remove this seek. It is of type '" +
        request.type +
        "' and must be of type 'seek'"
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
    throw new ICCMeteorError(
      message_identifier,
      "Unable to find seek with id " + seek_id
    );
  if (self._id === request.owner)
    throw new ICCMeteorError(
      message_identifier,
      "Cannot accept a seek from yourself"
    );
  if (request.type !== "seek")
    throw new ICCMeteorError(
      message_identifier,
      "Cannot accept a non-local seek"
    );
  if (
    !Roles.userIsInRole(
      self,
      request.rated ? "play_rated_games" : "play_unrated_games"
    )
  )
    ClientMessages.sendMessageToClient(
      self,
      message_identifier,
      "UNABLE_TO_PLAY" + (request.rated ? "" : "UN") + "RATED_GAMES"
    );

  const challenger = Meteor.users.findOne({ _id: request.owner });
  const game_id = Game.startLocalGame(
    message_identifier,
    challenger,
    request.wild,
    request.rating_type,
    request.rated,
    request.time,
    request.inc,
    request.time,
    request.inc,
    true,
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
  check(challenger_established, Number);
  check(challenger_titles, String);
  check(receiver_name, String);
  check(receiver_rating, Number);
  check(receiver_established, Number);
  check(receiver_titles, String);
  check(wild_number, Number);
  check(rating_type, String);
  check(is_it_rated, Number);
  check(is_it_adjourned, Number);
  check(challenger_time, Number);
  check(challenger_inc, Number);
  check(receiver_time, Number);
  check(receiver_inc, Number);
  check(challenger_color_request, String);
  check(assess_loss, String);
  const challenger_user = Meteor.users.findOne({
    "profile.legacy.username": challenger_name,
    "profile.legacy.validated": true
  });
  const receiver_user = Meteor.users.findOne({
    "profile.legacy.username": receiver_name,
    "profile.legacy.validated": true
  });

  const record = {
    type: "legacymatch",
    challenger: challenger_name.username,
    challenger_rating: challenger_rating,
    challenger_established: challenger_established === "1",
    challenger_titles: challenger_titles,
    receiver: receiver_name,
    receiver_rating: receiver_rating,
    receiver_established: receiver_established === "1",
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
  switch (challenger_color_request) {
    case 0:
      record.challenger_color_request = "black";
      break;
    case 1:
      record.challenger_color_request = "white";
      break;
    default:
      break;
  }

  if (!!challenger_user) record.challenger_id = challenger_user._id;
  if (!!receiver_user) record.receiver_id = receiver_user._id;

  GameRequestCollection.insert(record);
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
  challenger_inc,
  receiver_time,
  receiver_inc,
  challenger_color_request,
  assess_loss,
  assess_draw,
  assess_win,
  fancy_time_control
) {
  const challenger_user = Meteor.user();
  check(challenger_user, Object);
  check(message_identifier, String);
  check(receiver_user, Object);
  check(wild_number, Number);
  check(rating_type, String);
  check(is_it_rated, Boolean);
  check(is_it_adjourned, Boolean);
  check(challenger_time, Number);
  check(challenger_inc, Number);
  check(receiver_time, Number);
  check(receiver_inc, Number);
  check(challenger_color_request, Match.Maybe(String));
  check(assess_loss, Number);
  check(assess_draw, Number);
  check(assess_win, Number);
  check(fancy_time_control, Match.Maybe(String));
  if (parseInt(wild_number) !== 0)
    throw new ICCMeteorError(message_identifier, "Wild must be zero");
  if (
    challenger_color_request != null &&
    challenger_color_request !== "white" &&
    challenger_color_request !== "black"
  ) {
    throw new ICCMeteorError(
      message_identifier,
      "challenger_color_request must be null, 'black' or 'white'"
    );
  }

  if (challenger_user.ratings[rating_type] === undefined)
    throw new ICCMeteorError(
      message_identifier,
      "Unknown rating type " + rating_type
    );

  const role = is_it_rated ? "play_rated_games" : "play_unrated_games";

  if (!Roles.userIsInRole(challenger_user, role))
    throw new ICCMeteorError(message_identifier, "not_in_role", role);
  if (!Roles.userIsInRole(receiver_user, role))
    throw new ICCMeteorError(message_identifier, "not_in_role", role);

  const record = {
    type: "match",
    challenger: challenger_user.username,
    challenger_rating: challenger_user.ratings[rating_type].rating,
    challenger_titles: [], // TODO: ditto
    challenger_established: established(challenger_user.ratings[rating_type]),
    receiver: receiver_user.username,
    receiver_rating: receiver_user.ratings[rating_type].rating,
    receiver_established: established(receiver_user.ratings[rating_type]),
    receiver_titles: [], // TODO: ditto
    wild_number: wild_number,
    rating_type: rating_type,
    rated: is_it_rated,
    adjourned: is_it_adjourned, // TODO: We have to figure this out too
    challenger_time: challenger_time,
    challenger_inc: challenger_inc,
    receiver_time: receiver_time,
    receiver_inc: receiver_inc,
    challenger_color_request: challenger_color_request, // TODO: We have to figure this out too
    assess_loss: assess_loss, // TODO: We have to figure this out too
    assess_draw: assess_draw, // TODO: We have to figure this out too
    assess_win: assess_win, // TODO: We have to figure this out too
    fancy_time_control: fancy_time_control // TODO: We have to figure this out too
  };

  if (!!challenger_user) record.challenger_id = challenger_user._id;
  if (!!receiver_user) record.receiver_id = receiver_user._id;

  return GameRequestCollection.insert(record);
};

GameRequests.acceptMatchRequest = function(message_identifier, game_id) {};

GameRequests.declineMatchRequest = function(message_identifier, game_id) {};

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
  if (!self)
    throw new ICCMeteorError(message_identifier, "self is null or invalid");
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
  GameRequestCollection.remove({
    $and: [
      { challenger_name: challenger_name },
      { receiver_name: receiver_name }
    ]
  });
  ClientMessages.sendMessageToClient(
    Meteor.user(),
    "LEGACY_MATCH_REMOVED",
    explanation_string
  );
};

Meteor.methods({
  "game.requestlegacymatch"(
    message_identifier,
    name,
    time,
    increment,
    time2,
    increment2,
    rated,
    wild,
    color
  ) {
    check(message_identifier, String);
    check(name, String);
    check(time, Number);
    check(increment, Number);
    check(time2, Number);
    check(increment2, Number);
    check(rated, Boolean);
    check(wild, Number);
    check(color, String);
    const us = Meteor.user();

    if (!us) {
      throw new ICCMeteorError(message_identifier, "not-authorized");
    }

    const our_legacy_user = LegacyUser.find(us._id);
    if (!our_legacy_user)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to find a legacy user object for " + us.name
      );

    our_legacy_user.match(
      message_identifier,
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
});

Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) {
    GameRequests.collection = GameRequestCollection;
  }
});
