import React, { Component } from "react";
import Player from "./Player";
import BlackPlayerClock from "./BlackPlayerClock";
import { Meteor } from "meteor/meteor";
import Chess from "chess.js/chess";

import { translate } from "../../HOCs/translate";
import NewChessBoard from "./NewChessBoard";
import "./ChessBoard";
import {
  colorWhite,
  colorBlack,
  boardBaseFen,
  colorBlackLetter,
  colorWhiteLetter,
  gameStatusExamining,
  gameStatusPlaying,
} from "../../../constants/gameConstants";
import Mugshot from "../components/Mugshot/Mugshot";

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

  getLocale = (id) => {
    if (id) return Meteor.users.findOne({ _id: id })?.locale;
  };

  isEditable = (status) => {
    return status === gameStatusExamining;
  };

  getPlayersData = () => {
    const { game } = this.props;
    const { top } = this.state;

    return top === colorWhiteLetter
      ? {
          topPlayer: {
            ...game?.white,
            locale: this.getLocale(game?.white?.id),
            editable: this.isEditable(game?.status),
          },
          bottomPlayer: {
            ...game?.black,
            locale: this.getLocale(game?.black?.id),
            editable: this.isEditable(game?.status),
          },
        }
      : {
          topPlayer: {
            ...game?.black,
            locale: this.getLocale(game?.black?.id),
            editable: this.isEditable(game?.status),
          },
          bottomPlayer: {
            ...game?.white,
            locale: this.getLocale(game?.white?.id),
            editable: this.isEditable(game?.status),
          },
        };
  };

  getFallenSoliders = () => {
    const { capture } = this.props;
    const { top } = this.state;

    return {
      topFallenSoliders: top === colorWhiteLetter ? capture.b : capture.w,
      bottomFallenSoliders: top === colorBlackLetter ? capture.b : capture.w,
    };
  };

  render() {
    const { translate, game, playersInfo, cssManager, onDrawObject, onDrop } = this.props;
    const { top } = this.state;

    if (!!game && !game.fen) {
      return null;
    }

    if (!!game) {
      this.chess.load(game.fen);
    }

    const boardSize = this.calcBoardSize();
    const { topPlayer, bottomPlayer } = this.getPlayersData();
    const { topFallenSoliders, bottomFallenSoliders } = this.getFallenSoliders();

    const topPlayerTime = top === colorWhiteLetter ? colorWhite : colorBlack;
    const bottomPlayerTime = top === colorBlackLetter ? colorWhite : colorBlack;

    const tc = top === colorWhiteLetter ? colorBlackLetter : colorWhiteLetter;
    const bc = top === colorBlackLetter ? colorBlackLetter : colorWhiteLetter;

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
            gameId={game?._id}
            playerData={topPlayer}
            cssManager={cssManager}
            side={boardSize}
            color={tc}
            turnColor={color}
            FallenSoldiers={topFallenSoliders}
            message={topPlayermsg}
          />
        )}

        <BlackPlayerClock game={game} color={topPlayerTime} side={boardSize} />
        {game && (
          <div style={{ width: "100%", height: boardSize }}>
            <NewChessBoard
              gameId={game._id}
              chess={this.chess}
              height={boardSize}
              width={boardSize}
              arrows={game.arrows}
              circles={game.circles}
              orientation={top === colorWhiteLetter ? colorBlack : colorWhite}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              gameStatus={game.status}
              premove={game.premove}
              blackId={game?.black?.id}
              whiteId={game?.white?.id}
              variations={game.variations}
            />
            <div
              style={{
                position: "relative",
                top: -boardSize / 2,
                left: boardSize / 2 + 20,
              }}
            >
              <Mugshot orientation={top === colorWhiteLetter ? colorBlack : colorWhite} />
            </div>
          </div>
        )}

        {isPlayingOrExamining && (
          <Player
            gameId={game?._id}
            playerData={bottomPlayer}
            cssManager={cssManager}
            side={boardSize}
            color={bc}
            turnColor={color}
            FallenSoldiers={bottomFallenSoliders}
            Playermsg={botPlayermsg}
          />
        )}
        <BlackPlayerClock game={game} color={bottomPlayerTime} side={boardSize} />
      </div>
    );
  }
}

export default translate("Common.MiddleBoard")(MiddleBoard);
