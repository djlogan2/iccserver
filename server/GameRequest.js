import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";

import { Match, check } from "meteor/check";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { Game } from "./Game";

const GameRequestCollection = new Mongo.Collection("game_requests");

Meteor.startup(function() {
  GameRequestCollection.remove({}); // Start off with a clean collection upon startup
});

Meteor.publish("game_requests", function() {
  if (!this.userId) return [];
  return GameRequestCollection.find({
    $or: [{ challenger_id: this.userId }, { receiver_id: this.userId }]
  });
});

let log = new Logger("server/GameRequest_js");

export const GameRequests = {};
//
GameRequests.addLegacyGameSeek = function(
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
  check(index, Number);
  check(name, String);
  check(titles, String);
  check(rating, Number);
  check(provisional_status, Number);
  check(wild, Number);
  check(rating_type, String);
  check(time, Number);
  check(inc, Number);
  check(rated, Boolean);
  check(color, String);
  check(minrating, Number);
  check(maxrating, Number);
  check(autoaccept, Boolean);
  check(formula, String);
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null or invalid");
  if (GameRequestCollection.find({ legacy_index: index }).count() > 0)
    //throw new Meteor.Error("Index already exists");

    GameRequestCollection.insert({
      type: "legacyseek",
      owner: self._id,
      legacy_index: index,
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
    });
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
  if (!self) throw new Meteor.Error("self is null");
  if (wild !== 0) throw new Match.Error(wild + " is an invalid wild type");
  if (color !== null && color !== "white" && color !== "black")
    throw new Match.Error("Invalid color specification");
  if (!SystemConfiguration.meetsTimeAndIncRules(time, inc))
    throw new Meteor.Error(
      "seek fails to meet time and increment configuration rules"
    );
  if (!self.ratings[rating_type]) throw new Meteor.Error("Invalid rating type");
  if (!SystemConfiguration.meetsRatingTypeRules(rating_type, time, inc))
    throw new Meteor.Error(
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
    throw new Meteor.Error(
      "seek fails to meet minimum or maximum rating rules"
    );
  if (!!formula) throw new Meteor.Error("Formula is not yet supported");

  if (
    !Roles.userIsInRole(self, rated ? "play_rated_games" : "play_unrated_games")
  ) {
    ClientMessages.sendMessageToClient(
      Meteor.user(),
      message_identifier,
      rated ? "UNABLE_TO_PLAY_RATED_GAMES" : "UNABLE_TO_PLAY_UNRATED_GAMES"
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

  GameRequestCollection.insert(game);
};

GameRequests.removeLegacySeek = function(seek_index) {
  check(seek_index, Number);
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ legacy_index: seek_index });
  if (!request) return; // The doc says we could get removes for seeks we do not have.

  if (self._id !== request.owner)
    throw new Meteor.Error("Cannot remove another users game seek");
  GameRequestCollection.remove({ _id: request._id });
};

GameRequests.removeGameSeek = function(seek_id) {
  check(seek_id, Meteor.Collection.ObjectID);
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new Meteor.Error("Unable to find seek with id " + seek_id);
  if (self._id !== request.owner)
    throw new Meteor.Error("Cannot remove another users game seek");
  GameRequestCollection.remove({ _id: seek_id });
};

GameRequests.acceptGameSeek = function(seek_id) {
  check(seek_id, Meteor.Collection.ObjectID);
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new Meteor.Error("Unable to find seek with id " + seek_id);
  if (self._id === request.owner)
    throw new Meteor.Error("Cannot accept a seek from yourself");
  if (
    !Roles.userIsInRole(
      self,
      request.rated ? "play_rated_games" : "play_unrated_games"
    )
  )
    throw new Meteor.Error("Unable to accept seek: Not in role");

  const owner_user = Meteor.users.findOne({ _id: request.owner });
  const white = Game.determineWhite(self, owner_user, request.color);
  const black = white._id === self._id ? owner_user : self;
  const game_id = Game.startLocalGame(
    self,
    white,
    black,
    request.wild,
    request.rating_type,
    request.rated,
    request.time,
    request.inc,
    request.time,
    request.inc,
    true
  );
  GameRequestCollection.remove({ _id: seek_id });
  return game_id;
};

//
//-----------------------------------------------------------------------------
//
GameRequests.addLegacyMatchRequest = function(
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
    "profile.legacy.username": challenger_name
  });
  const receiver_user = Meteor.users.findOne({
    "profile.legacy.username": receiver_name
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
  challenger_user,
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
  check(challenger_user, Object);
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
  if (parseInt(wild_number) !== 0) throw new Meteor.Error("Wild must be zero");
  if (
    challenger_color_request != null &&
    challenger_color_request !== "white" &&
    challenger_color_request !== "black"
  ) {
    throw new Meteor.Error(
      "challenger_color_request must be null, 'black' or 'white'"
    );
  }

  if (challenger_user.ratings[rating_type] === undefined)
    throw new Meteor.Error("Unknown rating type " + rating_type);

  const role = is_it_rated ? "play_rated_games" : "play_unrated_games";

  if (!Roles.userIsInRole(challenger_user, role))
    throw new Meteor.Error("not_in_role", role);
  if (!Roles.userIsInRole(receiver_user, role))
    throw new Meteor.Error("not_in_role", role);

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

GameRequests.acceptMatchRequest = function(game_id) {};

GameRequests.declineMatchRequest = function(game_id) {};

GameRequests.removeLegacyMatchRequest = function(
  challenger_name,
  receiver_name,
  explanation_string
) {
  check(challenger_name, String);
  check(receiver_name, String);
  check(explanation_string, String);
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null or invalid");
  if (!self.profile || !self.profile.legacy || !self.profile.legacy.username)
    throw new Meteor.Error(
      "User is neither challenger nor receiver of removed match"
    );
  if (
    self.profile.legacy.username !== challenger_name &&
    self.profile.legacy.username !== receiver_name
  )
    throw new Meteor.Error(
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

Meteor.startup(function() {
  if (Meteor.isTest || Meteor.isAppTest) {
    GameRequests.collection = GameRequestCollection;
  }
});
