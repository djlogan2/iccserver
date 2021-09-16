import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../../lib/client/Logger";
import { gameStatusPlaying } from "../../../../../../constants/gameConstants";
import { Switch } from "antd";
import { translate } from "../../../../../HOCs/translate";
import { getMoveFormatted, parse } from "./MoveListHelpers";
const log = new Logger("client/MoveList_js");

class MoveList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cmi: 0,
      isTable: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { game } = this.props;

    const prevCmi = get(game, "variations.cmi");
    const cmi = get(nextProps, "game.variations.cmi");

    if (cmi && prevCmi !== cmi) {
      this.setState({ cmi });
    }
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
      this.setState((state) => ({
        isTable: !state.isTable,
      }));
    };

    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }

    let moveListString = "";
    if (game?.variations?.movelist?.length) {
      const classes = cssManager?.moveListItems();
      const parsedMoves = parse(game.variations.movelist);
      moveListString = isTable
        ? this.getMoveBlock(parsedMoves, classes, game.variations.cmi, game._id, this.handleClick)
        : getMoveFormatted(parsedMoves, classes, game.variations.cmi, game._id, this.handleClick);
    }
    return (
      <div style={{ background: "#EFF0F3", overflow: "auto", height: "100%" }}>
        <div style={{ width: "100%", textAlign: "right" }}>
          <Switch
            checkedChildren={translate("switchTable")}
            unCheckedChildren={translate("switchString")}
            checked={isTable}
            onClick={switchClick}
          />
        </div>
        <div style={{ ...cssManager.gameMoveList() }}>{moveListString}</div>
      </div>
    );
  }
}

export default translate("Common.MoveList")(MoveList);
