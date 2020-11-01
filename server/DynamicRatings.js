import SimpleSchema from "simpl-schema";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Users } from "../imports/collections/users";
import { ClientMessages } from "../imports/collections/ClientMessages";

const RatingSchema = new SimpleSchema({
  wild_number: { type: Array },
  "wild_number.$": Number,
  rating_type: String,
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

const allowed_increment_types = ["none", "us", "inc", "bronstein"];

function validateAndFillRatingObject(message_identifier, obj) {
  check(message_identifier, String);
  check(obj, Object);

  if (obj.initial && (!Array.isArray(obj.initial) || obj.initial.length !== 2))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Initial time must be an array of 'low, high'"
    );
  if (obj.increment && (!Array.isArray(obj.increment) || obj.increment.length !== 2))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Increment/delay must be an array of 'low, high'"
    );
  if (obj.etime && (!Array.isArray(obj.etime) || obj.etime.length !== 2))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "etime must be an array of 'low, high'"
    );

  if (obj.increment && !obj.increment_type)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "increment/delay type must be specified if increment/delay is specified"
    );

  if (obj.increment_type && !Array.isArray(obj.increment_type))
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "increment/delay type must be an array of allowed increment/delay types"
    );

  if (obj.initial && obj.initial[0] > obj.initial[1])
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Initial time must be an array of 'low, high'"
    );
  if (obj.increment && obj.increment[0] > obj.increment[1])
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Increment/delay must be an array of 'low, high'"
    );
  if (obj.etime && obj.etime[0] > obj.etime[1])
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "etime must be an array of 'low, high'"
    );

  const unique = [];
  const dups = [];
  if (obj.increment_type)
    obj.increment_type.forEach(type => {
      if (allowed_increment_types.indexOf(type) === -1)
        throw new ICCMeteorError(
          message_identifier,
          "Unable to add rating",
          type + " is not an allowed increment/delay type"
        );
      if (unique.indexOf(type) === -1) unique.push(type);
      else dups.push(type);
    });

  if (dups.length !== 0)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "increment/delay has duplicate entries."
    );

  if (!!obj.increment && obj.increment[1]) {
    // have an increment and it's not [0,0]
    if (
      !obj.increment_type || // We have to have something,
      (obj.increment_type.length === 1 && obj.increment_type[0] === "none") // and other than "none"
    )
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add rating",
        "increment/delay type must have at least one option when increment is available"
      );
  }

  if (obj.initial && !obj.increment) obj.increment = [0, 0];

  if (obj.initial || obj.increment) {
    if (obj.etime) {
      // validate initial+inc = etime
      const calculated_low_etime = Math.round(obj.initial[0] + (2 * obj.increment[0]) / 3);
      const calculated_high_etime = Math.round(obj.initial[1] + (2 * obj.increment[1]) / 3);
      if (calculated_low_etime !== obj.etime[0])
        throw new ICCMeteorError(
          message_identifier,
          "Unable to add rating",
          "etime does not match",
          "etime of " +
            calculated_low_etime +
            " is not equal to the specified low etime of " +
            obj.etime[0]
        );
      if (calculated_high_etime !== obj.etime[1])
        throw new ICCMeteorError(
          message_identifier,
          "Unable to add rating",
          "etime does not match",
          "etime of " +
            calculated_high_etime +
            " is is not equal to the specified high etime of " +
            obj.etime[1]
        );
    } else {
      // time = initial + inc
      obj.etime = [
        Math.trunc(obj.initial[0] + (2 * obj.increment[0]) / 3),
        Math.round(obj.initial[1] + (2 * obj.increment[1]) / 3)
      ];
    }
  } else if (obj.etime) {
    // !obj.initial && !obj.increment
    // initial and inc = etime
    const require_increment = !!obj.increment_type && obj.increment_type.indexOf("none") === -1;
    const increment_disallowed =
      !!obj.increment_type && obj.increment_type.length === 1 && obj.increment_type[0] === "none";

    obj.initial = [0, obj.etime[1] - (require_increment ? 1 : 0)];
    if (increment_disallowed) obj.increment = [0, 0];
    else obj.increment = [require_increment ? 1 : 0, Math.trunc((3 * obj.etime[1]) / 2)];
    if (!obj.increment_type) {
      if (obj.increment[1]) obj.increment_type = ["us", "inc", "bronstein"];
      if (!obj.increment[0]) obj.increment_type.push("none");
    }
  } else {
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Initial, increment, and etime cannot all be null"
    );
  }
  if (obj.increment[0]) {
    if (obj.increment_type.indexOf("none") !== -1)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add rating",
        "'none' cannot be specified when inc/delay is required"
      );
  } else {
    //!obj.increment[0]
    if (obj.increment_type.indexOf("none") === -1)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add rating",
        "'none' is required when inc/delay can be zero"
      );
  }
  if (obj.increment[1]) {
    if (obj.increment_type.length === 1 && obj.increment_type[0] === "none")
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add rating",
        "increment or delay types are required when inc/delay can be non-zero"
      );
  } else {
    // !obj.increment[1]
    if (obj.increment_type.length !== 1 || obj.increment_type[0] !== "none")
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add rating",
        "'none' must be the only rating type when inc/delay cannot be set"
      );
  }
  return obj;
}

