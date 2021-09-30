import React, { Component } from "react";
import AppWrapper from "../AppWrapper/AppWrapper";
import PlayRightSidebar from "../RightSidebar/PlayRightSidebar/PlayRightSidebar";
import "../../../../../imports/css/leftsidebar.css";
import Chess from "chess.js";

import { Col } from "antd";

import MiddleBoard from "../../MiddleSection/MiddleBoard";
import BoardWrapper from "../BoardWrapper/BoardWrapper";
import { colorBlackLetter, colorWhiteLetter } from "../../../../constants/gameConstants";
import { buildPgnFromMovelist } from "../../../../../lib/exportpgn";
import { cloneDeep, get } from "lodash";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/PlayPage_js");

export default class PlayPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      switchSides: Date.now(),
      variation: get(props, "game.variations"),
      chess: Chess.Chess(),
    };
  }

  componentDidMount() {
    const { game } = this.props;
    const movelist = get(game, "variations.movelist");

    if (movelist) {
      const pgn = buildPgnFromMovelist(movelist);

      const chess = Chess.Chess();
      chess.load_pgn(pgn);
      this.setState({ chess, variation: game.variations });
    }
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps) {
    const { game } = this.props;
    const movelist = get(game, "variations.movelist", []);

    if (game?.fen !== prevProps.game?.fen && movelist.length) {
      const pgn = buildPgnFromMovelist(movelist);

      const chess = Chess.Chess();
      chess.load_pgn(pgn);
      this.setState({ chess, variation: game.variations });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  _flipboard = () => {
    this.setState({ switchSides: Date.now() });
  };

  getTop = () => {
    const { game } = this.props;

    return game?.black?.id === Meteor.userId() ? colorWhiteLetter : colorBlackLetter;
  };

  moveBackward = () => {
    const { variation } = this.state;
    const currentVariation = get(variation, `movelist[${variation?.cmi}]`);

    this.moveToCMI(currentVariation?.prev || 0);
  };

  moveBackwardBeginning = () => {
    this.moveToCMI(0);
  };

  moveForward = () => {
    const { game } = this.props;
    const { variation } = this.state;

    const movelist = get(game, "variations.movelist");

    const nextCmi = get(movelist, `[${variation?.cmi}].variations[0]`, movelist.length - 1);
    this.moveToCMI(nextCmi);
  };

  moveForwardEnd = () => {
    const { game } = this.props;
    const movelist = get(game, "variations.movelist", 1);

    this.moveToCMI(movelist.length - 1);
  };

  moveToCMI = (cmi) => {
    const { game } = this.props;

    if (!game || !game.variations) return;

    const variation = cloneDeep(game.variations);
    const lastPgn = buildPgnFromMovelist(variation.movelist);
    const chessObject = Chess.Chess();

    chessObject.load_pgn(lastPgn);

    let cmilist = [cmi];
    let current_cmi = cmi;
    while (!!current_cmi) {
      current_cmi = variation.movelist[current_cmi].prev;
      cmilist.unshift(current_cmi);
    }
    if (!cmilist.length) cmilist = [0];

    //
    // Now make current_cmi whatever value matches in both trees
    // It could go all the way back up to move zero, but it may not.
    //
    let backtrack_to_cmi = variation.cmi;
    while (!cmilist.some((pcmi) => pcmi === backtrack_to_cmi))
      backtrack_to_cmi = variation.movelist[backtrack_to_cmi].prev;

    //
    // Remove all of the unnecesary cmi values from the traversal list.
    //
    const idx = cmilist.indexOf(backtrack_to_cmi);
    cmilist = cmilist.slice(idx + 1);

    //
    // Undo all of the moves to the shared node
    //
    current_cmi = variation.cmi;
    while (current_cmi !== backtrack_to_cmi) {
      chessObject.undo();
      current_cmi = variation.movelist[current_cmi].prev;
    }

    cmilist.forEach((new_cmi) => {
      if (!new_cmi) return;
      const result = chessObject.move(variation.movelist[new_cmi].move);
      if (!result) {
        log.fatal("Unable to move to new CMI", {
          cmi,
          cmilist,
          new_cmi,
          backtrack_to_cmi,
          gamecmi: variation.cmi,
          move: variation.movelist[new_cmi].move,
        });
      }
    });
    variation.cmi = cmi;

    this.setState({ variation, chess: chessObject });
  };

  render() {
    const {
      game,
      cssManager,
      capture,
      onDrop,
      onDrawObject,
      onRemoveCircle,
      onChooseFriend,
      onBotPlay,
      onSeekPlay,
    } = this.props;
    const { width, height, switchSides, chess, variation } = this.state;
    const isHistoryTurn = variation?.cmi !== game?.variations?.cmi;
    const gameClone = cloneDeep(game);

    if (gameClone) {
      gameClone.fen = chess.fen();
      gameClone.variations = variation;
    }

    return (
      <AppWrapper cssManager={cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={cssManager}
              playersInfo={{ black: gameClone?.black, white: gameClone?.white }}
              switchSides={switchSides}
              capture={capture}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              onRemoveCircle={onRemoveCircle}
              top={this.getTop()}
              width={width}
              height={height}
              game={gameClone}
              isHistoryTurn={isHistoryTurn}
              moveForwardEnd={this.moveForwardEnd}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <PlayRightSidebar
            moveBackward={this.moveBackward}
            moveForward={this.moveForward}
            moveBackwardBeginning={this.moveBackwardBeginning}
            moveForwardEnd={this.moveForwardEnd}
            moveToCMI={this.moveToCMI}
            game={gameClone}
            onChooseFriend={onChooseFriend}
            onBotPlay={onBotPlay}
            onSeekPlay={onSeekPlay}
            cssManager={cssManager}
            flip={this._flipboard}
            moveList={gameClone || {}}
          />
        </Col>
      </AppWrapper>
    );
  }
}
