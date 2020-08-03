import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss, GameHistoryCollection, Game } from "../../api/client/collections.js";
import Chess from "chess.js";
import Chessground from "react-chessground";
import FenParser from "@chess-fu/fen-parser";
import { Col, Row } from "antd";

import CssManager from "./components/Css/CssManager";
import EditorRightSidebar from "./components/RightSidebar/EditorRightSidebar";
import Spare from "./components/Spare";
import Loading from "./components/Loading";
import BoardWrapper from "./components/BoardWrapper";
import { Logger } from "../../../lib/client/Logger";

// import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import AppWrapper from "./components/AppWrapper";

const log = new Logger("client/Editor_js");

class Editor extends Component {
  chess = new Chess.Chess();

  state = {
    gameId: null,
    game: null,
    whiteCastling: [],
    blackCastling: [],
    orientation: "white",
    color: "w",
    selectVisible: false,
    visibleUserwin: false,
    visibleComwin: false,
    visibleDraw: false,
    userTimeout: false,
    comTimeout: false,
    isPaused: false,
    isPausedCom: true,
    time: 600,
    timeCom: 600,
    mytime: "",
    opptime: "",
    fen: "1n3bnr/ppp1p2p/2kr4/2pqp1p1/8/2P3p1/PPP1PPPP/RNBQKBNR w - - 0 1",
    lastMove: null,
    scoreUser: 10,
    scoreCom: 10,
    userHistory: [],
    pause: false
  };

  pendingMove = null;

  componentDidMount() {
    this.initNewExamineGame();
    window.addEventListener("resize", this.handleResize);
    this.cssSubscribe = Meteor.subscribe("css");
    this.gameHistorySubscribe = Meteor.subscribe("game_history");
    this.observingGameSubscribe = Meteor.subscribe("observing_games");
    this.gameSubscribe = Meteor.subscribe("games");

    // game: Meteor.subscribe("games"),
    // gameRequests: Meteor.subscribe("game_requests"),
    // clientMessages: Meteor.subscribe("client_messages"),
    // //observingGames: Meteor.subscribe("observing_games"),
    // gameHistory: Meteor.subscribe("game_history"),
    // importedGame: Meteor.subscribe("imported_games")
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.cssSubscribe && this.cssSubscribe.stop();
    this.gameHistorySubscribe && this.gameHistorySubscribe.stop();
    this.observingGameSubscribe && this.observingGameSubscribe.stop();
  }

  componentDidUpdate(prevProps) {
    if (this.state.game === null && this.props.observed_games.length > 0) {
      let game = this.props.observed_games[0];
      this.setInitial(game);
    }
    if (prevProps.observed_games.length > 0 && this.props.observed_games.length > 0) {
      if (prevProps.observed_games[0].fen !== this.props.observed_games[0].fen) {
        let game = this.props.observed_games[0];
        let newFen = game.fen;
        this.chessground.cg.set({ fen: newFen });
        this.setState({ fen: newFen, game: game });
      }
    }
  }

  handleResize = e => {
    this.chessground.cg.redrawAll();
  };

  setInitial = game => {
    const fenParser = new FenParser(game.fen);
    let { whiteCastling, blackCastling } = this.getCastling(fenParser.castles);
    this.setState({ game: game, gameId: game._id, whiteCastling, blackCastling });
    setTimeout(() => {
      this.chessground.cg.set({ fen: game.fen });
    }, 0);
  };

  getCastling(castling) {
    let result = { whiteCastling: [], blackCastling: [] };
    castling.split("").forEach(letter => {
      if (letter === letter.toUpperCase()) {
        result.whiteCastling.push(letter);
        return;
      }
      result.blackCastling.push(letter);
    });
    return result;
  }

  initNewExamineGame = () => {
    let observedGames = Game.find({ "observers.id": Meteor.userId() }).fetch();
    if (observedGames.length === 0) {
      this.startLocalExaminedGame();
    }
  };

  startLocalExaminedGame = () => {
    Meteor.call(
      "startLocalExaminedGame",
      "startlocalExaminedGame",
      "Mr white",
      "Mr black",
      0,
      (err, response) => {
        if (err) {
          log.error(err.reason);
        }
      }
    );
  };

  generateFen = () => {
    let miniFen = this.chessground.cg.getFen();
    let serverFen = this.state.game.fen;
    let flags = serverFen
      .split(" ")
      .slice(1)
      .join(" ");
    return `${miniFen} ${flags}`;
  };

