import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Game, GameHistoryCollection, mongoCss } from "../../api/client/collections.js";
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

    this.state = {
      whiteCastling: [],
      blackCastling: [],
      orientation: "white"
    };

    if (props.isReady && props.examineGame) {
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
    if (!!this.chessground) {
      this.chessground.cg.redrawAll();
    }
  };

  setInitial = () => {
    const { examineGame } = this.props;

    const fenParser = new FenParser(examineGame.fen);
    const { whiteCastling, blackCastling } = this.getCastling(fenParser.castles);

    this.setState({ whiteCastling, blackCastling });
  };

  getCastling = castling => {
    const result = { whiteCastling: [], blackCastling: [] };

    castling.split("").forEach(letter => {
      if (letter === letter.toUpperCase()) {
        result.whiteCastling.push(letter);
      } else {
        result.blackCastling.push(letter);
      }
    });

    return result;
  };

  generateFen = () => {
    const { examineGame } = this.props;

    const miniFen = !!this.chessground
      ? this.chessground.cg.getFen()
      : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    const serverFen = !!examineGame
      ? examineGame.fen
      : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

    const chess = new Chess.Chess();
    let flags = serverFen
      .split(" ")
      .slice(1)
      .join(" ");

    const sigh = `${miniFen} ${flags}`;
    log.debug("sigh=" + sigh + ", validate=", chess.validate_fen(sigh));
    return sigh;
  };

  handleChange = () => {
    const { examineGame } = this.props;

    const newFen = this.generateFen();
    Meteor.call("loadFen", "loadFen", examineGame._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleDropStart = (piece, e) => {
    log.debug("Editor::handleDropStart", piece);

    if (!!this.chessground) {
      this.chessground.cg.dragNewPiece(piece, e, true);
    }
  };

  handleCastling = (white, black) => {
    const { examineGame } = this.props;

    log.debug("Editor::handleCastling", [white, black]);
    // 'k', 'q', 'kq'
    Meteor.call("setCastling", "setCastling", examineGame._id, white.toLowerCase(), black, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleStartPosition = () => {
    const { examineGame } = this.props;

    log.debug("Editor::handleStartPosition");
    Meteor.call("setStartingPosition", "setStartingPosition", examineGame._id, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleClear = () => {
    const { examineGame } = this.props;

    log.debug("Editor::handleClear");
    Meteor.call("clearBoard", "clearBoard", examineGame._id, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleFlip = () => {
    log.debug("Editor::handleFlip");

    this.setState(prevState => {
      return {
        orientation: prevState.orientation === "white" ? "black" : "white"
      };
    });
  };

  handleColorChange = color => {
    const { examineGame } = this.props;

    log.debug("Editor::handleColorChange", color);
    this.setState({ color });
    Meteor.call("setToMove", "setToMove", examineGame._id, color, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleNewFen = newFen => {
    const { examineGame } = this.props;

    log.debug("Editor::handleNewFen", newFen);
    Meteor.call("loadFen", "loadFen", examineGame._id, newFen, err => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  calcBoardSize = () => {
    log.debug("Editor::calcBoardSize");

    return Math.min(window.innerHeight / 1.3, window.innerWidth / 2.5);
  };

  updateChessground = element => {
    this.chessground = element;
  };

  render() {
    const { isReady, systemCss, examineGame } = this.props;
    const { whiteCastling, blackCastling, orientation } = this.state;

    if (!isReady) {
      return <Loading />;
    }

    const css = new CssManager(systemCss.systemCss, systemCss.userCss);

    if (this.chessground) {
      this.chessground.cg.state.viewOnly = false;
    }

    if (!examineGame) {
      log.error("Editor_js LOADING");
      return <Loading />;
    }

    const baordSize = this.calcBoardSize();

    return (
      <AppWrapper className="editor" cssManager={css}>
        <Col span={14} className="editor__main">
          <BoardWrapper>
            <div className="merida">
              <Chessground
                fen={examineGame.fen}
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
                ref={this.updateChessground}
              />
            </div>
          </BoardWrapper>
        </Col>
        <Col span={10} className="editor-right-sidebar-wrapper">
          <Spare onDropStart={this.handleDropStart} />
          <EditorRightSidebar
            fen={examineGame.fen}
            orientation={orientation}
            color={examineGame.tomove}
            whiteCastling={whiteCastling}
            blackCastling={blackCastling}
            onStartPosition={this.handleStartPosition}
            onCastling={this.handleCastling}
            onClear={this.handleClear}
            onFlip={this.handleFlip}
            onFen={this.handleNewFen}
            onColorChange={this.handleColorChange}
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
    users: Meteor.subscribe("loggedOnUsers")
  };

  return {
    isReady: isReadySubscriptions(subscriptions),
    examineGame: Game.findOne({ "examiners.id": Meteor.userId() }),
    gameHistory: GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch(),
    systemCss: mongoCss.findOne()
  };
})(Editor);
