import date from "date-and-time";
import React from "react";
import { Meteor } from "meteor/meteor";

const handleClick = (cmi, game_id) => {
  Meteor.call("moveToCMI", "moveToCMI", game_id, cmi, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

function thisMove(
  node,
  move_number,
  write_move_number,
  white_to_move,
  cmi,
  hasUI,
  gameId,
  active_cmi,
  classes
) {
  let string = "";
  let prefix = "";

  if (write_move_number || white_to_move) {
    prefix = move_number + ". ";
    if (!white_to_move) prefix += "... ";
  }
  string = prefix + node.move;

  if (node.nag) string += " " + node.nag;
  if (node.comment && !hasUI) string += " {" + node.comment + "}";

  if (hasUI) {
    string = [
      <span
        key={cmi}
        style={cmi === active_cmi ? classes.itemRed : classes.itemBlack}
        onClick={() => handleClick(cmi, gameId)}
      >
        {prefix}
        <img
          src={`images/figures/${node.smith.color}${node.smith.piece}.svg`}
          style={classes.icon}
          alt={`${node.smith.color}${node.smith.piece}`}
        />
        {node.move}
      </span>,
    ];
  }

  return string;
}

function allVariations(
  movelist,
  cmi,
  move_number,
  white_to_move,
  hasUI,
  gameId,
  active_cmi,
  classes
) {
  if (!movelist[cmi].variations && !hasUI) return "";
  if (!movelist[cmi].variations && hasUI) return [];

  let string = hasUI ? [] : "";
  const variations = movelist[cmi].variations.slice(1);
  const next_move_number = move_number + (white_to_move ? 0 : 1);
  const next_to_move = !white_to_move;

  variations.forEach((v) => {
    if (!hasUI) {
      string +=
        "(" +
        thisMove(
          movelist[v],
          move_number,
          true,
          white_to_move,
          v,
          hasUI,
          gameId,
          active_cmi,
          classes
        );
      const nextmove = nextMove(
        movelist,
        v,
        next_move_number,
        next_to_move,
        hasUI,
        gameId,
        active_cmi
      );
      if (nextmove) string += " " + nextmove;
      string += ")";
    } else {
      const this_move = thisMove(
        movelist[v],
        move_number,
        true,
        white_to_move,
        v,
        hasUI,
        gameId,
        active_cmi,
        classes
      );
      const string_var1 = " (";
      const string_var2 = ")";
      string = [
        <span style={classes?.break}> </span>,
        ...string,
        <span style={classes?.break}>{string_var1}</span>,
        ...this_move,
      ];
      const nextmove = nextMove(
        movelist,
        v,
        next_move_number,
        next_to_move,
        hasUI,
        gameId,
        active_cmi,
        classes
      );
      if (nextmove) string = [...string, "\xa0", ...nextmove];
      string = [...string, <span>{string_var2}</span>];
    }
  });

  return string;
}

function nextMove(
  movelist,
  cmi,
  move_number,
  white_to_move,
  hasUI = false,
  gameId,
  active_cmi,
  classes
) {
  if (!movelist[cmi].variations && !hasUI) return "";
  if (!movelist[cmi].variations && hasUI) return [];

  const next_move_number = move_number + (white_to_move ? 0 : 1);
  const next_to_move = !white_to_move;

  let string = thisMove(
    movelist[movelist[cmi].variations[0]],
    move_number,
    false,
    white_to_move,
    movelist[cmi].variations[0],
    hasUI,
    gameId,
    active_cmi,
    classes
  );
  const variations = allVariations(
    movelist,
    cmi,
    move_number,
    white_to_move,
    hasUI,
    gameId,
    active_cmi,
    classes
  );
  let nextmove = nextMove(
    movelist,
    movelist[cmi].variations[0],
    next_move_number,
    next_to_move,
    hasUI,
    gameId,
    active_cmi,
    classes
  );

  if (!!variations && !hasUI) string += " " + variations;
  if (!!variations && hasUI) string = [...string, ...variations];

  if (!!nextmove) {
    if (!!variations && white_to_move && !hasUI) string += " " + next_move_number + ". ...";
    if (!!variations && variations.length && white_to_move && hasUI)
      string = [
        ...string,
        <span style={classes?.break}></span>,
        <span> {next_move_number}. ...</span>,
      ];

    if (!hasUI) string += " " + nextmove;
    if (hasUI) {
      let separator = "";
      if (string[string.length - 1].props.children !== ")") {
        separator = white_to_move ? <span> </span> : <span style={classes?.break}> </span>;
      }
      string = [...string, separator, ...nextmove];
    }
  }

  return string;
}

export function buildPgnFromMovelist(movelist, hasUI = false, gameId, active_cmi, cssManager) {
  const classes = cssManager?.moveListItems();
  let long_string = nextMove(movelist, 0, 1, true, hasUI, gameId, active_cmi, classes);
  if (hasUI) return long_string;

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
  let cmi = 0;

  while (!!game.variations.movelist[cmi].variations) {
    cmi = game.variations.movelist[cmi].variations[0];
  }

  let pgn = "";
  pgn += '[Date "' + date.format(game.startTime, "YYYY-MM-DD") + '"]\n';
  pgn += '[White "' + game.white.name + '"]\n';
  pgn += '[Black "' + game.black.name + '"]\n';
  pgn += '[Result "' + game.result + '"]\n';
  pgn += '[WhiteElo "' + game.white.rating + '"]\n';
  pgn += '[BlackElo "' + game.black.rating + '"]\n';
  if (!!game.tags?.ECO || !!game.tags?.Opening) {
    if (!!game.tags?.Opening) {
      pgn += '[Opening "' + game.tags.Opening + '"]\n';
    }
    if (!!game.tags?.ECO) {
      pgn += '[ECO "' + game.tags.ECO + '"]\n';
    }
  } else if (
    !!game?.variations?.movelist[cmi]?.eco?.name && // Making sure to only use the eco in the movelist if name is defined, not equal to an empty string and not equal to "NO_ECO"
    game.variations.movelist[cmi].eco.name !== "NO_ECO"
  ) {
    pgn += '[Opening "' + game.variations.movelist[cmi].eco.name + '"]\n';
    pgn += '[ECO "' + game.variations.movelist[cmi].eco.code + '"]\n';
  }
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
  if (!!game.tags) {
    for (const tag in game.tags) {
      pgn += "[" + tag + ' "' + game.tags[tag] + '"]\n';
    }
  }
  pgn += "\n";
  pgn += buildPgnFromMovelist(game.variations.movelist);
  pgn += " " + (game.result ? game.result : "*");
  return { title, pgn };
}
