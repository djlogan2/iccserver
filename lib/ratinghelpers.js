import { get } from "lodash";

const allowed_increment_types = ["none", "us", "inc", "bronstein"];

//
// This was put in because Ruy did not want users to choose a rating category
// in the client. Thus, the rating category must be determined by finding a
// unique set of time controls, resulting in only one record.
// This overlap check and fail must remain in here until the business --
// and yes, until -- the business decides it wants multiple rating categories,
// and they have the front end changed so that a rating category is actually
// picked by a user.
//
export function RatingOverlaps(whiteRatingObject, blackRatingObject, ratingRecord) {
  if (
    overlaps(whiteRatingObject.increment_type, ratingRecord.white_increment_or_delay_type) &&
    overlaps(whiteRatingObject.etime, ratingRecord.white_etime)
  ) {
    return ratingRecord.rating_type;
  }
  if (
    overlaps(blackRatingObject.increment_type, ratingRecord.black_increment_or_delay_type) &&
    overlaps(blackRatingObject.etime, ratingRecord.black_etime)
  ) {
    return ratingRecord.rating_type;
  }
}

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

//
// TODO: In thinking about this, having the color is stupid. What makes a rating record
//       unique is etime for white AND black, inc-type, and the wild type.
//       Have to remove color and have callers send in both white and black parameters.
//
export function findRatingObject(
  wild_type,
  color,
  initial,
  increment,
  increment_type,
  ratings_records
) {
  const matches = ratings_records.filter(rr => {
    if (!rr.wild_number.some(wt => wt === wild_type)) return false;
    const etime = Math.round(initial + (increment_type === "none" ? 0.0 : (2.0 * increment) / 3.0));
    if (color === "white") {
      if (rr.white_etime[0] > etime || rr.white_etime[1] < etime) return false;
      return rr.white_increment_or_delay_type.some(iodt => iodt === increment_type);
    } else {
      if (rr.black_etime[0] > etime || rr.black_etime[1] < etime) return false;
      return rr.black_increment_or_delay_type.some(iodt => iodt === increment_type);
    }
  });
  if (!matches || !matches.length) return;
  return matches[0];
}

export function validateAndFillRatingObject(obj) {
  if (obj.initial && (!Array.isArray(obj.initial) || obj.initial.length !== 2))
    throw new Meteor.Error("Unable to add rating", "Initial time must be an array of 'low, high'");
  if (obj.increment && (!Array.isArray(obj.increment) || obj.increment.length !== 2))
    throw new Meteor.Error(
      "Unable to add rating",
      "Increment/delay must be an array of 'low, high'"
    );
  if (obj.etime && (!Array.isArray(obj.etime) || obj.etime.length !== 2))
    throw new Meteor.Error("Unable to add rating", "etime must be an array of 'low, high'");

  if (obj.increment && !obj.increment_type)
    throw new Meteor.Error(
      "Unable to add rating",
      "increment/delay type must be specified if increment/delay is specified"
    );

  if (obj.increment_type && !Array.isArray(obj.increment_type))
    throw new Meteor.Error(
      "Unable to add rating",
      "increment/delay type must be an array of allowed increment/delay types"
    );

  if (obj.initial && obj.initial[0] > obj.initial[1])
    throw new Meteor.Error("Unable to add rating", "Initial time must be an array of 'low, high'");
  if (obj.increment && obj.increment[0] > obj.increment[1])
    throw new Meteor.Error(
      "Unable to add rating",
      "Increment/delay must be an array of 'low, high'"
    );
  if (obj.etime && obj.etime[0] > obj.etime[1])
    throw new Meteor.Error("Unable to add rating", "etime must be an array of 'low, high'");

  const unique = [];
  const dups = [];
  if (obj.increment_type)
    obj.increment_type.forEach(type => {
      if (allowed_increment_types.indexOf(type) === -1)
        throw new Meteor.Error(
          "Unable to add rating",
          type + " is not an allowed increment/delay type"
        );
      if (unique.indexOf(type) === -1) unique.push(type);
      else dups.push(type);
    });

  if (dups.length !== 0)
    throw new Meteor.Error("Unable to add rating", "increment/delay has duplicate entries.");

  if (!!obj.increment && obj.increment[1]) {
    // have an increment and it's not [0,0]
    if (
      !obj.increment_type || // We have to have something,
      (obj.increment_type.length === 1 && obj.increment_type[0] === "none") // and other than "none"
    )
      throw new Meteor.Error(
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
        throw new Meteor.Error(
          "Unable to add rating",
          "etime does not match",
          "etime of " +
            calculated_low_etime +
            " is not equal to the specified low etime of " +
            obj.etime[0]
        );
      if (calculated_high_etime !== obj.etime[1])
        throw new Meteor.Error(
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
    throw new Meteor.Error(
      "Unable to add rating",
      "Initial, increment, and etime cannot all be null"
    );
  }
  if (obj.increment[0]) {
    if (obj.increment_type.indexOf("none") !== -1)
      throw new Meteor.Error(
        "Unable to add rating",
        "'none' cannot be specified when inc/delay is required"
      );
  } else {
    //!obj.increment[0]
    if (obj.increment_type.indexOf("none") === -1)
      throw new Meteor.Error(
        "Unable to add rating",
        "'none' is required when inc/delay can be zero"
      );
  }
  if (obj.increment[1]) {
    if (obj.increment_type.length === 1 && obj.increment_type[0] === "none")
      throw new Meteor.Error(
        "Unable to add rating",
        "increment or delay types are required when inc/delay can be non-zero"
      );
  } else {
    // !obj.increment[1]
    if (obj.increment_type.length !== 1 || obj.increment_type[0] !== "none")
      throw new Meteor.Error(
        "Unable to add rating",
        "'none' must be the only rating type when inc/delay cannot be set"
      );
  }
  return obj;
}

export const getMaxInitialAndIncOrDelayTime = ratings => {
  let maxInitialValue = 0;
  let maxIncOrDelayValue = 0;

  ratings.forEach(rating => {
    const ratingMaxValue = get(rating, "white_etime[1]", 0);
    const ratingMaxIncValue = get(rating, "white_increment_or_delay[1]", 0);

    if (ratingMaxValue > maxInitialValue) {
      maxInitialValue = ratingMaxValue;
    }

    if (ratingMaxIncValue > maxIncOrDelayValue) {
      maxIncOrDelayValue = ratingMaxIncValue;
    }
  });

  return { maxInitialValue, maxIncOrDelayValue };
};
