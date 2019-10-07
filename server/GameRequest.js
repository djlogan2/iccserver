import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Roles } from "meteor/alanning:roles";
/** Todo: temporary change name of collection   */
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

//
export function legacyGameSeek(
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
  formula,
  fancy_time_control
) {}

export function addLegacyGameRequest(
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
  log.debug("addLegacyGameRequest: ", () => {
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
}

function established(rating_object) {
  return rating_object.won + rating_object.draw + rating_object.lost >= 20;
}

export function addLocalGameRequest(
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
  if (wild_number !== "0") throw new Meteor.Error("Wild must be zero");
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
    type: "localmatch",
    challenger: challenger_user.username,
    challenger_rating: challenger_user.ratings[rating_type].rating,
    challenger_titles: [], // TODO: ditto
    challenger_established: established(challenger_user.ratings[rating_type]),
    receiver: receiver_user.user.username,
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

  GameRequestCollection.insert(record);
}

export function removeLegacyMatchRequest(
  challenger_name,
  receiver_name,
  explanation_string
) {
  log.debug(
    "Legacy match removed between " +
      challenger_name +
      " and " +
      receiver_name +
      ": " +
      explanation_string
  );
  GameRequestCollection.remove({
    $and: [
      { challenger_name: challenger_name },
      { receiver_name: receiver_name }
    ]
  });
}
