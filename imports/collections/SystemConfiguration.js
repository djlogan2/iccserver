import { Match, check } from "meteor/check";

export const SystemConfiguration = {};

const defaultRatingRules = {
  bullet: { etime: [0, 3] },
  blitz: { etime: [3, 15] },
  standard: { etime: [14, 9999] },
  fiveminute: { time: 5, inc: 0 },
  oneminute: { time: 5, inc: 0 },
  fifteenminute: { time: 15, inc: 0 },
  threeminute: { time: 3, inc: 0 }
};
SystemConfiguration.meetsTimeAndIncRules = function(time, inc) {
  check(time, Number);
  check(inc, Number);
  return time > 0 || inc > 0;
};

function docheck(thecheck, thevalue) {
  if (Array.isArray(thecheck)) {
    if (thevalue <= thecheck[0]) return false;
    return thevalue <= thecheck[1];
  }
  return thevalue === thecheck;
}

SystemConfiguration.meetsRatingTypeRules = function(rating_type, time, inc) {
  check(rating_type, String);
  check(time, Number);
  check(inc, Number);

  if (!defaultRatingRules[rating_type]) return true;
  const r_etime = defaultRatingRules[rating_type].etime;
  const r_time = defaultRatingRules[rating_type].time;
  const r_inc = defaultRatingRules[rating_type].inc;
  if (r_etime) return docheck(r_etime, time + (inc * 2) / 3);
  if (r_time) return docheck(r_time, time);
  if (r_inc) return docheck(r_inc, inc);
};

SystemConfiguration.meetsMinimumAndMaximumRatingRules = function(
  rating_type,
  our_rating_object,
  minrating,
  maxrating
) {
  check(rating_type, String);
  check(our_rating_object, Object);
  check(minrating, Match.Maybe(Number));
  check(maxrating, Match.Maybe(Number));
  return (
    (minrating === undefined || minrating == null || minrating > 0) &&
    (maxrating === undefined || maxrating == null || maxrating > 0)
  );
};