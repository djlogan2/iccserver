import React, { Component } from "react";
import Player from "./Player";
import BlackPlayerClock from "./BlackPlayerClock";
import { Meteor } from "meteor/meteor";
import Chess from "chess.js/chess";

import { translate } from "../../HOCs/translate";
import NewChessBoard from "./NewChessBoard";
import "./ChessBoard";
import {
  boardBaseFen,
  colorBlackLetter,
  colorWhiteLetter,
  gameStatusExamining,
  gameStatusPlaying,
} from "../../../constants/gameConstants";

class MiddleBoard extends Component {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
      top: props.top,
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

    const newTop = top === colorWhiteLetter ? colorBlackLetter : colorWhiteLetter;
    this.setState({ top: newTop });
  };

  calcBoardSize = () => {
    const { width, height } = this.props;

    return Math.min(height / 1.3, width / 2.5);
  };

  getPlayersData = () => {
    const { game } = this.props;
    const { top } = this.state;

    return top === colorWhiteLetter
      ? { topPlayer: game?.white, bottomPlayer: game?.black }
      : { topPlayer: game?.black, bottomPlayer: game?.white };
  };

  render() {
    const { translate, game, capture, playersInfo, cssManager, onDrawObject, onDrop } = this.props;
    const { top } = this.state;

    if (!!game && !game.fen) {
      return null;
    }

    if (!!game) {
      this.chess.load(game.fen);
    }

    const boardSize = this.calcBoardSize();
    const { topPlayer, bottomPlayer } = this.getPlayersData();

    const topPlayerTime = top === "w" ? "white" : "black";
    const bottomPlayerTime = top === "b" ? "white" : "black";

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

    if (game && game.status === gameStatusPlaying) {
      if (playersInfo.black.id === Meteor.userId()) {
        if (this.chess.turn() === colorBlackLetter) {
          botPlayermsg = translate("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translate("waitingforopponent");
          color = "#fff";
        }
      } else {
        if (this.chess.turn() === colorWhiteLetter) {
          botPlayermsg = translate("yourturn");
          color = "#4cd034";
        } else {
          topPlayermsg = translate("waitingforopponent");
          color = "#fff";
        }
      }
    }

    if (!!game && (game.status === gameStatusExamining || game.status === gameStatusPlaying)) {
      this.chess.load(game.fen);
    } else {
      this.chess.load(boardBaseFen);
    }

    const isPlayingOrExamining =
      !!game?.status && (game.status === gameStatusPlaying || game.status === gameStatusExamining);

    return (
      <div style={{ width: boardSize }}>
        {isPlayingOrExamining && (
          <Player
            playerData={topPlayer}
            cssManager={cssManager}
            side={boardSize}
            color={tc}
            turnColor={color}
            FallenSoldiers={topPlayerFallenSoldier}
            message={topPlayermsg}
          />
        )}

        <BlackPlayerClock game={game} color={topPlayerTime} side={boardSize} />
        {game && (
          <div style={{ width: boardSize, height: boardSize }}>
            <NewChessBoard
              chess={this.chess}
              height={boardSize}
              width={boardSize}
              arrows={game.arrows}
              circles={game.circles}
              orientation={boardtop}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              gameStatus={game.status}
              premove={game.premove}
              blackId={game?.black?.id}
              whiteId={game?.white?.id}
              variations={game.variations}
            />
          </div>
        )}

        {isPlayingOrExamining && (
          <Player
            playerData={bottomPlayer}
            cssManager={cssManager}
            side={boardSize}
            color={bc}
            turnColor={color}
            FallenSoldiers={bottomPlayerFallenSoldier}
            Playermsg={botPlayermsg}
          />
        )}
        <BlackPlayerClock game={game} color={bottomPlayerTime} side={boardSize} />
      </div>
    );
  }
}

export default translate("Common.MiddleBoard")(MiddleBoard);
