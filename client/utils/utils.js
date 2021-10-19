import _ from "lodash";

export const updateLocale = (locale) => {
  const localeArray = locale.split("-");

  if (localeArray && localeArray.length === 2) {
    localeArray[1] = localeArray[1].toUpperCase();
  }

  return localeArray.join("-");
};

export const getBoardSquares = () => {
  return [
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "b1",
    "b2",
    "b3",
    "b4",
    "b5",
    "b6",
    "b7",
    "b8",
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
    "d6",
    "d7",
    "d8",
    "e1",
    "e2",
    "e3",
    "e4",
    "e5",
    "e6",
    "e7",
    "e8",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "g1",
    "g2",
    "g3",
    "g4",
    "g5",
    "g6",
    "g7",
    "g8",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "h7",
    "h8",
  ];
};

export const isReadySubscriptions = (subscriptions) => {
  for (const k in subscriptions) {
    if (!subscriptions[k].ready()) {
      return false;
    }
  }

  return true;
};

export const getLang = () =>
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.browserLanguage ||
  navigator.userLanguage ||
  "en-US";

export const areArraysOfObectsEqual = (firstArray, secondArray) => {
  return _(firstArray).differenceWith(secondArray, _.isEqual).isEmpty();
};

export const timeAfterMove = (variations, tomove, cmi) => {
  //
  // This is going to assume variation sub[0] is the correct
  // time (i.e. "main line", assuming main line is sub[0] and
  // not sub[last]. sub[last] might be more accurate.
  //
  // OK, so we are sitting (cmi is sitting) on the user NOT to move.
  //
  if (!cmi) cmi = variations.cmi;
  if (!cmi) return;

  let last_move_made = variations.movelist[cmi];
  if (!last_move_made.variations) {
    //
    // If there is no "next" move, use the clocks from the last set of moves
    //
    let prev = variations.movelist[cmi].prev;
    if (!prev) return;
    last_move_made = variations.movelist[prev];
    tomove = !tomove;
  }

  //
  // If we are doing the user waiting to move, use the current value of the
  // next node in the tree.
  //
  const upcoming_move = variations.movelist[last_move_made.variations[0]];
  if (tomove) return upcoming_move.current;

  //
  // Obviously by here we are doing the user NOT waiting to move. If there is
  // no move after the current users move, return the clocks at the beginning
  // of the last move made by this user.
  //
  if (!upcoming_move.variations || !upcoming_move.variations.length) return last_move_made.current;

  //
  // The "not to move" user has another move in the tree, so return the clock
  // value for this move.
  //
  const upcoming_next_move = variations.movelist[upcoming_move.variations[0]];
  return upcoming_next_move.current;
};
