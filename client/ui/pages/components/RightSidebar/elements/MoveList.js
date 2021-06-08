import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import buildPgn from "../../../helpers/build-pgn";
import { Logger } from "../../../../../../lib/client/Logger";
import { colorBlackLetter, colorWhiteLetter } from "../../../../../constants/gameConstants";

const log = new Logger("client/MoveList_js");

export default class MoveList extends Component {
  constructor(props) {
    super(props);

    this.cmi = 0;
    this.newString = [];

    this.state = {
      cmi: 0,
      toggle: false,
      action: "action",
      examinAction: "action",
      gameRequest: props.gameRequest,
      isexamin: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { game, gameRequest } = this.props;

    const prevCmi = get(game, "variations.cmi");
    const cmi = get(nextProps, "game.variations.cmi");

    if (cmi && prevCmi !== cmi) {
      this.setState({ cmi });
    }

    if (!!gameRequest && nextProps.gameRequest !== gameRequest && gameRequest.type === "match") {
      this.setState({ gameRequest });
    }
  }

  moveBackwordBeginning = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, this.currentindex, (err) => {
      if (err) {
        log.error(err);
      }
    });
  };

  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, 1);
  };

  moveForward = () => {
    const ind = this.currentindex + 1;
    let idc = 0;

    if (ind <= this.cmi) {
      idc = this.moves[ind].idc;
    }

    Meteor.call("moveForward", "MoveForward", this.gameId, 1, idc);
  };

  moveForwardEnd = () => {
    let movedata = this.moves;
    let slicemoves = movedata.slice(this.currentindex + 1, movedata.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      Meteor.call("moveForward", "MoveForward", this.gameId, 1, slicemoves[i].idc);
    }
  };

  handleClick = (cmi) => {
    const { game } = this.props;

    Meteor.call("moveToCMI", "moveToCMI", game._id, cmi, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  addToNewString = (element, index, cmi, activeCmi) => {
    const styles = {
      cursor: "pointer",
      color: cmi === activeCmi ? "#660000" : "#000000",
    };

    if (element.smith.color === colorWhiteLetter) {
      this.newString.push(
        <span style={styles} onClick={() => this.handleClick(cmi)}>
          <b>{index}.</b>
          {element.move}{" "}
        </span>
      );
    } else {
      this.newString.push(
        <span style={styles} onClick={() => this.handleClick(cmi)}>
          {element.move}{" "}
        </span>
      );
    }
  };

  recursiveMoveList = (moveList, currentMoveElement, currentIndex, cmi) => {
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
      this.recursiveMoveList(
        moveList,
        moveList[currentMoveElement].variations[0],
        currentColor === colorBlackLetter ? currentIndex + 1 : currentIndex,
        cmi
      );
    } else if (moveList[currentMoveElement].variations.length > 1) {
      this.addToNewString(moveList[currentMoveElement], currentIndex, currentMoveElement, cmi);

      moveList[currentMoveElement].variations.forEach((el, index) => {
        if (index) {
          this.newString.push(<>(</>);
        }

        this.recursiveMoveList(
          moveList,
          el,
          currentColor === colorBlackLetter ? currentIndex + 1 : currentIndex,
          cmi
        );

        if (index) {
          this.newString.push(<>)</>);
        }
      });
    }
  };

  generateMoveList = () => {
    const { game } = this.props;
    const moveList = get(game, "variations.movelist", []);
    const cmi = get(game, "variations.cmi", 1);

    if (!moveList.length || moveList.length === 1) return;
    this.newString = [];

    let currentIndex = 1;

    this.recursiveMoveList(moveList, currentIndex, 1, cmi);
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
        <div style={cssManager.gameMoveList()}>{this.newString.map((el) => el)}</div>
      </div>
    );
  }
}
