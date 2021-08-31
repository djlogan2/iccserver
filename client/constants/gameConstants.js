export const defaultCapture = {
  w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
};

export const whiteCastlingOptions = [
  { label: "0-0", value: "K" },
  { label: "0-0-0", value: "Q" },
];

export const blackCastlingOptions = [
  { label: "0-0", value: "k" },
  { label: "0-0-0", value: "q" },
];

export const gameObserveDefault = {
  _id: "bogus",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  white: { id: "bogus", name: "White", rating: 1600 },
  black: { id: "bogus", name: "White", rating: 1600 },
};

export const boardBaseFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const oneMinuteSeekOptions = {
  color: "random",
  initial: 1,
  incrementOrDelay: 0,
  incrementOrDelayType: "inc",
};

export const threeMinutesSeekOptions = {
  color: "random",
  initial: 3,
  incrementOrDelay: 2,
  incrementOrDelayType: "inc",
};

export const fiveMinutesSeekOptions = {
  color: "random",
  initial: 5,
  incrementOrDelay: 0,
  incrementOrDelayType: "inc",
};

export const tenMinutesSeekOptions = {
  color: "random",
  initial: 10,
  incrementOrDelay: 0,
  incrementOrDelayType: "inc",
};

export const fifteenMinutesSeekOptions = {
  color: "random",
  initial: 15,
  incrementOrDelay: 0,
  incrementOrDelayType: "inc",
};

export const twentyMinutesSeekOptions = {
  color: "random",
  initial: 20,
  incrementOrDelay: 0,
  incrementOrDelayType: "inc",
};

export const twentyFiveMinutesSeekOptions = {
  color: "random",
  initial: 25,
  incrementOrDelay: 10,
  incrementOrDelayType: "inc",
};

export const maxRating = 100000;
export const minRating = 0;
export const gameSeekAutoAccept = true;
export const gameSeekIsRated = true;

export const gameStatusPlaying = "playing";
export const gameStatusNone = "none";
export const gameStatusExamining = "examining";
export const gameStatusObserving = "observing";

export const colorWhite = "white";
export const colorBlack = "black";

export const COLOR_RANDOM = "random";

export const colorWhiteLetter = "w";
export const colorBlackLetter = "b";

export const colorWhiteUpper = "White";
export const colorBlackUpper = "Black";

export const ratedGame = "rated";
export const nonRatedGame = "non-rated";

export const gameComputerId = "computer";

export const CHALLENGER_INCREMENT_DELAY_TYPE = "challengerIncrementOrDelayType";
export const CHALLENGER_INITIAL = "challengerInitial";

export const RECEIVER_INCREMENT_DELAY_TYPE = "receiverIncrementOrDelayType";
export const RECEIVER_INITIAL = "receiverInitial";

export const INCREMENT_OR_DELAY_TYPE_NONE = "none";
