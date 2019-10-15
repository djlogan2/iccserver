import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";
import { Match, check } from "meteor/check";

export const GameRequestCollection = new Mongo.Collection("game_requests");

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
  const self = Meteor.user();
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
  check(wild, Number);
  check(time, Number);
  check(inc, Number);
  check(rated, Boolean);
  check(minrating, Match.Maybe(Number));
  check(maxrating, Match.Maybe(Number));
  check(autoaccept, Boolean);
  check(formula, Match.Maybe(String));
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  if (
    !Roles.userIsInRole(self, rated ? "play_rated_games" : "play_unrated_games")
  )
    throw new Meteor.Error("Unable to seek this game");
  GameRequestCollection.insert({
    type: "seek",
    owner: self._id,
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

GameRequests.removeLegacySeek = function(seek_index) {
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ legacy_index: seek_index });
  if (!request) return; // The doc says we could get removes for seeks we do not have.

  if (self._id !== request.owner._id)
    throw new Meteor.Error("Cannot remove another users game seek");
  GameRequestCollection.remove({ _id: request._id });
};

GameRequests.removeGameSeek = function(seek_id) {
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new Meteor.Error("Unable to find seek with id " + seek_id);
  if (self._id !== request.owner._id)
    throw new Meteor.Error("Cannot remove another users game seek");
  GameRequestCollection.remove({ _id: seek_id });
};

GameRequests.acceptGameSeek = function(seek_id) {
  const self = Meteor.user();
  if (!self) throw new Meteor.Error("self is null");
  const request = GameRequestCollection.findOne({ _id: seek_id });
  if (!request)
    throw new Meteor.Error("Unable to find seek with id " + seek_id);
  if (self._id === request.owner._id)
    throw new Meteor.Error("Cannot accept a seek from yourself");
  if (
    !Roles.userIsInRole(
      self,
      request.rated ? "play_rated_games" : "play_unrated_games"
    )
  )
    throw new Meteor.Error("Unable to accept seek: Not in role");

  const white = Game.determineWhite(self, request.owner, request.color);
  const black = white._id === self._id ? request.owner : self;
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
  challenger_color_request, // -1 for neither, 0 for black, 1 for white
  assess_loss /*,
  assess_draw,
  assess_win,
  fancy_time_control   It doesn't appear we actually get these from the server */
) {
  const args = arguments;
  log.debug("addLegacyMatchRequest: ", () => {
    JSON.stringify(args);
  });
  const challenger_user = Meteor.users.findOne({
    "profile.legacy.username": challenger_name
  });
  const receiver_user = Meteor.users.findOne({
    "profile.legacy.username": receiver_name
  });

  const record = {
    type: "legacymatch",
    challenger: challenger_name,
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
    assess_loss: assess_loss /*,
    assess_draw: assess_draw,
    assess_win: assess_win,
    fancy_time_control: fancy_time_control*/
  };

  switch (parseInt(challenger_color_request)) {
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
  if (!challenger_user) throw new Meteor.Error("Challenger is required");
  if (!receiver_user) throw new Meteor.Error("Receiver is required");
  if (parseInt(wild_number) !== 0) throw new Meteor.Error("Wild must be zero");
  if (typeof is_it_rated !== "boolean")
    throw new Meteor.Error("rated must be true or false");
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
  receiver_name
) {
  GameRequestCollection.remove({
    $and: [
      { challenger_name: challenger_name },
      { receiver_name: receiver_name }
    ]
  });
};
