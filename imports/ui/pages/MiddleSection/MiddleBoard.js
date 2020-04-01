import React, { Component } from "react";
import Player from "./Player";
import CircleAndArrow from "./CircleAndArrow";
import BlackPlayerClock from "./BlackPlayerClock";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";
import i18n from "meteor/universe:i18n";
import Chess from "chess.js";
import Chessground from "react-chessground";
import "react-chessground/dist/assets/chessground.css";
import "react-chessground/dist/assets/theme.css"; // Or your own chess theme

const log = new Logger("client/MiddleBoard");

export default class MiddleBoard extends Component {
  constructor(props) {
    super(props);
    this._circle = { lineWidth: 2, color: "red" };
    this.chess = new Chess.Chess();
    //MiddleBoardData: {BlackPlayer: {…}, WhitePlayer: {…}
    this.state = {
      fen: this.chess.fen(),
      istakeback: false,
      draw_rank_and_file: "bl",
      top: props.top,
      white: props.MiddleBoardData.white,
      black: props.MiddleBoardData.black,
      height: 500,
      width: 1000,
      update: 0,
      isactive: true,
      current: 600000
    };
  }
  _flipboard() {
    this.switchSides();
  }
  /* updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  } */

  /**
   * Add event listener
   */
  /*  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  } */

  /**
   * Remove event listener
   */
  /*  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  } */

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
  /*
  componentWillReceiveProps(nextProps) {
    if (
      !!nextProps.game &&
      (this.props.gameStatus === "playing" || this.props.gameStatus === "examining")
    ) {
      console.log("cwill sf " + this.state.fen);
      console.log("cwill np " + nextProps.game.fen);
      //this.chess.load(game.fen);
      this.setState({ fen: nextProps.game.fen });
    }
  }
  */

  componentWillReceiveProps(nextProps) {
    if (!!nextProps.game) {
      //this.chess.load(game.fen);
      this.setState({ fen: nextProps.game.fen });
    }
  }

  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  onMove = (from, to) => {
    let move = this.chess.move({
      from: from,
      to: to,
      promotion: "q"
    });

    if (move === null) {
      this.setState({ fen: this.chess.fen() });
      // console.log("move has been "+ this.chess.fen());
      return;
    } else {
      let history = this.chess.history();
      let moves = history[history.length - 1];
      this.props.onDrop({
        move: moves
      });
      console.log("Draging start.. ");
      this.setState({ fen: this.chess.fen() });
    }
  };
  draggable() {
    if (
      this.props.gameStatus === "playing" ||
      (this.props.gameStatus === "examining" && this.props.currentGame === true)
    ) {
      return {
        enabled: true
      };
    } else {
      return {
        enabled: false
      };
    }
  }
  render() {
    this.chess.load(this.state.fen);
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
    const newColor = this.state.top === "w" ? "Black" : "White";

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

    let bordtop;

    if (this.state.top === "w") {
      bordtop = "black";
    } else {
      bordtop = "white";
    }

    let topPlayermsg;
    let botPlayermsg;
    let color;
    let circleAndArrow = null;
    /*
    if (this.props.gameStatus === "examining") {
      circleAndArrow = (
        <CircleAndArrow
          chardBoardName="allowDrag"
          squareId="data-squareid"
          boardsize={boardsize}
        >
        </CircleAndArrow>
      );
    }*/
    if (this.props.gameStatus === "playing") {
      if (this.props.MiddleBoardData.black.id === Meteor.userId()) {
        if (this.chess.turn() === "b") {
          botPlayermsg = translator("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translator("waitingforopponent");
          color = "#fff";
        }
      } else {
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
      fen = this.state.fen;
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
          <div className="merida">
            <Chessground
              draggable={this.draggable()}
              selectable={this.draggable()}
              width={boardsize}
              height={boardsize}
              fen={fen}
              orientation={bordtop}
              onMove={this.onMove}
            />
          </div>
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
