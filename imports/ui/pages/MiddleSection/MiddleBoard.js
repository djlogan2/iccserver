import React, { Component } from "react";
import "../css/ChessBoard";
import Player from "./Player";
import "../css/developmentboard.css";
import BlackPlayerClock from "./BlackPlayerClock";
import Chessboard from "chessboardjsx";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/MiddleBoard");

export default class MiddleBoard extends Component {
  constructor(props) {
    super(props);
    this._circle = { lineWidth: 2, color: "red" };
    //MiddleBoardData: {BlackPlayer: {…}, WhitePlayer: {…}
    this.state = {
      fen: props.board.fen(),
      istakeback: false,
      draw_rank_and_file: "bl",
      top: props.top,
      boardTop: "black",
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
  /* shouldComponentUpdate(nextProps, nextState) {
    if (nextState.update === 1) {
      return true;
    }
    if (nextState.fen !== this.state.fen) {
      return true;
    }
    //return true;
  } */
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
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.board.fen() !== prevState.fen) {
      return { board: nextProps.board, update: 0 };
    }
  }
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

  onDrop = ({ sourceSquare, targetSquare }) => {
    let move = this.props.board.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    if (move === null) {
      return;
    } else {
      let history = this.props.board.history();
      let moves = history[history.length - 1];
      this.props.onDrop({
        move: moves
      });
      this.setState({ fen: this.props.board.fen(), update: 1 });
    }
  };
  render() {
    let w = this.props.width;
    let h = this.props.height;
    let d;

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

    let bordtop;
    if (this.state.top === "w") {
      bordtop = "black";
    } else {
      bordtop = "white";
    }
    let turn = false;
    //TODO:DRAGEABLE FALSE AND TRUE ACCODING GAME TURN
    if (
      (this.props.MiddleBoardData.white.id === Meteor.userId() &&
        this.props.board.turn() === "w" &&
        this.props.gameStatus === "playing") ||
      (this.props.gameStatus === "examining" && this.props.currentGame === true)
    ) {
      turn = true;
    } else if (
      (this.props.MiddleBoardData.black.id === Meteor.userId() &&
        this.props.board.turn() === "b" &&
        this.props.gameStatus === "playing") ||
      (this.props.gameStatus === "examining" && this.props.currentGame === true)
    ) {
      turn = true;
    }
    let topPlayermsg;
    let botPlayermsg;
    let color;
    if (this.props.gameStatus === "playing") {
      if (this.props.MiddleBoardData.black.id === Meteor.userId()) {
        if (this.props.board.turn() === "b") {
          botPlayermsg = "(Your Turn)";
          color = "#4cd034";
        } else {
          topPlayermsg = "(waiting for opponent)";
          color = "#fff";
        }
      } else {
        if (this.props.board.turn() === "w") {
          botPlayermsg = "(Your Turn)";
          color = "#4cd034";
        } else {
          topPlayermsg = "(waiting for opponent)";
          color = "#fff";
        }
      }
    }

    return (
      <div>
        {/*   <button
          onClick={this.switchSides.bind(this)}
          style={this.props.cssmanager.buttonStyle("middleBoard")}
        >
          <img src={this.props.cssmanager.buttonBackgroundImage("fullScreen")} alt="full-screen" />
        </button> */}

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
            ClockData={topPlayerClock}
            side={size}
          />

          <Chessboard
            id="allowDrag"
            darkSquareStyle={{ backgroundColor: "rgb(21, 101, 192)" }}
            lightSquareStyle={{ backgroundColor: "rgb(255, 255, 255)" }}
            calcWidth={({ screenWidth }) => boardsize}
            position={this.props.board.fen()}
            onDrop={this.onDrop}
            orientation={bordtop}
            undo={this.props.undo}
            boardStyle={{
              borderRadius: "5px",
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
            }}
            draggable={turn}
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
            ClockData={bottomPlayerClock}
            side={size}
          />
        </div>
      </div>
    );
  }
}
