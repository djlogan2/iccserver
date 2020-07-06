/* eslint-disable prettier/prettier */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import buildPgn from "./../../../helpers/build-pgn";

import { object } from "prop-types";

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
  moveForwardEnd = cmi => {
    let movedata = this.moves;
    let slicemoves = movedata.slice(this.currentindex + 1, movedata.length);
    for (let i = 0; i <= slicemoves.length; i++) {
      console.log(slicemoves[i].idc);
      Meteor.call("moveForward", "MoveForward", this.gameId, 1, slicemoves[i].idc);
    }

    // console.log(v.idc);

    //  Meteor.call("moveForward", "MoveForward", this.gameId,movecount);
  };

  moveAutoForward = () => {
    clearInterval(this.intervalID);
    this.setState({ toggle: !this.state.toggle });
    this.intervalID = setInterval(() => {
      let remainMove = this.cmi - this.currentindex;
      if (remainMove === 0 || this.state.toggle === false) {
        clearInterval(this.intervalID);
        this.setState({ toggle: !this.state.toggle });
      } else {
        this.moveForward();
      }
    }, 1000);
  };

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  render() {
    let translator = i18n.createTranslator("Common.MoveListComponent", MoveList.getLang());
    let moves = [];
    let variation;
    let game = this.props.game;
    if (!!game) {
      this.message_identifier = "server:game:" + this.gameId;
      this.gameId = game._id;
    }
    let string = buildPgn(game.variations.movelist);
    let chunks = string.split("|");
    chunks.splice(-1, 1);
    this.cmi = chunks.length;
    this.moves = [];
    this.moves.push({ idc: 0, idx: 0, move: "" });
    for (let i = 0; i < chunks.length; i++) {
      let ch = chunks[i].split("*-");
      this.moves.push({ idc: parseInt(ch[0]), idx: parseInt(ch[1]), move: ch[2] });
    }

    console.log(this.moves);
    /* TODO: movlist button display operation*/
    let displayButton = 0;
    let statuslabel = 0;
    let isPlaying;



    if (status === "playing") {
      isPlaying = true;
    } else {
      isPlaying = false;
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
    let btnstyle = {};
    btnstyle = this.props.cssmanager.buttonStyle();
    Object.assign(btnstyle, {
      background: "#f1f1f1",
      borderRadius: "5px",
      margin: "5px",
      padding: "6px 25px"
    });

    return (
      <div className="move-list">
        <div style={this.props.cssmanager.gameMoveList()}>{moveslist}</div>
{/*
        {displayButton ? (
          <div style={mbtnstyle} className="moveAction">
            <button style={btnstyle} onClick={this.moveBackwordBeginning.bind(this)}>
              <img
                src={this.props.cssmanager.buttonBackgroundImage("fastForward")}
                alt="fast-forward"
              />
            </button>
            <button style={btnstyle} onClick={this.moveBackword.bind(this)}>
              <img
                src={this.props.cssmanager.buttonBackgroundImage("prevIconGray")}
                alt="previous"
              />
            </button>
            <button style={btnstyle} onClick={this.moveForward.bind(this)}>
              <img src={this.props.cssmanager.buttonBackgroundImage("nextIconGray")} alt="next" />
            </button>
            <button style={btnstyle} onClick={this.moveForwardEnd.bind(this, 1)}>
              <img
                src={this.props.cssmanager.buttonBackgroundImage("fastForwardNext")}
                alt="fast-forward-next"
              />
            </button>
            <button style={btnstyle} onClick={this.moveAutoForward.bind(this)}>
              {this.state.toggle ? (
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("nextStop")}
                  alt="next-single"
                />
              ) : (
                <img
                  src={this.props.cssmanager.buttonBackgroundImage("nextStart")}
                  alt="next-single"
                />
              )}
            </button>
            <button style={btnstyle} onClick={this.props.flip}>
              <img src={this.props.cssmanager.buttonBackgroundImage("flipIconGray")} alt="Flip" />
            </button>
          </div>
        ) : null}
        <div className="draw-section">
          {statuslabel ? (
            <div
              className={"gamestatus " + (status === "playing" ? "active" : "default")}
              style={this.props.cssmanager.drawActionSection()}
            >
              <span>{translator(status)}</span>
            </div>
          ) : null} */}
        {/* </div> */}
      </div>
    );
  }
}
