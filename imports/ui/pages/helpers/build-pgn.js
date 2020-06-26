function addmove(move_number, variations, white_to_move, movelist, idx) {
  let string = "";

  if (!movelist[idx].variations || !movelist[idx].variations.length) return "";
  if (movelist[idx].variations.length > 1) {
  } else {
    string +=
      "0" +
      "*-" +
      movelist[idx].variations[0] +
      "*-" +
      movelist[movelist[idx].variations[0]].move +
      "|";
  }

  let next_move_number = move_number;
  let next_white_to_move = !white_to_move;
  if (next_white_to_move) next_move_number++;

  for (let x = 1; x < movelist[idx].variations.length; x++) {
    if ((x = movelist[idx].variations.length - 1)) {
      string +=
        x +
        "*-" +
        movelist[idx].variations[x] +
        "*-" +
        movelist[movelist[idx].variations[x]].move +
        " |";
    }
    string += addmove(
      next_move_number,
      false,
      next_white_to_move,
      movelist,
      movelist[idx].variations[x]
    );
  }

  if (movelist[idx].variations.length > 1) {
    addmove(
      next_move_number,
      movelist[idx].variations.length > 1,
      next_white_to_move,
      movelist,
      movelist[idx].variations[0]
    );
  } else {
    string +=
      " " +
      addmove(
        next_move_number,
        movelist[idx].variations.length > 1,
        next_white_to_move,
        movelist,
        movelist[idx].variations[0]
      );
  }
  return string;
}

export default function buildPgn(movelist) {
  return addmove(1, false, true, movelist, 0);
}
