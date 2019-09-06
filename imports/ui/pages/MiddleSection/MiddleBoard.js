import React, { Component } from "react";
import "../css/ChessBoard";
import Player from "./Player";
import Board from "../components/Board/Board";
import "../css/developmentboard.css";
import Chess from "chess.js";
import BlackPlayerClock from "./BlackPlayerClock";
import WhitePlayerClock from "./WhitePlayerClock";
import FallenSoldier from "./FallenSoldier";

export default class MiddleBoard extends Component {
  constructor(props) {
    super(props);

    this._circle = { lineWidth: 2, color: "red" };
    //MiddleBoardData: {BlackPlayer: {…}, WhitePlayer: {…}
    this.state = {
      draw_rank_and_file: "br",
      top: "b",
      whitePlayer: props.MiddleBoardData.WhitePlayer,
      blackPlayer: props.MiddleBoardData.BlackPlayer,
      height: 500,
      width: 1000
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

  switchSides = () => {
    const newTop = this.state.top === "w" ? "b" : "w";
    this.setState({ top: newTop });
  };

  switchRAF = () => {
    this.setState({ draw_rank_and_file: this.nextRAF()[0] });
  };

  circleLineWidthChange = event => {
    this._circle.lineWidth = event.target.value;
    this.refs.board.setCircleParameters(
      this._circle.lineWidth,
      this._circle.color
    );
  };

  circleColorChange = event => {
    this._circle.color = event.target.value;
    this.refs.board.setCircleParameters(
      this._circle.lineWidth,
      this._circle.color
    );
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
    this.props.onDrop({
      from: raf.from,
      to: raf.to
    });
  };
  render() {
    let w = this.state.width;
    let h = this.state.height;
    let d;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;

    d = h;
    w /= 2; // 1366/2
    h -= d / 6;
    const size = Math.min(h, w);
    const newColor = this.state.top === "w" ? "Black" : "White";

    const raf = this.nextRAF()[1];

    const topPlayer =
      this.state.top === "w" ? this.state.whitePlayer : this.state.blackPlayer;
    const bottomPlayer =
      this.state.top === "b" ? this.state.whitePlayer : this.state.blackPlayer;
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
          <img
            src={this.props.cssmanager.buttonBackgroundImage("fullScreen")}
            alt="full-screen"
          />
        </button>

        <div style={{ width: size }}>
          <Player
            PlayerData={topPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
          />
          <BlackPlayerClock
            cssmanager={this.props.cssmanager}
            ClockData1={topPlayer}
            side={size}
          />
        </div>
        <div style={this.props.cssmanager.fullWidth()}>
          <FallenSoldier
            side={size}
            color={tc}
            FallenSoldiers={topPlayerFallenSoldier}
          />
          <div style={this.props.cssmanager.parentPopup(h, w)}>
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
          <FallenSoldier
            side={size}
            color={bc}
            FallenSoldiers={bottomPlayerFallenSoldier}
          />
        </div>
        <div style={{ width: size }}>
          <Player
            PlayerData={bottomPlayer}
            cssmanager={this.props.cssmanager}
            side={size}
          />
          <WhitePlayerClock
            cssmanager={this.props.cssmanager}
            ClockData2={bottomPlayer}
            side={size}
          />
        </div>
      </div>
    );
  }
}
