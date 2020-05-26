import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss, GameHistoryCollection, Game } from "./../../api/collections.js";
import Chess from "chess.js";
import Chessground from "react-chessground";
import ChessBoard from "./MiddleSection/ChessBoard.js";
import FenParser from "@chess-fu/fen-parser";
import { Icon, List, Col, Row, Modal, Button, Avatar } from "antd";
import { Link } from "react-router-dom";

import "antd/dist/antd.css";

import CssManager from "./components/Css/CssManager";
import EditorRightSidebar from "./components/RightSidebar/EditorRightSidebar";
import Spare from "./components/Spare";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../lib/client/Logger";

import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";

import "./css/developmentboard.css";
import "./css/Spare.css";
import "react-chessground/dist/assets/theme.css";

const log = new Logger("client/LoginPage_js");

class Editor extends React.Component {
  chess = new Chess.Chess();

  state = {
    gameId: null,
    whiteCastling: [],
    blackCastling: [],
    orientation: "white",
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
    Meteor.subscribe("css");
    Meteor.subscribe("game_history");
  }

  componentWillUnmount() {
    Meteor.unsubscribe("css");
    Meteor.unsubscribe("game_history");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.observed_games.length === 0 && this.props.observed_games.length > 0) {
      let game = this.props.observed_games[0];
      this.setInitial(game);
    }
    if (prevProps.observed_games.length > 0) {
      if (prevProps.observed_games[0].fen !== this.props.observed_games[0].fen) {
        let newFen = this.props.observed_games[0].fen;
        this.chessground.cg.set({ fen: newFen });
        this.setState({ fen: newFen });
      }
    }
  }

  setInitial = game => {
    const fenParser = new FenParser(game.fen);
    let { whiteCastling, blackCastling } = this.getCastling(fenParser.castles);
    this.setState({ gameId: game._id, whiteCastling, blackCastling });
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

  handleChange = e => {
    this.setState({
      fen: this.chessground.cg.getFen()
    });
    Meteor.call("loadFen", "loadFen", this.state.gameId, this.chessground.cg.getFen());
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
    Meteor.call("setCastling", "setCastling", this.state.gameId, white.toLowerCase(), black);
  };

  handleStartPosition = () => {
    const FEN_DATA = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.chess.load(FEN_DATA);
    this.chessground.cg.set({ fen: this.chess.fen() });
    this.setState({
      fen: this.chess.fen()
    });
    Meteor.call("setStartingPosition", "setStartingPosition", this.state.gameId);
  };

  handleClear = () => {
    // const FEN_DATA = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    this.chess.clear();
    this.chessground.cg.set({ fen: this.chess.fen() });
    this.setState({
      fen: this.chess.fen()
    });
    Meteor.call("clearBoard", "clearBoard", this.state.gameId);
  };

  handleFlip = () => {
    this.setState({
      orientation: this.state.orientation === "white" ? "black" : "white"
    });
  };

  handleColorChange = color => {
    this.setState({
      orientation: color
    });
  };

  handleNewFen = newFen => {
    this.chessground.cg.set({ fen: newFen });
  };

  render() {
    const {
      whiteCastling,
      blackCastling,
      orientation,
      selectVisible,
      userTimeout,
      comTimeout,
      fen,
      visibleUserwin,
      visibleComwin,
      visibleDraw,
      lastMove,
      scoreUser,
      scoreCom,
      mytime,
      opptime,
      userHistory,
      pause,
      isPaused
    } = this.state;

    let css;
    let { systemCss, boardCss } = this.props;
    if (systemCss !== undefined && boardCss !== undefined) {
      css = new CssManager(systemCss, boardCss);
    }

    if (this.chessground) {
      this.chessground.cg.state.viewOnly = pause;
    }

    const buttonStyles = {
      fontSize: 20,
      //   width: "11vw",
      //   height: "4vw",
      background: "#3c93b0",
      border: 0,
      color: "white"
    };
    return (
      <div style={{ background: "#2b313c", height: "100vh" }}>
        <Row>
          <Col span={3}>
            {css && (
              <LeftSidebar
                cssmanager={css}
                // LefSideBoarData={this.Main.LeftSection}
                // history={this.props.history}
                // gameHistory={this.props.gameHistoryload}
                // examineAction={this.examineActionHandler}
              />
            )}
          </Col>
          <Col span={12}>
            <div className="merida" style={{ margin: "58px" }}>
              <Chessground
                width="40vw"
                height="40vw"
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
                // viewOnly={true}
                // lastMove={lastMove}
                // scoreUser={scoreUser}
                // scoreCom={scoreCom}
                // fen={fen}
                //   fen={"rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1"}
                // onMove={this.onMove}
                ref={el => {
                  this.chessground = el;
                }}
              />
            </div>
          </Col>
          <Col span={9} className="editor-right-sidebar-wrapper">
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
              whiteCastling={whiteCastling}
              blackCastling={blackCastling}
            />
          </Col>
        </Row>
      </div>
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

// export default Editor;
