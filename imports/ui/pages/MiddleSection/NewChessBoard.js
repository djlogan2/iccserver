import React, { Component } from "react";
import ChessBoard from "chessboard";

class NewChessBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      legalMoves: this.getLegalMoves(),
      circles: [],
      arrows: [],
      smartMoves: false,
      showLegalMoves: true,
      smallSize: 500,
      fen: null
    };
  }

  componentDidMount() {
    const { chess } = this.props;

    this.setState({ legalMoves: this.getLegalMoves(), fen: chess.fen() });
  }

  componentDidUpdate(prevProps, prevState) {
    const { chess } = this.props;
    const { fen } = this.state;

    if (fen !== chess.fen()) {
      this.setState({ legalMoves: this.getLegalMoves(), fen: chess.fen() });
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
    const { chess } = this.props;
    const moves = {};
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(rank => {
      for (let file = 1; file <= 8; file++) {
        const legal = chess
          .moves({ square: rank + file, verbose: true })
          .map(verbose => verbose.to);
        if (!!legal && !!legal.length) moves[rank + file] = legal;
      }
    });
    return moves;
  };

  handleMove = (move, promotion) => {
    const { onDrop, chess } = this.props;

    chess.move(move[0] + move[1] + promotion, { sloppy: true });

    const history = chess.history();
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
    const { chess, whiteId, blackId, gameStatus } = this.props;
    const userId = Meteor.userId();

    if (gameStatus !== "playing") {
      return true;
    }

    if (userId === whiteId && chess.turn() === "w") {
      return true;
    }

    return userId === blackId && chess.turn() === "b";
  };

  render() {
    const { orientation, chess } = this.props;
    const { legalMoves, circles, arrows, smartMoves, showLegalMoves, smallSize } = this.state;
    const hasLegalMoves = this.haveLegalMoves();

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
          },
          promotion: {
            backgroundColor: "#535353"
          }
        }}
        perspective={orientation}
        fen={chess.fen()}
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
        movable={hasLegalMoves ? legalMoves : {}}
        circles={circles}
        arrows={arrows}
        onUpdateCircles={circle => this.handleUpdateCircles(circle)}
        onUpdateArrows={arrow => this.handleUpdateArrows(arrow)}
        onMove={(move, promotion) => this.handleMove(move, promotion)}
        smartMoves={smartMoves}
        showLegalMoves={showLegalMoves}
        smallSize={smallSize}
        promotionPieces={["q", "n", "b", "r"]}
      />
    );
  }
}

export default NewChessBoard;
