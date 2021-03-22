import React, { Component } from "react";
import ChessBoard from "chessboard";

import Chess from "chess.js";

class NewChessBoard extends Component {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
      legalMoves: this.getLegalMoves(),
      circles: [],
      arrows: [],
      smartMoves: false,
      showLegalMoves: true,
      smallSize: 500
    };
  }

  componentDidMount() {
    this.setState({ legalMoves: this.getLegalMoves() });
  }

  componentDidUpdate(prevProps, prevState) {
    const { fen } = this.props;

    if (prevProps.fen !== fen) {
      this.setState({ legalMoves: this.getLegalMoves() });
    }
  }

  getColorFromEvent = event => {
    if (event.altKey && event.shiftKey) {
      return "#d40000";
    } else if (event.altKey && event.ctrlKey) {
      return "#f6e000";
    } else {
      return "#35bc00";
    }
  };

  handleUpdateCircles = circle => {
    const { gameStatus } = this.props;
    const { circles } = this.state;

    if (gameStatus === "playing") {
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

  getLegalMoves = () => {
    const moves = {};
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(rank => {
      for (let file = 1; file <= 8; file++) {
        const legal = this.chess
          .moves({ square: rank + file, verbose: true })
          .map(verbose => verbose.to);
        if (!!legal && !!legal.length) moves[rank + file] = legal;
      }
    });
    return moves;
  };

  handleMove = move => {
    const { onDrop } = this.props;

    this.chess.move(move[0] + move[1], { sloppy: true });

    const history = this.chess.history();
    const moves = history[history.length - 1];

    onDrop({ move: moves });

    this.setState({
      legalMoves: this.getLegalMoves()
    });
  };

  handleUpdateArrows = arrow => {
    const { gameStatus } = this.props;
    const { arrows } = this.state;

    if (gameStatus === "playing") {
      return;
    }

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

  haveLegalMoves = () => {
    const { turnColor, whiteId, blackId, gameStatus } = this.props;
    const userId = Meteor.userId();

    if (gameStatus !== "playing") {
      return true;
    }

    if (userId === whiteId && turnColor === "white") {
      return true;
    }

    return userId === blackId && turnColor === "black";
  };

  render() {
    const { orientation, fen } = this.props;
    const { legalMoves, circles, arrows, smartMoves, showLegalMoves, smallSize } = this.state;
    const hasLegalMoves = this.haveLegalMoves();

    this.chess.load(fen);

    return (
      <ChessBoard
        raf={{ inside: true, vertical: "bottom", horizontal: "right" }} // where is either an object or a string
        styles={{
          wrapper: {
            backgroundColor: "#292929"
          },
          files: {
            color: "white"
          },
          ranks: {
            color: "white"
          }
        }}
        perspective={orientation}
        fen={fen}
        boardSquares={{
          light: { default: "#FFFFFF", active: "#9c9c9c" },
          dark: { default: "#1565c0", active: "#1255A1" }
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
          wR: "images/chesspieces/wR.png"
        }}
        movable={hasLegalMoves ? legalMoves : []}
        circles={circles}
        arrows={arrows}
        onUpdateCircles={circle => this.handleUpdateCircles(circle)}
        onUpdateArrows={arrow => this.handleUpdateArrows(arrow)}
        onMove={move => this.handleMove(move)}
        smartMoves={smartMoves}
        showLegalMoves={showLegalMoves}
        smallSize={smallSize}
      />
    );
  }
}

export default NewChessBoard;