//
// This was put in because Ruy did not want users to choose a rating category
// in the client. Thus, the rating category must be determined by finding a
// unique set of time controls, resulting in only one record.
// This overlap check and fail must remain in here until the business --
// and yes, until -- the business decides it wants multiple rating categories,
// and they have the front end changed so that a rating category is actually
// picked by a user.
//
function overlaps(obj1, obj2) {
  //
  // If one or the other is null, no overlap
  //
  if (!obj1) return !obj2;
  if (!obj2) return false;

  //
  // If one of the other is empty, no overlap
  //
  if (!obj1.length || !obj2.length) return false;

  if (typeof obj1[0] === "string") {
    // Strings, probably increment/delay type
    // Just make sure there are no matching elements
    return obj1.some(o1 => obj2.some(o2 => o1 === o2));
  } else {
    // Ints, should be etime. Need to make sure
    // both sets [low1, high1] <-> [low2, high2]
    // have no overlap
    let overlap = obj1.some(value => value >= obj2[0] && value <= obj2[1]);
    return overlap || obj2.some(value => value >= obj1[0] && value <= obj1[1]);
  }
}

DynamicRatings.addRatingType = function(
  message_identifier,
  wild_number,
  rating_type,
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
  const self = Meteor.user();
  check(self, Object);

  check(message_identifier, String);
  check(wild_number, Match.Maybe([Number]));
  check(rating_type, String);
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

  if (!Users.isAuthorized(self, "add_dynamic_rating"))
    throw new ICCMeteorError(message_identifier, "Unable to add rating", "User not authorized");

  if (DynamicRatingsCollection.find({ rating_type: rating_type }).count() !== 0)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to add rating",
      "Rating type already exists"
    );

  if (!starting_rating) starting_rating = 1600;
  wild_number = wild_number || [0];
  if (wild_number.length !== 1 || wild_number[0] !== 0)
    throw new Match.Error("wild_number can only be zero");

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

  let overlap;
  DynamicRatingsCollection.find({
    wild_number: { $in: wild_number }
  })
    .fetch()
    .forEach(rating => {
      if (
        overlaps(whiteRatingObject.increment_type, rating.white_increment_or_delay_type) &&
        overlaps(whiteRatingObject.etime, rating.white_etime)
      ) {
        overlap = rating["rating_type"];
      }
      if (
        overlaps(blackRatingObject.increment_type, rating.black_increment_or_delay_type) &&
        overlaps(blackRatingObject.etime, rating.black_etime)
      ) {
        overlap = rating["rating_type"];
      }
    });

  if (!!overlap) {
    ClientMessages.sendMessageToClient(self, message_identifier, "OVERLAPPING_RATING", overlap);
    return;
  }

  DynamicRatingsCollection.insert({
    wild_number: wild_number,
    rating_type: rating_type,
    white_initial: whiteRatingObject.initial,
    white_increment_or_delay: whiteRatingObject.increment,
    white_increment_or_delay_type: whiteRatingObject.increment_type,
    white_etime: whiteRatingObject.etime,
    black_initial: blackRatingObject.initial,
    black_increment_or_delay: blackRatingObject.increment,
    black_increment_or_delay_type: blackRatingObject.increment_type,
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
  Meteor.users.update({}, { $set: setobject }, { multi: true });
};

DynamicRatings.deleteRatingType = function(message_identifier, rating_type) {
  const self = Meteor.user();
  check(self, Object);
  check(message_identifier, String);
  check(rating_type, String);

  if (!Users.isAuthorized(self, "delete_dynamic_rating"))
    throw new ICCMeteorError(message_identifier, "Unable to add rating", "User not authorized");

  const unsetobject = {};
  unsetobject["ratings." + rating_type] = 1;
  Meteor.users.update({}, { $unset: unsetobject }, { multi: true });
};

DynamicRatings.updateCanSeek = function(message_identifier, rating_type, can_seek) {};
DynamicRatings.updateCanMatch = function(message_identifier, rating_type, can_match) {};

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
  check_type,
  color_specified
) {
  check(message_identifier, String);
  check(color, String);
  check(rating_type, String);
  check(time, Number);
  check(inc_or_delay, Number);
  check(inc_or_delay_type, String);
  check(check_type, String);
  check(color_specified, Boolean);

  if (color !== "white" && color !== "black")
    throw new ICCMeteorError(message_identifier, "Invalid call", "Invalid color");

  const rating_object = DynamicRatingsCollection.findOne({ rating_type: rating_type });

  if (!rating_object)
    throw new ICCMeteorError(message_identifier, "Invalid call", "Invalid rating type");

  let initial;
  let inc;
  let inctype;
  let etime;
  const game_etime = Math.round(time + (2 * (inc_or_delay || 0)) / 3);

  if (color_specified && !rating_object.specify_color)
    throw new ICCMeteorError(message_identifier, "Invalid call", "Cannot specify color");

  if (color === "white") {
    initial = rating_object.white_initial;
    inc = rating_object.white_increment_or_delay;
    inctype = rating_object.white_increment_or_delay_type;
    etime = rating_object.white_etime;
  } else {
    initial = rating_object.black_initial;
    inc = rating_object.black_increment_or_delay;
    inctype = rating_object.black_increment_or_delay_type;
    etime = rating_object.black_etime;
  }

  if (inc === undefined) inc = [0, 0];
  if (inctype === undefined) inctype = "none";

  if (inc && inctype === "none")
    throw new ICCMeteorError(
      message_identifier,
      "Invalid call",
      "Cannot specify inc/delay with a type of 'none'"
    );

  if (check_type === "match" && !rating_object.can_match) return false;
  if (check_type === "seek" && !rating_object.can_seek) return false;

  if (time < initial[0] || time > initial[1]) return false;
  if (inc_or_delay < inc[0] || inc_or_delay > inc[1]) return false;
  if (inctype.indexOf(inc_or_delay_type) === -1) return false;
  return !(game_etime < etime[0] || game_etime > etime[1]);
};

