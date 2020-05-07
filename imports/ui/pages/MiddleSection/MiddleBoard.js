import React, { Component } from "react";
import Player from "./Player";
import CircleAndArrow from "./CircleAndArrow";
import BlackPlayerClock from "./BlackPlayerClock";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";
import i18n from "meteor/universe:i18n";
import Chess from "chess.js";
import ChessBoard from "./ChessBoard";

const log = new Logger("client/MiddleBoard");

export default class MiddleBoard extends Component {
  constructor(props) {
    super(props);
    this.chess = new Chess.Chess();
    this.state = {
      fen: this.chess.fen(),
      top: props.top,
      white: props.MiddleBoardData.white,
      black: props.MiddleBoardData.black,
      height: 500,
      width: 1000
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.top !== this.props.top) {
      this.setState({ top: this.props.top });
    }
  }

  switchSides = () => {
    const newTop = this.state.top === "w" ? "b" : "w";
    this.setState({ top: newTop });
  };

  circleLineWidthChange = event => {
    this._circle.lineWidth = event.target.value;
    this.refs.board.setCircleParameters(this._circle.lineWidth, this._circle.color);
  };

  circleColorChange = event => {
    this._circle.color = event.target.value;
    this.refs.board.setCircleParameters(this._circle.lineWidth, this._circle.color);
  };
  

  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    if (!!this.props.game) {
      this.chess.load(this.props.game.fen);
    }

    let translator = i18n.createTranslator("Common.MiddleBoard", this.getLang());
    let w = this.props.width;
    let h = this.props.height;

    let boardsize = null;
    let size = null;
    let m = Math.min(w, h);
    if (m > 600 && m < 1199) {
      size = w / 2.5;
      boardsize = w / 2.5;
    } else {
      boardsize = Math.min(h / 1.2, w / 1.2);
      size = Math.min(h / 1.2, w / 1.2);
    }
    const topPlayer =
      this.state.top === "w" ? this.props.MiddleBoardData.white : this.props.MiddleBoardData.black;
    const bottomPlayer =
      this.state.top === "b" ? this.props.MiddleBoardData.white : this.props.MiddleBoardData.black;

    const topPlayertime = this.state.top === "w" ? "white" : "black";
    const bottomPlayertime = this.state.top === "b" ? "white" : "black";

    const topPlayerClock =
      this.state.top === "w"
        ? this.props.MiddleBoardData.clocks.white
        : this.props.MiddleBoardData.clocks.black;
    const bottomPlayerClock =
      this.state.top === "b"
        ? this.props.MiddleBoardData.clocks.white
        : this.props.MiddleBoardData.clocks.black;

    const topPlayerFallenSoldier =
      this.state.top === "w" ? this.props.capture.b : this.props.capture.w;
    const bottomPlayerFallenSoldier =
      this.state.top === "b" ? this.props.capture.b : this.props.capture.w;
    const tc = this.state.top === "w" ? "b" : "w";
    const bc = this.state.top === "b" ? "b" : "w";

    let boardtop;
   

    if(this.props.gameStatus!=="idlemode"){
    if (this.state.top === "w") {
      boardtop = "black";
    } else {
      boardtop = "white";
    }
  }
    let topPlayermsg;
    let botPlayermsg;
    let color;
    let mypeiceColor;
    if (this.props.gameStatus === "playing") {
      if (this.props.MiddleBoardData.black.id === Meteor.userId()) {
        mypeiceColor = "black";
        if (this.chess.turn() === "b") {
          botPlayermsg = translator("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translator("waitingforopponent");
          color = "#fff";
        }
      } else {
        mypeiceColor = "white";
        if (this.chess.turn() === "w") {
          botPlayermsg = translator("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translator("waitingforopponent");
          color = "#fff";
        }
      }
    }
    let fen;
    if (
      !!this.props.gameStatus &&
      (this.props.gameStatus === "examining" || this.props.gameStatus === "playing")
    ) {
      fen = this.props.game.fen;
    } else {
      fen = this.chess.fen();
    }

    return (
      <div>
        <div style={{ width: size }}>
          <Player
            PlayerData={topPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
            color={tc}
            turnColor={color}
            FallenSoldiers={topPlayerFallenSoldier}
            rank_and_file={this.state.draw_rank_and_file}
            Playermsg={topPlayermsg}
          />

          <BlackPlayerClock
            cssmanager={this.props.cssmanager}
            ClockData={this.props.game}
            color={topPlayertime}
            side={size}
          />
          <ChessBoard
            fen={fen}
            height={boardsize}
            width={boardsize}
            orientation={boardtop}
            onDrop={this.props.onDrop}
            mycolor={mypeiceColor}
            gameStatus={this.props.gameStatus}
            currentGame={this.props.currentGame}
          />
          <Player
            PlayerData={bottomPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
            color={bc}
            turnColor={color}
            FallenSoldiers={bottomPlayerFallenSoldier}
            rank_and_file={this.state.draw_rank_and_file}
            Playermsg={botPlayermsg}
          />
          <BlackPlayerClock
            cssmanager={this.props.cssmanager}
            ClockData={this.props.game}
            color={bottomPlayertime}
            side={size}
          />
        </div>
      </div>
    );
  }
}
