import SimpleSchema from "simpl-schema";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

const RatingSchema = new SimpleSchema({
  wild_number: { type: Array },
  "wild_number.$": Number,
  rating_type: String,
  rated: Boolean,
  unrated: Boolean,
  white_initial: { type: Array, minCount: 2, maxCount: 2 },
  "white_initial.$": Number,
  white_increment_or_delay: { type: Array, minCount: 2, maxCount: 2 },
  "white_increment_or_delay.$": Number,
  white_increment_or_delay_type: Array,
  "white_increment_or_delay_type.$": {
    type: String,
    allowedValues: ["none", "us", "bronstein", "inc"]
  },
  white_etime: { type: Array, minCount: 2, maxCount: 2 },
  "white_etime.$": Number,
  black_initial: { type: Array, minCount: 2, maxCount: 2 },
  "black_initial.$": Number,
  black_increment_or_delay: { type: Array, minCount: 2, maxCount: 2 },
  "black_increment_or_delay.$": Number,
  black_increment_or_delay_type: Array,
  "black_increment_or_delay_type.$": {
    type: String,
    allowedValues: ["none", "us", "bronstein", "inc"]
  },
  black_etime: { type: Array, minCount: 2, maxCount: 2 },
  "black_etime.$": Number,
  specify_color: Boolean,
  can_seek: Boolean,
  can_match: Boolean,
  default_rating: Number
});

const DynamicRatingsCollection = new Mongo.Collection("ratings");
DynamicRatingsCollection.attachSchema(RatingSchema);

export const DynamicRatings = {};

function validateAndFillRatingObject(message_identifier, obj) {
  check(message_identifier, String);
  check(obj, Object);

  if (obj.initial && (!Array.isArray(obj.initial) || obj.initial.length !== 2))
    throw new ICCMeteorError(message_identifier, "Initial time must be an array of 'low, high'");
  if (obj.increment && (!Array.isArray(obj.increment) || obj.increment.length !== 2))
    throw new ICCMeteorError(message_identifier, "Increment/delay must be an array of 'low, high'");
  if (obj.etime && (!Array.isArray(obj.etime) || obj.etime.length !== 0))
    throw new ICCMeteorError(message_identifier, "etime must be an array of 'low, high'");

  if (obj.increment && !obj.increment_type)
    throw new ICCMeteorError(
      message_identifier,
      "increment/delay type must be specified if increment/delay is specified"
    );
  if (obj.increment_type && !Array.isArray(obj.increment_type))
    throw new ICCMeteorError(
      message_identifier,
      "increment/delay type must be an array of allowed increment/delay types"
    );

  if (obj.initial && obj.initial[0] > obj.initial[1])
    throw new ICCMeteorError(message_identifier, "Initial time must be an array of 'low, high'");
  if (obj.increment && obj.increment[0] > obj.increment[1])
    throw new ICCMeteorError(message_identifier, "Increment/delay must be an array of 'low, high'");
  if (obj.etime && obj.etime[0] > obj.etime[1])
    throw new ICCMeteorError(message_identifier, "etime must be an array of 'low, high'");

  const unique = [];
  const dups = [];
  obj.increment_type.forEach(type => {
    if (unique.indexOf(type) === -1) unique.push(type);
    else dups.push(type);
  });

  if (dups.length !== 0)
    throw new ICCMeteorError(message_identifier, "increment/delay has duplicate entries.");

  if (
    (!obj.increment || obj.increment[1]) &&
    (obj.increment_type && obj.increment.length === 1 && obj.increment[0] === "none")
  )
    throw new ICCMeteorError(
      message_identifier,
      "increment/delay type must have at least one option when increment is available"
    );

  if (obj.initial || obj.increment) {
    if (obj.etime) {
      // validate initial+inc = etime
      const calculated_low_etime = Math.round(obj.initial[0] + (2 * obj.increment[0]) / 3);
      const calculated_high_etime = Math.round(obj.initial[1] + (2 * obj.increment[1]) / 3);
      if (calculated_low_etime < obj.etime[0])
        throw new ICCMeteorError(
          message_identifier,
          "etime does not match",
          "etime of " +
            calculated_low_etime +
            " is lower than specified low etime of " +
            obj.etime[0]
        );
      if (calculated_high_etime > obj.etime[0])
        throw new ICCMeteorError(
          message_identifier,
          "etime does not match",
          "etime of " +
            calculated_high_etime +
            " is lower than specified low etime of " +
            obj.etime[1]
        );
    } else {
      // time = initial + inc
      obj.etime = [
        Math.trunc(obj.initial[0] + (2 * obj.increment[0]) / 3),
        Math.round(obj.initial[1] + (2 * obj.increment[1]) / 3)
      ];
    }
  } else if (obj.time) {
    // !obj.initial && !obj.increment
    // initial and inc = etime
    obj.initial = [0, obj.etime];
    obj.increment = [0, Math.trunc(3 * obj.etime) / 2];
    if (!obj.increment_type) {
      if (obj.increment[1]) obj.increment_type = ["us", "inc", "bronstein"];
      if (!obj.increment[0]) obj.increment_type.push("none");
    }
  } else {
    throw new ICCMeteorError(
      message_identifier,
      "Initial, increment, and etime cannot all be null"
    );
  }
  return obj;
}