  handleChange = e => {
    let newFen = this.generateFen();
    this.setState({ fen: newFen });
    Meteor.call("loadFen", "loadFen", this.state.gameId, newFen, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleDropStart = (piece, e) => {
    // piece, event, force
    // this.chessground.cg.dragNewPiece("pointer", e, true);
    this.chessground.cg.dragNewPiece(piece, e, true);

    // this.chessground.cg.state.events.dropnewpiece()
    // this.chessground.cg.newPiece({ role: "rook", color: "white" }, "f3");
  };

  handleCastling = (white, black) => {
    // 'k', 'q', 'kq'
    Meteor.call(
      "setCastling",
      "setCastling",
      this.state.gameId,
      white.toLowerCase(),
      black,
      (err, response) => {
        if (err) {
          log.error(err.reason);
        }
      }
    );
  };

  handleStartPosition = () => {
    const FEN_DATA = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.chess.load(FEN_DATA);
    this.chessground.cg.set({ fen: this.chess.fen() });
    this.setState({
      fen: this.chess.fen()
    });
    Meteor.call(
      "setStartingPosition",
      "setStartingPosition",
      this.state.gameId,
      (err, response) => {
        if (err) {
          log.error(err.reason);
        }
      }
    );
  };

  handleClear = () => {
    // const FEN_DATA = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    this.chess.clear();
    let newFen = this.generateFen();
    this.chessground.cg.set({ fen: newFen });
    this.setState({
      fen: newFen
    });
    Meteor.call("clearBoard", "clearBoard", this.state.gameId, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleFlip = () => {
    this.setState({
      orientation: this.state.orientation === "white" ? "black" : "white"
    });
  };

  handleColorChange = color => {
    this.setState({ color });
    Meteor.call("setToMove", "setToMove", this.state.gameId, color, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleNewFen = newFen => {
    Meteor.call("loadFen", "loadFen", this.state.gameId, newFen, (err, response) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  calcBoardSize = () => {
    let w = window.innerWidth;
    let h = window.innerHeight;

    return Math.min(h / 1.3, w / 2.5);
  };

  render() {
    const { whiteCastling, blackCastling, orientation, color, fen, pause } = this.state;

    let css;
    let { systemCss, boardCss } = this.props;
    if (systemCss !== undefined && boardCss !== undefined) {
      css = new CssManager(systemCss, boardCss);
    }

    if (this.chessground) {
      this.chessground.cg.state.viewOnly = pause;
    }

    if (this.props.observed_games.length === 0) {
      return <Loading />;
    }
    const baordSize = this.calcBoardSize();

    return (
      <AppWrapper className="editor" cssManager={css}>
        <Col span={14} className="editor__main">
          <BoardWrapper>
            {this.state.game !== null && (
              <div className="merida">
                <Chessground
                  width={baordSize}
                  height={baordSize}
                  orientation={orientation}
                  draggable={{
                    enabled: true, // allow moves & premoves to use drag'n drop
                    distance: 1, // minimum distance to initiate a drag; in pixels
                    autoDistance: true, // lets chessground set distance to zero when user drags pieces
                    centerPiece: true, // center the piece on cursor at drag start
                    showGhost: true, // show ghost of piece being dragged
                    deleteOnDropOff: true // delete a piece when it is dropped off the board
                    // current?: DragCurrent;
                  }}
                  onChange={this.handleChange}
                  resizable={true}
                  ref={el => {
                    this.chessground = el;
                  }}
                />
              </div>
            )}
          </BoardWrapper>
        </Col>
        <Col span={10} className="editor-right-sidebar-wrapper">
          <Spare onDropStart={this.handleDropStart} />
          <EditorRightSidebar
            onStartPosition={this.handleStartPosition}
            onCastling={this.handleCastling}
            onClear={this.handleClear}
            onFlip={this.handleFlip}
            onFen={this.handleNewFen}
            onColorChange={this.handleColorChange}
            fen={fen}
            orientation={orientation}
            color={color}
            whiteCastling={whiteCastling}
            blackCastling={blackCastling}
          />
        </Col>
      </AppWrapper>
    );
  }
}

export default withTracker(props => {
  return {
    observed_games: Game.find({
      "observers.id": Meteor.userId()
    }).fetch(),
    gameHistory: GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Editor);
