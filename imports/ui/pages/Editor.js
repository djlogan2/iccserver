import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss, GameHistoryCollection, Game } from "../../api/client/collections.js";
import Chess from "chess.js";
import Chessground from "react-chessground";
import FenParser from "@chess-fu/fen-parser";
import { Col } from "antd";

import CssManager from "./components/Css/CssManager";
import EditorRightSidebar from "./components/RightSidebar/EditorRightSidebar";
import Loading from "../pages/components/Loading";
import Spare from "./components/Spare";
import BoardWrapper from "./components/BoardWrapper";
import { Logger } from "../../../lib/client/Logger";

import AppWrapper from "./components/AppWrapper";
import { isReadySubscriptions } from "../../utils/utils";

const log = new Logger("client/Editor_js");

class Editor extends Component {
  constructor(props) {
    super(props);
    log.debug("Editor constructor", props);

    this.state = {
      whiteCastling: [],
      blackCastling: [],
      orientation: "white"
    };

    if (this.props.isready && this.props.examine_game) {
      this.setInitial();
    }

    this.pendingMove = null;
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    if (!!this.chessground) this.chessground.cg.redrawAll();
  };

  setInitial = () => {
    log.debug("Editor::setInitial");
    const fenParser = new FenParser(this.props.examine_game.fen);
    let { whiteCastling, blackCastling } = this.getCastling(fenParser.castles);
    this.setState({ whiteCastling, blackCastling });
  };

  getCastling(castling) {
    log.debug("Editor::getCastling", castling);
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

  generateFen = () => {
    log.debug("Editor::generateFen");
    let miniFen = !!this.chessground
      ? this.chessground.cg.getFen()
      : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    let serverFen = !!this.props.examine_game
      ? this.props.examine_game.fen
      : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    const chess = new Chess.Chess();
    log.debug("serverFen=" + serverFen);
    log.debug("miniFen  =" + miniFen);
    let flags = serverFen
      .split(" ")
      .slice(1)
      .join(" ");
    const sigh = `${miniFen} ${flags}`;
    log.debug("sigh     =" + sigh + ", validate=", chess.validate_fen(sigh));
    return sigh;
  };

  handleChange = () => {
    log.debug("Editor::handleChange");
    let newFen = this.generateFen();
    Meteor.call("loadFen", "loadFen", this.props.examine_game._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleDropStart = (piece, e) => {
    log.debug("Editor::handleDropStart", piece);
    if (!!this.chessground) this.chessground.cg.dragNewPiece(piece, e, true);
  };

  handleCastling = (white, black) => {
    log.debug("Editor::handleCastling", [white, black]);
    // 'k', 'q', 'kq'
    Meteor.call(
      "setCastling",
      "setCastling",
      this.props.examine_game._id,
      white.toLowerCase(),
      black,
      err => {
        if (err) {
          log.error(err.reason);
        }
      }
    );
  };

  handleStartPosition = () => {
    log.debug("Editor::handleStartPosition");
    Meteor.call("setStartingPosition", "setStartingPosition", this.props.examine_game._id, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleClear = () => {
    log.debug("Editor::handleClear");
    Meteor.call("clearBoard", "clearBoard", this.props.examine_game._id, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleFlip = () => {
    log.debug("Editor::handleFlip");
    this.setState({
      orientation: this.state.orientation === "white" ? "black" : "white"
    });
  };

  handleColorChange = color => {
    log.debug("Editor::handleColorChange", color);
    this.setState({ color });
    Meteor.call("setToMove", "setToMove", this.props.examine_game._id, color, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleNewFen = newFen => {
    log.debug("Editor::handleNewFen", newFen);
    Meteor.call("loadFen", "loadFen", this.props.examine_game._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  calcBoardSize = () => {
    log.debug("Editor::calcBoardSize");
    let w = window.innerWidth;
    let h = window.innerHeight;

    return Math.min(h / 1.3, w / 2.5);
  };

  render() {
    log.trace("Editor render", this.props);

    if (!this.props.isready) return <Loading />;

    const { whiteCastling, blackCastling, orientation } = this.state;

    let css;
    let { systemCss, boardCss } = this.props;
    if (systemCss !== undefined && boardCss !== undefined) {
      css = new CssManager(systemCss, boardCss);
    }

    if (this.chessground) {
      this.chessground.cg.state.viewOnly = false;
    }

    if (!this.props.examine_game) {
      log.error("Editor_js LOADING");
    }
    const baordSize = this.calcBoardSize();

    return (
      <AppWrapper className="editor" cssManager={css}>
        <Col span={14} className="editor__main">
          <BoardWrapper>
            <div className="merida">
              <Chessground
                fen={this.props.examine_game.fen}
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
                }}
                onChange={this.handleChange}
                resizable={true}
                ref={el => {
                  this.chessground = el;
                }}
              />
            </div>
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
            fen={this.props.examine_game.fen}
            orientation={orientation}
            color={this.props.examine_game.tomove}
            whiteCastling={whiteCastling}
            blackCastling={blackCastling}
          />
        </Col>
      </AppWrapper>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {
    chats: Meteor.subscribe("chat"),
    clientMessages: Meteor.subscribe("client_messages"),
    game: Meteor.subscribe("games"),
    importedGame: Meteor.subscribe("imported_games"),
    users: Meteor.subscribe("loggedOnUsers"),
    userData: Meteor.subscribe("userData")
  };

  return {
    isready: isReadySubscriptions(subscriptions),
    examine_game: Game.findOne({ "examiners.id": Meteor.userId() }),
    gameHistory: GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch(),
    systemCss: mongoCss.findOne({ type: "system" }),
    boardCss: mongoCss.findOne({ $and: [{ type: "board" }, { name: "default-user" }] })
  };
})(Editor);
