import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Game, mongoCss } from "../../../../imports/api/client/collections.js";
import Chess from "chess.js/chess";
import { compose } from "redux";
//import Chessground from "react-chessground";
import FenParser from "@chess-fu/fen-parser";
import { Col } from "antd";

import CssManager from "../components/Css/CssManager";
import EditorRightSidebar from "../components/RightSidebar/EditorRightSidebar/EditorRightSidebar";
import Loading from "../components/Loading/Loading";
import BoardWrapper from "../components/BoardWrapper/BoardWrapper";
import { Logger } from "../../../../lib/client/Logger";

import AppWrapper from "../components/AppWrapper/AppWrapper";
import { getBoardSquares, isReadySubscriptions } from "../../../utils/utils";
import ChessBoard, { PiecesSidebar } from "chessboard";
import { colorBlack, colorWhite, gameStatusPlaying } from "../../../constants/gameConstants";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const log = new Logger("client/Editor_js");

class Editor extends Component {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
      whiteCastling: [],
      blackCastling: [],
      orientation: "white",
      arrows: [],
      circles: [],
      edit: {},
    };

    if (props.isReady && props.examineGame) {
      this.setInitial();
    }
  }

  componentDidUpdate(prevProps) {
    const { examineGame } = this.props;

    if (examineGame && this.chess.fen() !== examineGame.fen) {
      this.chess.load(examineGame.fen);
    }
  }

  setInitial = () => {
    const { examineGame } = this.props;

    const fenParser = new FenParser(examineGame.fen);
    const { whiteCastling, blackCastling } = this.getCastling(fenParser.castles);

    this.chess.load(examineGame.fen);

    this.setState({ whiteCastling, blackCastling });
  };

  getCastling = (castling) => {
    const result = { whiteCastling: [], blackCastling: [] };

    castling.split("").forEach((letter) => {
      if (letter === letter.toUpperCase()) {
        result.whiteCastling.push(letter);
      } else {
        result.blackCastling.push(letter);
      }
    });

    return result;
  };

  generateFen = (fen) => {
    const { examineGame } = this.props;

    const miniFen = fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    const serverFen = examineGame?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

    const chess = new Chess.Chess();
    let flags = serverFen.split(" ").slice(1).join(" ");

    const sigh = `${miniFen} ${flags}`;
    log.debug("sigh=" + sigh + ", validate=", JSON.stringify(chess.validate_fen(sigh)));
    return sigh;
  };

  handleChange = () => {
    const { examineGame } = this.props;

    const newFen = this.generateFen();
    Meteor.call("loadFen", "loadFen", examineGame._id, newFen, (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleCastling = (white, black) => {
    const { examineGame } = this.props;

    log.debug("Editor::handleCastling", [white, black]);
    Meteor.call(
      "setCastling",
      "setCastling",
      examineGame._id,
      white.toLowerCase(),
      black,
      (err) => {
        if (err) {
          log.error(err.reason);
        }
      }
    );
  };

  handleStartPosition = () => {
    const { examineGame } = this.props;

    log.debug("Editor::handleStartPosition");
    Meteor.call("setStartingPosition", "setStartingPosition", examineGame._id, (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleClear = () => {
    const { examineGame } = this.props;

    log.debug("Editor::handleClear");
    Meteor.call("clearBoard", "clearBoard", examineGame._id, (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleFlip = () => {
    log.debug("Editor::handleFlip");
    this.setState((prevState) => {
      return {
        orientation: prevState.orientation === colorWhite ? colorBlack : colorWhite,
      };
    });
  };

  handleColorChange = (color) => {
    const { examineGame } = this.props;

    log.debug("Editor::handleColorChange", color);
    this.setState({ color });
    Meteor.call("setToMove", "setToMove", examineGame._id, color, (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleNewFen = (newFen) => {
    const { examineGame } = this.props;

    log.debug("Editor::handleNewFen", newFen);
    Meteor.call("loadFen", "loadFen", examineGame._id, newFen, (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  calcBoardSize = () => {
    log.debug("Editor::calcBoardSize");

    return Math.min(window.innerHeight / 1.3, window.innerWidth / 2.5);
  };

  handleUpdateArrows = (arrow) => {
    const { arrows } = this.state;

    arrow.color = this.getColorFromEvent(arrow.event);
    delete arrow.event;

    let equalIndex;
    const isExists = arrows.some((element, index) => {
      const isEqual =
        element.piece.to === arrow.piece.to && element.piece.from === arrow.piece.from;

      if (isEqual) {
        equalIndex = index;
      }

      return isEqual;
    });

    if (isExists) {
      arrows.splice(equalIndex, 1);
    } else {
      arrows.push(arrow);
    }

    this.setState({ arrows: [...arrows] });
  };

  getColorFromEvent = (event) => {
    if (event.altKey && event.shiftKey) {
      return "#d40000";
    } else if (event.altKey && event.ctrlKey) {
      return "#f6e000";
    } else {
      return "#35bc00";
    }
  };

  handleUpdateCircles = (circle) => {
    const { gameStatus } = this.props;
    const { circles } = this.state;

    if (gameStatus === gameStatusPlaying) {
      return;
    }

    circle.color = this.getColorFromEvent(circle.event);
    delete circle.event;

    let equalIndex;
    const isExists = circles.some((element, index) => {
      const isEqual = circle.piece === element.piece;

      if (isEqual) {
        equalIndex = index;
      }

      return isEqual;
    });

    if (isExists) {
      circles.splice(equalIndex, 1);
    } else {
      circles.push(circle);
    }

    this.setState({ circles: [...circles] });
  };

  handleMove = (currentMove) => {
    const { examineGame } = this.props;

    const currentSquare = this.chess.get(currentMove[0]);

    this.chess.remove(currentMove[0]);
    this.chess.put(currentSquare, currentMove[1]);

    Meteor.call("loadFen", "loadFen", examineGame._id, this.chess.fen(), (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  handleAdd = (piece) => {
    this.setState({ edit: { add: piece } });
  };

  handlePieceAdd = (piece, square) => {
    const { examineGame } = this.props;

    const isAdded = this.chess.put({ type: piece[1].toLowerCase(), color: piece[0] }, square);

    if (isAdded) {
      Meteor.call("loadFen", "loadFen", examineGame._id, this.chess.fen(), (err) => {
        if (err) {
          log.error(err.reason);
        }
      });
    }

    this.setState({ edit: {} });
  };

  handlePieceDelete = (square) => {
    const { examineGame } = this.props;

    this.chess.remove(square);
    Meteor.call("loadFen", "loadFen", examineGame._id, this.chess.fen(), (err) => {
      if (err) {
        log.error(err.reason);
      }
    });
  };

  render() {
    const { isReady, systemCss, examineGame, classes } = this.props;
    const { whiteCastling, blackCastling, orientation, arrows, circles, edit } = this.state;

    if (!isReady || !examineGame) {
      return <Loading />;
    }

    const css = new CssManager(systemCss?.systemCss || {}, systemCss?.userCss || {});
    const boardSize = this.calcBoardSize();

    return (
      <AppWrapper cssManager={css}>
        <Col span={14} className={classes.main}>
          <BoardWrapper>
            <div style={{ width: "100%", height: boardSize }}>
              <ChessBoard
                raf={{
                  inside: false,
                  vertical: "bottom",
                  horizontal: "right",
                }}
                styles={{
                  wrapper: {
                    backgroundColor: "#292929",
                  },
                  files: {
                    color: "white",
                  },
                  ranks: {
                    color: "white",
                  },
                  promotion: {
                    backgroundColor: "#a8a8a8",
                  },
                }}
                perspective={orientation}
                fen={this.chess.fen()}
                boardSquares={{
                  light: { default: "#FFFFFF", active: "#9c9c9c" },
                  dark: { default: "#1565c0", active: "#1255A1" },
                }}
                pieceImages={{
                  bB: "images/chesspieces/bB.png",
                  bK: "images/chesspieces/bK.png",
                  bN: "images/chesspieces/bN.png",
                  bP: "images/chesspieces/bP.png",
                  bQ: "images/chesspieces/bQ.png",
                  bR: "images/chesspieces/bR.png",
                  wB: "images/chesspieces/wB.png",
                  wK: "images/chesspieces/wK.png",
                  wN: "images/chesspieces/wN.png",
                  wP: "images/chesspieces/wP.png",
                  wQ: "images/chesspieces/wQ.png",
                  wR: "images/chesspieces/wR.png",
                }}
                movable={() => getBoardSquares()}
                circles={circles}
                arrows={arrows}
                onUpdateCircles={(circle) => this.handleUpdateCircles(circle)}
                onUpdateArrows={(arrow) => this.handleUpdateArrows(arrow)}
                onMove={(move) => this.handleMove(move)}
                smartMoves={false}
                showLegalMoves={false}
                smallSize={500}
                promotionPieces={["q", "n", "b", "r"]}
                edit={edit}
                handleAdd={this.handlePieceAdd}
                handleDelete={this.handlePieceDelete}
                accessibilityPieces={{
                  bP: "Black pawn",
                  bR: "Black rook",
                  bN: "Black knight",
                  bB: "Black bishop",
                  bQ: "Black queen",
                  bK: "Black king",
                  wP: "White pawn",
                  wR: "White rook",
                  wN: "White knight",
                  wB: "White bishop",
                  wQ: "White queen",
                  wK: "White king",
                  emptySquare: "Empty square",
                }}
              />
            </div>
          </BoardWrapper>
        </Col>
        <Col span={10} className={classes.rightSideBarWrapper}>
          <PiecesSidebar
            pieceImages={{
              bB: "images/chesspieces/bB.png",
              bK: "images/chesspieces/bK.png",
              bN: "images/chesspieces/bN.png",
              bP: "images/chesspieces/bP.png",
              bQ: "images/chesspieces/bQ.png",
              bR: "images/chesspieces/bR.png",
              wB: "images/chesspieces/wB.png",
              wK: "images/chesspieces/wK.png",
              wN: "images/chesspieces/wN.png",
              wP: "images/chesspieces/wP.png",
              wQ: "images/chesspieces/wQ.png",
              wR: "images/chesspieces/wR.png",
            }}
            size={boardSize / 12}
            onAdd={this.handleAdd}
            style={{
              backgroundColor: "#c7cbd5",
            }}
          />
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

export default compose(
  withTracker(() => {
    const subscriptions = {
      chats: Meteor.subscribe("chat"),
      game: Meteor.subscribe("games"),
      importedGame: Meteor.subscribe("imported_games"),
      users: Meteor.subscribe("loggedOnUsers"),
    };

    return {
      isReady: isReadySubscriptions(subscriptions),
      examineGame: Game.findOne({ "examiners.id": Meteor.userId() }),
      systemCss: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(Editor);
