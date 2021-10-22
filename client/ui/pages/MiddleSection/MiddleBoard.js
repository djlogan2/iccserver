import React, { Component } from "react";
import Player from "./Player";
import PlayerClock from "./PlayerClock/PlayerClock";
import { Meteor } from "meteor/meteor";
import Chess from "chess.js/chess";

import { translate } from "../../HOCs/translate";
import NewChessBoard from "./NewChessBoard";
import "./ChessBoard";
import {
  BOARD_BASE_FEN,
  colorBlack,
  colorBlackLetter,
  colorWhite,
  colorWhiteLetter,
  gameStatusExamining,
  gameStatusPlaying,
} from "../../../constants/gameConstants";
import Analytics from "../components/Analytics/Analytics";
import { Logger } from "../../../../lib/client/Logger";
import { getColorByLetter } from "../../../utils/utils";
import { noop } from "lodash";

const log = new Logger("client/Player_js");

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

  getMugshot = (id) => {
    if (id) return Meteor.users.findOne({ _id: id })?.mugshot;
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
            mugshot: this.getMugshot(game?.white?.id),
            editable: this.isEditable(game?.status),
          },
          bottomPlayer: {
            ...game?.black,
            locale: this.getLocale(game?.black?.id),
            mugshot: this.getMugshot(game?.black?.id),
            editable: this.isEditable(game?.status),
          },
        }
      : {
          topPlayer: {
            ...game?.black,
            locale: this.getLocale(game?.black?.id),
            mugshot: this.getMugshot(game?.black?.id),
            editable: this.isEditable(game?.status),
          },
          bottomPlayer: {
            ...game?.white,
            locale: this.getLocale(game?.white?.id),
            mugshot: this.getMugshot(game?.white?.id),
            editable: this.isEditable(game?.status),
          },
        };
  };

  getFallenSoliders = () => {
    const { capture } = this.props;
    const { top } = this.state;

    return {
      topFallenSoliders: top === colorWhiteLetter ? capture?.b : capture?.w,
      bottomFallenSoliders: top === colorBlackLetter ? capture?.b : capture?.w,
    };
  };

  handleUpdate = (data, callback = noop) => {
    const { game } = this.props;

    if (game?._id) {
      Meteor.call("setTags", "set_tag", game._id, data, (err) => {
        if (err) {
          log.error(err);
        } else {
          callback();
        }
      });
    }
  };

  render() {
    const {
      translate,
      game,
      playersInfo,
      cssManager,
      onDrawObject,
      onDrop,
      isHistoryTurn,
      moveForwardEnd,
    } = this.props;
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

    const tc = top === colorWhiteLetter ? colorWhiteLetter : colorBlackLetter;
    const bc = top === colorWhiteLetter ? colorBlackLetter : colorWhiteLetter;

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
      this.chess.load(BOARD_BASE_FEN);
    }

    const isPlayingOrExamining =
      !!game?.status && (game.status === gameStatusPlaying || game.status === gameStatusExamining);
    const timerBlinkingSecs = Meteor.user()?.settings?.default_timer_blinking || 10;

    return (
      <div style={{ width: boardSize }}>
        {isPlayingOrExamining && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
            <PlayerClock
              game={game}
              color={topPlayerTime}
              tagColor={getColorByLetter(topPlayerTime[0])}
              timerBlinkingSecs={timerBlinkingSecs}
              side={boardSize}
              isGameOn={game.status === gameStatusPlaying}
              isMyTurn={game.tomove === topPlayerTime}
              handleUpdate={this.handleUpdate}
            />
          </div>
        )}
        {game && (
          <div style={{ width: "100%", height: boardSize }}>
            <NewChessBoard
              gameId={game._id}
              currentCmi={game?.variations?.cmi}
              chess={this.chess}
              height={boardSize}
              width={boardSize}
              arrows={game.arrows || []}
              circles={game.circles || []}
              orientation={top === colorWhiteLetter ? colorBlack : colorWhite}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              gameStatus={game.status}
              premove={game.premove}
              blackId={game?.black?.id}
              whiteId={game?.white?.id}
              variations={game.variations}
              isHistoryTurn={isHistoryTurn}
              moveForwardEnd={moveForwardEnd}
            />
            <div
              style={{
                position: "relative",
                top: -boardSize / 2,
                left: boardSize / 2 + 20,
                pointerEvents: "none",
              }}
            >
              {game && game.status === gameStatusExamining && (
                <Analytics orientation={top === colorWhiteLetter ? colorBlack : colorWhite} />
              )}
            </div>
          </div>
        )}

        {isPlayingOrExamining && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            <PlayerClock
              game={game}
              color={bottomPlayerTime}
              tagColor={getColorByLetter(bottomPlayerTime[0])}
              timerBlinkingSecs={timerBlinkingSecs}
              side={boardSize}
              isGameOn={game.status === gameStatusPlaying}
              isMyTurn={game.tomove === bottomPlayerTime}
              handleUpdate={this.handleUpdate}
            />
          </div>
        )}
      </div>
    );
  }
}

export default translate("Common.MiddleBoard")(MiddleBoard);
