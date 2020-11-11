/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import buildPgn from "./../../../helpers/build-pgn";

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
      isexamin: true
    };
  }
  static getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.game.variations.cmi !== this.props.game.variations.cmi) {
      this.setState({ cmi: nextProps.game.variations.cmi });
    }
    if (!!this.props.gameRequest) {
      if (
        nextProps.gameRequest !== this.props.gameRequest &&
        this.props.gameRequest.type === "match"
      ) {
        this.setState({ gameRequest: this.props.gameRequest });
      }
    }
  }
  moveBackwordBeginning = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, this.currentindex);
  };
  moveBackword = () => {
    Meteor.call("moveBackward", "MoveBackward", this.gameId, 1);
  };
  moveForward = () => {
    let ind = this.currentindex + 1;
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

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render() {
    let game = this.props.game;
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
      let mv = this.moves[index].move;
      let idx = this.moves[index].idx;
      if (index % 2 === 0) {
        ind = "";
      } else {
        ind = " " + cnt + ".";
        cnt++;
      }
      let style = { color: "black" };
      let movestyle;
      if (this.state.cmi === idx) {
        Object.assign(style, { color: "#904f4f", fontWeight: "bold", fontSize: "15px" });
        movestyle = style;
        this.currentindex = index;
      } else {
        movestyle = style;
      }

      return (
        <span key={index}>
          {ind ? <b>{ind}</b> : null}
          <span style={movestyle}> {mv}</span>
        </span>
      );
    });
    let btnstyle;
    btnstyle = this.props.cssManager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px"
    });

    return (
      <div className="move-list">
        <div style={this.props.cssManager.gameMoveList()}>{moveslist}</div>
      </div>
    );
  }
}
