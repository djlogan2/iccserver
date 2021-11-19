import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";

import { Switch } from "antd";
import { getMoveFormatted, parse } from "./MoveListHelpers";
import { Logger } from "../../../../../../../lib/client/Logger";
import { gameStatusPlaying } from "../../../../../../constants/gameConstants";
import { translate } from "../../../../../HOCs/translate";

const log = new Logger("client/MoveList_js");

class MoveList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isTable: localStorage["isTable"] || "1",
    };
  }

  handleClick = (cmi, game_id) => {
    const { game, moveToCMI } = this.props;
    if (game?.status === gameStatusPlaying) {
      moveToCMI(cmi);
      return;
    }

    Meteor.call("moveToCMI", "moveToCMI", game_id, cmi, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  getMoveBlock = (moves, classes, active_cmi, gameId, handleClick) => {
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
    return getMoveFormatted(newMoves, classes, active_cmi, gameId, handleClick, true);
  };

  render() {
    const { translate, game, cssManager } = this.props;
    const { isTable } = this.state;

    const switchClick = () => {
      const value = isTable === "1" ? "0" : "1";
      this.setState({ isTable: value });
      localStorage["isTable"] = value;
    };

    let moveListString = "";
    if (game?.variations?.movelist?.length) {
      const classes = cssManager?.moveListItems();
      const parsedMoves = parse(game.variations.movelist);
      moveListString =
        isTable === "1"
          ? this.getMoveBlock(parsedMoves, classes, game.variations.cmi, game._id, this.handleClick)
          : getMoveFormatted(parsedMoves, classes, game.variations.cmi, game._id, this.handleClick);
    }
    return (
      <div
        style={{
          background: "#EFF0F3",
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: "100%", textAlign: "right" }}>
          <Switch
            checkedChildren={translate("switchTable")}
            unCheckedChildren={translate("switchString")}
            checked={isTable === "1"}
            onClick={switchClick}
          />
        </div>
        <div style={{ ...cssManager.gameMoveListScrollWrapper() }}>
          <div style={{ ...cssManager.gameMoveList() }}>{moveListString}</div>
        </div>
      </div>
    );
  }
}

MoveList.propTypes = {
  translate: PropTypes.func.isRequired,
  game: PropTypes.object,
  cssManager: PropTypes.object.isRequired,
  moveToCMI: PropTypes.func,
};

export default translate("Common.MoveList")(MoveList);
