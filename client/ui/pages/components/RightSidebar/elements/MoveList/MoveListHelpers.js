import React from "react";

export const figures = {
  wb: "L",
  wr: "R",
  wn: "N",
  wq: "Q",
  wk: "K",
  bb: "l",
  br: "r",
  bn: "n",
  bq: "q",
  bk: "k",
};

function removePieceName(string) {
  return string.replace(/[BRNQK]/, "");
}

export function parse(movelist) {
  function getData(item) {
    const pieceSign = movelist[item].move[0];
    let piece = "p";
    if (/[NBRKQ]/.test(pieceSign)) {
      piece = pieceSign.toLowerCase();
    } else if (pieceSign === "O") {
      piece = "k";
    }
    return {
      piece,
      move: movelist[item].move,
    };
  }

  function changeTurn(color) {
    return color === "w" ? "b" : "w";
  }

  const result = [];
  const func = function (res, number, deep, color) {
    return function (item, index, arr) {
      if (index === 0) {
        if (Array.isArray(res[res.length - 1]) && color !== "w") {
          res.push({
            number: Math.ceil(number / 2),
            subItem: item,
            move: "...",
            color: changeTurn(color),
            deep: deep,
          });
        }
        res.push({
          number: Math.ceil(number / 2),
          ...getData(item),
          color,
          item,
          deep,
        });
      } else {
        const sub = [];
        if (color === "b") {
          sub.push({
            number: Math.ceil(number / 2),
            move: "...",
            color: "w",
            deep: deep + 1,
          });
        }
        sub.push({
          number: Math.ceil(number / 2),
          ...getData(item),
          color,
          item,
          index,
          deep: deep + 1,
        });
        if (movelist[item].variations) {
          movelist[item].variations?.forEach(func(sub, number + 1, deep + 1, changeTurn(color)));
        }
        res.push(sub);
      }
      if (arr.length === index + 1) {
        movelist[arr[0]].variations?.forEach(func(res, number + 1, deep, changeTurn(color)));
      }
    };
  };

  movelist[0].variations?.forEach(func(result, 1, 0, "w"));
  return result;
}

export function getMoveFormatted(moves, classes, active_cmi, gameId, handleClick, isTable = false) {
  const res = moves.map((moveItem, index) => {
    if (moveItem.deep === 0 && isTable) {
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
              <span style={classes.icon}>{figures[`w${moveItem.moveW.piece}`]}</span>
            )}
            {removePieceName(moveItem.moveW.move)}
          </span>
          <span
            style={{ ...styleB, ...classes.tableCellItem }}
            onClick={moveItem.moveB?.item && (() => handleClick(moveItem.moveB.item, gameId))}
          >
            {moveItem.moveB?.piece && moveItem.moveB.piece !== "p" && (
              <span style={classes.icon}>{figures[`b${moveItem.moveB.piece}`]}</span>
            )}

            {!!moveItem.moveB && removePieceName(moveItem.moveB.move)}
          </span>
        </div>
      );
    } else if (moveItem.id === "sub") {
      return (
        <div style={{ ...classes.borderBottom, backgroundColor: "rgba(0,0,0,0.1)" }}>
          {moveItem.content.map((item) =>
            getMoveFormatted(item, classes, active_cmi, gameId, handleClick)
          )}
        </div>
      );
    } else {
      if (Array.isArray(moveItem)) {
        return (
          <span>
            <span style={classes.break}> </span>
            <span>({getMoveFormatted(moveItem, classes, active_cmi, gameId, handleClick)})</span>
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
              <span style={classes.icon}>{figures[`${moveItem.color}${moveItem.piece}`]}</span>
            )}
            {removePieceName(moveItem.move)}
          </span>
        </span>
      );
    }
  });
  return res;
}