DynamicRatings.addRatingType = function(
  message_identifier,
  wild_number,
  rating_type,
  rated,
  unrated,
  white_initial,
  white_increment_or_delay,
  white_increment_or_delay_type,
  white_etime,
  black_initial,
  black_increment_or_delay,
  black_increment_or_delay_type,
  black_etime,
  specify_color,
  can_seek,
  can_match,
  starting_rating
) {
  check(message_identifier, String);
  check(wild_number, Match.Maybe([Number]));
  check(rating_type, String);
  check(rated, Boolean);
  check(unrated, Boolean);
  check(white_initial, Match.Maybe([Number]));
  check(white_increment_or_delay, Match.Maybe([Number]));
  check(white_increment_or_delay_type, Match.Maybe([String]));
  check(white_etime, Match.Maybe([Number]));
  check(black_initial, Match.Maybe([Number]));
  check(black_increment_or_delay, Match.Maybe([Number]));
  check(black_increment_or_delay_type, Match.Maybe([String]));
  check(black_etime, Match.Maybe([Number]));
  check(specify_color, Boolean);
  check(can_seek, Boolean);
  check(can_match, Boolean);
  check(starting_rating, Match.Maybe(Number));

  if (!starting_rating) starting_rating = 1600;
  wild_number = wild_number || [0];
  if (wild_number.length !== 1 || wild_number[0] !== 0)
    throw new Match.Error("wild_number can only be zero");
  if (!rated && !unrated)
    throw new Match.Error("Unusable rating type. Both rated and unrated are false");

  const whiteRatingObject = validateAndFillRatingObject(message_identifier, {
    initial: white_initial,
    increment: white_increment_or_delay,
    increment_type: white_increment_or_delay_type,
    etime: white_etime
  });

  const blackRatingObject = validateAndFillRatingObject(message_identifier, {
    initial: black_initial,
    increment: black_increment_or_delay,
    increment_type: black_increment_or_delay_type,
    etime: black_etime
  });

  DynamicRatingsCollection.insert({
    wild_number: wild_number,
    rating_type: rating_type,
    rated: rated,
    unrated: unrated,
    white_initial: whiteRatingObject.initial,
    white_increment_or_delay: whiteRatingObject.increment,
    white_increment_or_delay_type: white_increment_or_delay_type,
    white_etime: whiteRatingObject.etime,
    black_initial: blackRatingObject.initial,
    black_increment_or_delay: blackRatingObject.increment,
    black_increment_or_delay_type: white_increment_or_delay_type,
    black_etime: blackRatingObject.etime,
    specify_color: specify_color,
    can_seek: can_seek,
    can_match: can_match,
    default_rating: starting_rating
  });

  const setobject = {};
  setobject["ratings." + rating_type] = {
    rating: starting_rating,
    need: 0,
    won: 0,
    draw: 0,
    lost: 0,
    best: 0
  };
  Meteor.users.update({}, { $set: setobject });
};

DynamicRatings.deleteRatingType = function(rating_type) {
  check(rating_type, String);
  const unsetobject = {};
  unsetobject["rating" + rating_type] = 1;
  Meteor.users.update({}, { $unset: unsetobject });
};

DynamicRatings.updateCanSeek = function(rating_type, can_seek) {};
DynamicRatings.updateCanMatch = function(rating_type, can_match) {};

DynamicRatings.getUserRatingsObject = function() {
  const ratingRecords = DynamicRatingsCollection.find(
    {},
    { fields: { rating_type: 1, default_rating: 1 } }
  ).fetch();
  const ratingobject = {};

  ratingRecords.forEach(rr => {
    ratingobject[rr.rating_type] = {
      rating: rr.default_rating,
      need: 0,
      won: 0,
      draw: 0,
      lost: 0,
      best: 0
    };
  });
  return ratingobject;
};

DynamicRatings.meetsRatingTypeRules = function(
  message_identifier,
  color,
  rating_type,
  time,
  inc_or_delay,
  inc_or_delay_type,
  rated,
  check_type
) {
  const rating_object = DynamicRatingsCollection.findOne({ rating_type: rating_type });

  check(message_identifier, String);
  check(color, String);
  check(rating_type, String);
  check(time, Number);
  check(inc_or_delay, Number);
  check(inc_or_delay_type, String);
  check(rated, Boolean);
  check(check_type, String);

  if (color !== "white" && color !== "black")
    throw new ICCMeteorError(message_identifier, "Invalid call", "Invalid color");
  if (!rating_object)
    throw new ICCMeteorError(message_identifier, "Invalid call", "Invalid rating type");

  let initial;
  let inc;
  let inctype;
  let etime;
  const game_etime = Math.round(time + (2 * (inc_or_delay || 0)) / 3);

  if (color === "white") {
    initial = rating_object.white_initial;
    inc = rating_object.white_increment;
    inctype = rating_object.white_increment_or_delay_type;
    etime = rating_object.white_etime;
  } else {
    initial = rating_object.black_initial;
    inc = rating_object.black_increment;
    inctype = rating_object.black_increment_or_delay_type;
    etime = rating_object.black_etime;
  }

  if (inc === undefined) inc = 0;
  if (inctype === undefined) inctype = "none";

  if (inc && inctype === "none")
    throw new ICCMeteorError(
      message_identifier,
      "Invalid call",
      "Cannot specify inc/delay with a type of 'none'"
    );

  if (rated && !rating_object.rated) return false;
  if (!rated && !rating_object.unrated) return false;

  if (check_type === "match" && !rating_object.can_match) return false;
  if (check_type === "seek" && !rating_object.can_seek) return false;

  if (time < initial[0] || time > initial[1]) return false;
  if (inc < inc[0] || time > inc[1]) return false;
  if (inctype.indexOf(inc_or_delay) === -1) return false;
  return !(game_etime < etime[0] || game_etime > etime[1]);
};
