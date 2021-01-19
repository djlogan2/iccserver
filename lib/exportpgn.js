import date from "date-and-time";

function thisMove(node, move_number, write_move_number, white_to_move) {
  let string = "";

  if (write_move_number || white_to_move) {
    string += move_number + ". ";
    if (!white_to_move) string += "... ";
  }

  string += node.move;

  if (node.nag) string += " " + node.nag;
  if (node.comment) string += " {" + node.comment + "}";

  return string;
}

function allVariations(movelist, cmi, move_number, white_to_move) {
  if (!movelist[cmi].variations) return "";

  let string = "";
  const variations = movelist[cmi].variations.slice(1);
  const next_move_number = move_number + (white_to_move ? 0 : 1);
  const next_to_move = !white_to_move;

  variations.forEach(v => {
    string += "(" + thisMove(movelist[v], move_number, true, white_to_move);
    const nextmove = nextMove(movelist, v, next_move_number, next_to_move);
    if (nextmove) string += " " + nextmove;
    string += ")";
  });

  return string;
}

function nextMove(movelist, cmi, move_number, white_to_move) {
  if (!movelist[cmi].variations) return "";

  const next_move_number = move_number + (white_to_move ? 0 : 1);
  const next_to_move = !white_to_move;

  let string = thisMove(movelist[movelist[cmi].variations[0]], move_number, false, white_to_move);
  const variations = allVariations(movelist, cmi, move_number, white_to_move);
  let nextmove = nextMove(movelist, movelist[cmi].variations[0], next_move_number, next_to_move);

  if (!!variations) string += " " + variations;

  if (!!nextmove) {
    if (!!variations && white_to_move) string += " " + next_move_number + ". ...";
    string += " " + nextmove;
  }

  return string;
}

export function buildPgnFromMovelist(movelist) {
  let long_string = nextMove(movelist, 0, 1, true);
  let reformatted = "";
  while (long_string.length > 255) {
    long_string = long_string.trimStart();
    const idx1 = long_string.lastIndexOf(" ", 255);
    const idx2 = long_string.indexOf("\n"); // May be in a comment. Also we just want the first one!
    const idx3 = long_string.lastIndexOf("\t", 255); // May be in a comment
    const idxmax = Math.max(idx1, idx2, idx3);
    const idx = Math.min(
      idx1 === -1 ? idxmax : idx1,
      idx2 === -1 ? idxmax : idx2,
      idx3 === -1 ? idxmax : idx3
    );
    reformatted += long_string.substr(0, idx) + "\n";
    long_string = long_string.substring(idx);
  }
  reformatted += long_string;
  return reformatted;
}

export function exportGameObjectToPGN(game) {
  let title = game.white.name + "-" + game.black.name + ".pgn";

  let pgn = "";
  pgn += '[Date "' + date.format(game.startTime, "YYYY-MM-DD") + '"]\n';
  pgn += '[White "' + game.white.name + '"]\n';
  pgn += '[Black "' + game.black.name + '"]\n';
  pgn += '[Result "' + game.result + '"]\n';
  pgn += '[WhiteElo "' + game.white.rating + '"]\n';
  pgn += '[BlackElo "' + game.black.rating + '"]\n';
  //pgn += "[Opening " + something + "]\n"; TODO: Do this someday
  //pgn += "[ECO " + something + "]\n"; TODO: Do this someday
  //pgn += "[NIC " + something + "]\n"; TODO: Do this someday
  pgn += '[Time "' + date.format(game.startTime, "HH:mm:ss") + '"]\n';
  if (!game.clocks) {
    pgn += '[TimeControl "?"]\n';
  } else {
    if (!game.clocks.white.inc_or_delay) game.clocks.white.inc_or_delay = "none";
    if (!game.clocks.black.inc_or_delay) game.clocks.black.inc_or_delay = "none";
    switch (game.clocks.white.inc_or_delay_type) {
      case "none":
        pgn += '"[TimeControl ' + game.clocks.white.initial / 1000 + '"]\n';
        break;
      case "us":
      case "bronstein":
      case "inc":
        pgn +=
          '[TimeControl "' +
          game.clocks.white.initial / 1000 +
          "+" +
          game.clocks.white.inc_or_delay +
          '"]\n';
        break;
      default:
        pgn += '[TimeControl "?"]\n';
        break;
    }
  }
  pgn += "\n";
  pgn += buildPgnFromMovelist(game.variations.movelist);
  pgn += " " + (game.result ? game.result : "*");
  return { title, pgn };
}
