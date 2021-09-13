import date from "date-and-time";
import React from "react";
import { Meteor } from "meteor/meteor";

// TODO: I don't know what you did here, but you cannot have client code in here. I moved this file from "server only" to "shared" specfically so that the client
//       and server could share the code that builds the PGN. You have now put a whole bunch of client-only code in here, which also gets loaded into the server,
//       which might even cause crashes or compile errors in the future.
//       Please do not put client only code in shared files, and do not put server only code in shared files.
const handleClick = (cmi, game_id) => {
  Meteor.call("moveToCMI", "moveToCMI", game_id, cmi, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

function parse(movelist) {
  function getData(item) {
    return {
      color: movelist[item].smith.color,
      piece: movelist[item].smith.piece,
      move: movelist[item].move,
    };
  }

  function isBlack(item) {
    return movelist[item].smith.color === "b";
  }

  function isWhite(item) {
    return movelist[item].smith.color === "w";
  }

  const result = [];
  const func = function (res, number, deep) {
    return function (item, index, arr) {
      if (index === 0) {
        res.push({
          number: Math.ceil(number / 2),
          ...getData(item),
          item,
          deep,
        });
      } else {
        const sub = [];
        if (isBlack(item)) {
          sub.push({ number: Math.ceil(number / 2), move: "...", deep: deep + 1 });
        }
        sub.push({ number: Math.ceil(number / 2), ...getData(item), item, index, deep: deep + 1 });
        if (movelist[item].variations) {
          movelist[item].variations?.forEach(func(sub, number + 1, deep + 1));
        }
        res.push(sub);
        if (isWhite(item)) {
          res.push({ number: Math.ceil(number / 2), subItem: item, move: "...", deep: deep });
        }
      }
      if (arr.length === index + 1) {
        movelist[arr[0]].variations?.forEach(func(res, number + 1, deep));
      }
    };
  };

  movelist[0].variations?.forEach(func(result, 1, 0));
  return result;
}

function getMoveString(moves) {
  const res = moves.map((moveItem) => {
    if (Array.isArray(moveItem)) {
      return "(" + getMoveString(moveItem) + ")";
    } else {
      return (moveItem.color === "b" ? "" : moveItem.number + ". ") + moveItem.move;
    }
  });
  return res.join(" ");
}

function getMoveBlock(moves, classes, active_cmi, gameId) {
  const newMoves = [];
  let subBlock = {
    id: "sub",
    content: [],
  };
  for (let i = 0; i < moves.length; i++) {
    const moveItem = moves[i];
    const nextMoveItem = moves[i + 1];
    const oneMove = {
      number: moveItem.number,
      moveW: moveItem,
      moveB: null,
      deep: moveItem.deep,
    };
    if (Array.isArray(moveItem)) {
      subBlock.content.push(moveItem);
    } else if (Array.isArray(nextMoveItem)) {
      oneMove.moveB = {
        number: moveItem.number,
        move: "...",
        deep: moveItem.deep,
      };
      moveItem.item && newMoves.push(oneMove);
    } else {
      if (subBlock.content.length) {
        newMoves.push(subBlock);
        subBlock = {
          id: "sub",
          content: [],
        };
      }
      oneMove.moveB = nextMoveItem;
      newMoves.push(oneMove);
      i++;
    }
  }
  if (subBlock.content.length) {
    newMoves.push(subBlock);
  }
  return getMoveFormatted(newMoves, classes, active_cmi, gameId);
}

function removePieceName(string) {
  return string.replace(/[BRNQK]/, "");
}

function getMoveFormatted(moves, classes, active_cmi, gameId) {
  const res = moves.map((moveItem, index) => {
    if (moveItem.deep === 0) {
      const styleW = moveItem.moveW?.item === active_cmi ? classes.itemRed : {};
      const styleB = moveItem.moveB?.item === active_cmi ? classes.itemRed : {};
      return (
        <div
          style={{ ...classes.tableRow, ...classes.borderBottom }}
          key={moveItem.moveW?.item || moveItem.moveB?.item || new Date()}
        >
          <span style={classes.tableCellNumber}>{moveItem.number}</span>
          <span
            style={{ ...styleW, ...classes.tableCellItem }}
            onClick={moveItem.moveW.item && (() => handleClick(moveItem.moveW.item, gameId))}
          >
            {moveItem.moveW?.piece && moveItem.moveW.piece !== "p" && (
              <img
                src={`images/figures/w${moveItem.moveW.piece}.svg`}
                style={classes.icon}
                alt={`White ${moveItem.moveW.piece}`}
              />
            )}
            {removePieceName(moveItem.moveW.move)}
          </span>
          <span
            style={{ ...styleB, ...classes.tableCellItem }}
            onClick={moveItem.moveB?.item && (() => handleClick(moveItem.moveB.item, gameId))}
          >
            {moveItem.moveB?.piece && moveItem.moveB.piece !== "p" && (
              <img
                src={`images/figures/b${moveItem.moveB.piece}.svg`}
                style={classes.icon}
                alt={`Black ${moveItem.moveB.piece}`}
              />
            )}

            {!!moveItem.moveB && removePieceName(moveItem.moveB.move)}
          </span>
        </div>
      );
    } else if (moveItem.id === "sub") {
      return (
        <div style={{ ...classes.borderBottom, backgroundColor: "rgba(0,0,0,0.1)" }}>
          {moveItem.content.map((item) => getMoveFormatted(item, classes, active_cmi, gameId))}
        </div>
      );
    } else {
      if (Array.isArray(moveItem)) {
        return (
          <span>
            <span style={classes.break}> </span>
            <span>({getMoveFormatted(moveItem, classes, active_cmi, gameId)})</span>
          </span>
        );
      }

      return (
        <span
          style={moveItem.item === active_cmi ? classes.itemRed : classes.itemBlack}
          onClick={moveItem.item && (() => handleClick(moveItem.item, gameId))}
        >
          {moveItem.color !== "b" && (
            <>
              {!!index && <span style={classes.break}> </span>}
              <span>{moveItem.number}.</span>
            </>
          )}
          <span>
            &nbsp;
            {moveItem.piece && moveItem.piece !== "p" && (
              <img
                src={`images/figures/${moveItem.color}${moveItem.piece}.svg`}
                style={classes.icon}
                alt={`${moveItem.color}${moveItem.piece}`}
              />
            )}
            {removePieceName(moveItem.move)}
          </span>
        </span>
      );
    }
  });
  return res;
}

export function buildPgnFromMovelist(movelist, hasUI = false, gameId, active_cmi, cssManager) {
  const classes = cssManager?.moveListItems();
  let long_string = getMoveString(parse(movelist));

  if (hasUI) {
    const parsedMoves = parse(movelist);
    // console.log("moveList", movelist);
    // console.log("parsedMoves", parsedMoves);
    return getMoveBlock(parsedMoves, classes, active_cmi, gameId);
  }
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
