import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { get } from "lodash";

import buildPgn from "../../../helpers/build-pgn";

export default class MoveList extends Component {
  constructor(props) {
    super(props);

    this.cmi = 0;

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
    Meteor.call("moveBackward", "MoveBackward", this.gameId, this.currentindex);
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

  handleClick = (element) => {
    // console.log(element);
  };

  constructMoveList = () => {
    const { game } = this.props;

    if (game?.variations?.movelist) {
      // console.log(game.variations.movelist);
      const moves = { 0: [] };

      let currentVariation = 0;
      let currentIndex = Number(game.variations.movelist["0"].variations[0]);
      while (true) {
        // console.log(1234, game);
        if (!game.variations.movelist[currentIndex]) {
          // console.log(12345);
          break;
        }

        // console.log(game.variations.movelist[currentIndex].variations, currentIndex);
        if (
          !game.variations.movelist[currentIndex].variations ||
          game.variations.movelist[currentIndex].variations.length === 1
        ) {
          moves[currentVariation].push(game.variations.movelist[currentIndex]);
          currentIndex = get(
            game,
            `variations.movelist[${currentIndex}].variations[0]`,
            currentIndex + 1
          );
          // console.log(123456, currentIndex);
        } else if (game.variations.movelist[currentIndex].variations.length > 1) {
          // console.log(1234567);
          break;
        } else {
          // console.log(123456789, game.variations.movelist[currentIndex].variations);
        }
      }

      // console.log(moves);
    }
  };

  render() {
    const { game, cssManager } = this.props;
    const { cmi } = this.state;

    // this.constructMoveList();

    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }

    let string = !!game.variations ? buildPgn(game.variations.movelist) : "";
    let chunks = string.split("|");
    chunks.splice(-1, 1);

    this.cmi = chunks.length;

    this.moves = [];
    this.moves.push({ idc: 0, idx: 0, move: "" });

    for (let i = 0; i < chunks.length; i++) {
      let ch = chunks[i].split("*-");
      this.moves.push({ idc: parseInt(ch[0]), idx: parseInt(ch[1]), move: ch[2] });
    }

    /*End of code */
    let cnt = 1;
    let ind = "";
    this.currentindex = 0;

    let moveslist = this.moves.map((move, index) => {
      const mv = move.move;
      const idx = move.idx;

      if (index % 2 === 0) {
        ind = "";
      } else {
        ind = " " + cnt + ".";
        cnt++;
      }
      let style = { color: "black" };
      let movestyle;
      if (cmi === idx) {
        Object.assign(style, { color: "#904f4f", fontWeight: "bold", fontSize: "15px" });
        movestyle = style;
        this.currentindex = index;
      } else {
        movestyle = style;
      }

      return (
        <span key={index}>
          {!!ind && <b>{ind}</b>}
          <span
            onClick={() => this.handleClick(mv)}
            style={{ ...movestyle, cursor: "pointer" }}
          >{` ${mv}`}</span>
        </span>
      );
    });

    const btnstyle = cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px",
    });

    return (
      <div style={{ background: "#EFF0F3" }}>
        <div style={cssManager.gameMoveList()}>{moveslist}</div>
      </div>
    );
  }
}