Meteor.publish("DynamicRatings", function() {
  return DynamicRatingsCollection.find();
});

DynamicRatings.collection = DynamicRatingsCollection;

Meteor.startup(function() {
  if (!Meteor.isTest && !Meteor.isAppTest && DynamicRatingsCollection.find().count() === 0) {
    DynamicRatingsCollection.insert({
      wild_number: 0,
      rating_type: "bullet",
      white_initial: [0, 2],
      white_increment_or_delay: [0, 4],
      white_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      white_etime: [0, 2],
      black_initial: [0, 2],
      black_increment_or_delay: [0, 4],
      black_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      black_etime: [0, 2],
      specify_color: true,
      can_seek: true,
      can_match: true,
      default_rating: 1600
    });
    DynamicRatingsCollection.insert({
      wild_number: 0,
      rating_type: "blitz",
      white_initial: [0, 14],
      white_increment_or_delay: [0, 21],
      white_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      white_etime: [3, 14],
      black_initial: [0, 14],
      black_increment_or_delay: [0, 21],
      black_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      black_etime: [3, 14],
      specify_color: true,
      can_seek: true,
      can_match: true,
      default_rating: 1600
    });
    DynamicRatingsCollection.insert({
      wild_number: 0,
      rating_type: "standard",
      white_initial: [0, 600],
      white_increment_or_delay: [0, 900],
      white_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      white_etime: [15, 600],
      black_initial: [0, 600],
      black_increment_or_delay: [0, 900],
      black_increment_or_delay_type: ["none", "inc", "us", "bronstein"],
      black_etime: [15, 600],
      specify_color: true,
      can_seek: true,
      can_match: true,
      default_rating: 1600
    });
    Meteor.users.update(
      {},
      {
        $set: {
          "ratings.bullet": { rating: 1600, need: 0, won: 0, draw: 0, lost: 0, best: 0 },
          "ratings.blitz": { rating: 1600, need: 0, won: 0, draw: 0, lost: 0, best: 0 },
          "ratings.standard": { rating: 1600, need: 0, won: 0, draw: 0, lost: 0, best: 0 }
        }
      },
      { multi: true }
    );
  }
});
