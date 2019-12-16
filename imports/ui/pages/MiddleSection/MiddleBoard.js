import React, { Component } from "react";
import "../css/ChessBoard";
import Player from "./Player";
import Board from "../components/Board/Board";
import "../css/developmentboard.css";
import Chess from "chess.js";
import BlackPlayerClock from "./BlackPlayerClock";
import WhitePlayerClock from "./WhitePlayerClock";
import { Meteor } from "meteor/meteor";

export default class MiddleBoard extends Component {
  constructor(props) {
    super(props);
    this._circle = { lineWidth: 2, color: "red" };

    //MiddleBoardData: {BlackPlayer: {…}, WhitePlayer: {…}
    this.state = {
      draw_rank_and_file: "bl",
      top: props.top,
      white: props.MiddleBoardData.white,
      black: props.MiddleBoardData.black,
      height: 500,
      width: 1000,
      isactive: true,
      current: 600000
    };
  }
  _flipboard() {
    this.switchSides();
  }
  updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
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

  switchRAF = () => {
    this.setState({ draw_rank_and_file: this.nextRAF()[0] });
  };

  circleLineWidthChange = event => {
    this._circle.lineWidth = event.target.value;
    this.refs.board.setCircleParameters(this._circle.lineWidth, this._circle.color);
  };

  circleColorChange = event => {
    this._circle.color = event.target.value;
    this.refs.board.setCircleParameters(this._circle.lineWidth, this._circle.color);
  };

  nextRAF() {
    const values = ["tl", "tr", "bl", "br", "stl", "str", "sbl", "sbr"];
    const texts = [
      "Top left",
      "Top right",
      "Bottom left",
      "Bottom right",
      "External top left",
      "External top right",
      "External bottom left",
      "External bottom right"
    ];

    if (!this.state.draw_rank_and_file) return [values[0], texts[0]];
    let i = values.indexOf(this.state.draw_rank_and_file);
    i++;
    if (i === values.length) return [null, "No rank and file"];
    else return [values[i], texts[i]];
  }
  _pieceSquareDragStop = raf => {
    let isMove = this.props.onDrop({
      from: raf.from,
      to: raf.to
    });
    return isMove;
  };
  render() {
    let w = this.state.width;
    let h = this.state.height;
    let d;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;

    d = h;
    w /= 2; // 1366/2
    h -= d / 9;
    let mbh = h / 6;

    const size = Math.min(h, w);
    const newColor = this.state.top === "w" ? "Black" : "White";

    const raf = this.nextRAF()[1];

    const topPlayer =
      this.state.top === "w" ? this.props.MiddleBoardData.white : this.props.MiddleBoardData.black;
    const bottomPlayer =
      this.state.top === "b" ? this.props.MiddleBoardData.white : this.props.MiddleBoardData.black;

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
    const board = this.props.board || new Chess.Chess();
    return (
      <div>
        <button
          onClick={this.switchSides.bind(this)}
          style={this.props.cssmanager.buttonStyle("middleBoard")}
        >
          <img src={this.props.cssmanager.buttonBackgroundImage("fullScreen")} alt="full-screen" />
        </button>

        <div style={{ width: size }}>
          <Player
            PlayerData={topPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
            color={tc}
            FallenSoldiers={topPlayerFallenSoldier}
            rank_and_file={this.state.draw_rank_and_file}
          />

          <BlackPlayerClock
            cssmanager={this.props.cssmanager}
            ClockData={topPlayerClock}
            side={size}
          />
        </div>
        <div style={this.props.cssmanager.fullWidth()}>
          <div
            // style={this.props.cssmanager.parentPopup(h, w)}
            style={{ width: w, height: mbh }}
            className="boardMain"
          >
            <Board
              cssmanager={this.props.cssmanager}
              board={board.board()}
              draw_rank_and_file={this.state.draw_rank_and_file}
              side={size}
              top={this.state.top}
              circle={{ lineWidth: 2, color: "red" }}
              arrow={{ lineWidth: 2, color: "blue" }}
              ref="board"
              onDrop={this._pieceSquareDragStop}
            />
          </div>
        </div>
        <div style={{ clear: "Left" }} />
        <div style={{ width: size }}>
          <Player
            PlayerData={bottomPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
            color={bc}
            FallenSoldiers={bottomPlayerFallenSoldier}
            rank_and_file={this.state.draw_rank_and_file}
          />
          <BlackPlayerClock
            cssmanager={this.props.cssmanager}
            ClockData={bottomPlayerClock}
            side={size}
          />
        </div>
      </div>
    );
  }
}
