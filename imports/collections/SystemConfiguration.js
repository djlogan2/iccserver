import { Match, check } from "meteor/check";

export const SystemConfiguration = {};

SystemConfiguration.winDrawLossAssessValues = function(robject1, robject2) {
  //{ rating: 1, need: 1, won: 1, draw: 1, lost: 1, best: 1 }
  check(robject1, Object);
  check(robject2, Object);
  const oppgames = robject2.won + robject2.draw + robject2.lost;
  const rightpart =
    1 / (1 + Math.pow(10, (robject2.rating - robject1.rating) / 100));
  const K = oppgames >= 20 ? 32 : oppgames / 21;
  return {
    win: robject1.rating + K * (1 - rightpart),
    draw: robject1.rating + K * (1 / 2 - rightpart),
    loss: robject1.rating + K * -rightpart
  };
};

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

SystemConfiguration.maximumRunningEngines = function() {
  return 5;
};

SystemConfiguration.enginePath = function() {
  return "/Users/davidlogan/stockfish-9-mac/Mac/stockfish-9-64";
};

SystemConfiguration.automaticScoreParameters = function() {
  return {movetime: 10};
}
