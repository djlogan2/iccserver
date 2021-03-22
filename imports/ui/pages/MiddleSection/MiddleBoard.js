import React, { Component } from "react";
import Player from "./Player";
import BlackPlayerClock from "./BlackPlayerClock";
import { Meteor } from "meteor/meteor";
import Chess from "chess.js";

import { translate } from "../../HOCs/translate";
import ChessBoard from "./ChessBoard";
import NewChessBoard from "./NewChessBoard";

class MiddleBoard extends Component {
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
    const { top, switchSides } = this.props;

    if (prevProps.top !== top) {
      this.setState({ top });
    }

    if (switchSides !== prevProps.switchSides) {
      this.switchSides();
    }
  }

  switchSides = () => {
    const { top } = this.state;

    const newTop = top === "w" ? "b" : "w";
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

  calcBoardSize = () => {
    const { width, height } = this.props;

    return Math.min(height / 1.3, width / 2.5);
  };

  calcSize = () => {
    const { width, height } = this.props;

    return Math.min(height / 1.3, width / 2.5);
  };

  getTopPlayerData = () => {
    const { game } = this.props;
    const { top } = this.state;

    if (game) {
      return top === "w" ? game.white : game.black;
    }
  };

  getBottomPlayerData = () => {
    const { game } = this.props;
    const { top } = this.state;

    if (game) {
      return top === "b" ? game.white : game.black;
    }
  };

  render() {
    const {
      translate,
      game,
      capture,
      MiddleBoardData,
      cssManager,
      onDrawObject,
      onDrop,
      height
    } = this.props;
    const { top } = this.state;

    if (!!game && !game.fen) {
      return null;
    }

    if (!!game) {
      this.chess.load(game.fen);
    }

    let boardsize = this.calcBoardSize();
    let size = this.calcSize();

    const topPlayer = this.getTopPlayerData();
    const bottomPlayer = this.getBottomPlayerData();

    const topPlayertime = top === "w" ? "white" : "black";
    const bottomPlayertime = top === "b" ? "white" : "black";

    const topPlayerFallenSoldier = top === "w" ? capture.b : capture.w;
    const bottomPlayerFallenSoldier = top === "b" ? capture.b : capture.w;
    const tc = top === "w" ? "b" : "w";
    const bc = top === "b" ? "b" : "w";

    let boardtop;

    if (top === "w") {
      boardtop = "black";
    } else {
      boardtop = "white";
    }

    let topPlayermsg;
    let botPlayermsg;
    let color;

    if (game && game.status === "playing") {
      if (MiddleBoardData.black.id === Meteor.userId()) {
        if (this.chess.turn() === "b") {
          botPlayermsg = translate("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translate("waitingforopponent");
          color = "#fff";
        }
      } else {
        if (this.chess.turn() === "w") {
          botPlayermsg = translate("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translate("waitingforopponent");
          color = "#fff";
        }
      }
    }
    let fen;
    if (!!game && (game.status === "examining" || game.status === "playing")) {
      fen = game.fen;
    } else {
      fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    const isUserPlaying = !!game && game.status === "playing";
    const isUserExamining = !!game && game.status === "examining";

    const isPlayingOrExamining = isUserPlaying || isUserExamining;

    return (
      <div
        style={{
          width: size,
          height,
          display: "flex",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        {isPlayingOrExamining && (
          <Player
            playerData={topPlayer}
            cssManager={cssManager}
            side={size}
            color={tc}
            turnColor={color}
            FallenSoldiers={topPlayerFallenSoldier}
            Playermsg={topPlayermsg}
          />
        )}

        <BlackPlayerClock game={game} color={topPlayertime} side={size} />
        {game && (
          <NewChessBoard
            fen={fen}
            height={boardsize}
            width={boardsize}
            arrows={game.arrows}
            circles={game.circles}
            orientation={boardtop}
            onDrop={onDrop}
            onDrawObject={onDrawObject}
            gameStatus={game.status}
            turnColor={this.chess.turn() === "w" ? "white" : "black"}
            blackId={game?.black?.id}
            whiteId={game?.white?.id}
          />
        )}

        {isPlayingOrExamining && (
          <Player
            playerData={bottomPlayer}
            cssManager={cssManager}
            side={size}
            color={bc}
            turnColor={color}
            FallenSoldiers={bottomPlayerFallenSoldier}
            Playermsg={botPlayermsg}
          />
        )}
        <BlackPlayerClock game={game} color={bottomPlayertime} side={size} />
      </div>
    );
  }
}

export default translate("Common.MiddleBoard")(MiddleBoard);
