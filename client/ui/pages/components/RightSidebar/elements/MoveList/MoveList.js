import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import { Logger } from "../../../../../../../lib/client/Logger";
import { colorBlackLetter, colorWhiteLetter } from "../../../../../../constants/gameConstants";

const log = new Logger("client/MoveList_js");

export default class MoveList extends Component {
  constructor(props) {
    super(props);

    this.cmi = 0;
    this.moveListRow = [];

    this.state = {
      cmi: 0,
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

  handleClick = (cmi) => {
    const { game } = this.props;

    Meteor.call("moveToCMI", "moveToCMI", game._id, cmi, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  addToNewString = (element, index, cmi, activeCmi) => {
    const styles = {
      cursor: "pointer",
      color: cmi === activeCmi ? "#660000" : "#000000",
    };

    if (!element.smith || !element.smith.color) return;

    if (element.smith.color === colorWhiteLetter) {
      this.moveListRow.push(
        <span
          key={`${index}-w-${element.move}`}
          style={styles}
          onClick={() => this.handleClick(cmi)}
        >
          <b>{index}.</b>
          {element.move}{" "}
        </span>
      );
    } else {
      this.moveListRow.push(
        <span
          key={`${index}-b-${element.move}`}
          style={styles}
          onClick={() => this.handleClick(cmi)}
        >
          {element.move}{" "}
        </span>
      );
    }
  };

  recursiveMoveListRow = (moveList, currentMoveElement, currentIndex, cmi) => {
    const currentColor = get(moveList[currentMoveElement], "smith.color", null);
    if (
      !moveList[currentMoveElement].variations ||
      !moveList[currentMoveElement].variations.length
    ) {
      this.addToNewString(moveList[currentMoveElement], currentIndex, currentMoveElement, cmi);
      return;
    }

    if (moveList[currentMoveElement].variations.length === 1) {
      this.addToNewString(moveList[currentMoveElement], currentIndex, currentMoveElement, cmi);
      this.recursiveMoveListRow(
        moveList,
        moveList[currentMoveElement].variations[0],
        currentColor === colorBlackLetter ? currentIndex + 1 : currentIndex,
        cmi
      );
    } else if (moveList[currentMoveElement].variations.length > 1) {
      this.addToNewString(moveList[currentMoveElement], currentIndex, currentMoveElement, cmi);

      moveList[currentMoveElement].variations.forEach((el, index) => {
        if (index) {
          this.moveListRow.push(<>(</>);

          this.recursiveMoveListRow(
            moveList,
            el,
            currentColor === colorBlackLetter ? currentIndex + 1 : currentIndex,
            cmi
          );

          this.moveListRow.push(<>)</>);
        }
      });

      this.recursiveMoveListRow(
        moveList,
        moveList[currentMoveElement].variations[0],
        currentColor === colorBlackLetter ? currentIndex + 1 : currentIndex,
        cmi
      );
    }
  };

  generateMoveList = () => {
    const { game } = this.props;
    const moveList = get(game, "variations.movelist", []);
    const cmi = get(game, "variations.cmi", 1);

    if (!moveList.length || moveList.length === 1) return;
    this.moveListRow = [];

    let currentIndex = 1;

    this.recursiveMoveListRow(moveList, currentIndex, 1, cmi);
  };

  render() {
    const { game, cssManager } = this.props;

    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }

    if (game?.variations?.movelist?.length) {
      this.generateMoveList();
    }

    const btnstyle = cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px",
    });

    return (
      <div style={{ background: "#EFF0F3" }}>
        <div style={cssManager.gameMoveList()}>{this.moveListRow.map((el) => el)}</div>
      </div>
    );
  }
}
