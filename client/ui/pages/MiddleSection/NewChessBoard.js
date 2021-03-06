import React, { Component } from "react";
import ChessBoard from "chessboard";
import { isEqual } from "lodash";
import { getBoardSquares } from "../../../utils/utils";
import Chess from "chess.js/chess";

class NewChessBoard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: Date.now(),
      legalMoves: this.getLegalMoves(),
      circles: [],
      arrows: [],
      smartMoves: false,
      showLegalMoves: true,
      smallSize: 500,
      fen: null,
      lastMove: null,
      premoveColor: "#6e009e",
      premove: false,
    };
  }

  componentDidMount() {
    const { chess } = this.props;
    window.addEventListener("resize", this.updateWindowSize);

    this.setState({ legalMoves: this.getLegalMoves(), fen: chess.fen() });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowSize);
  }

  updateWindowSize = () => {
    this.setState({
      key: Date.now(),
    });
  };

  getArrowsDependOnPremove = (premove, prevPremove) => {
    const { arrows, premoveColor } = this.state;

    if (premove) {
      this.setState({ premove: true });
    } else {
      this.setState({ premove: false });
    }

    if (!premove && prevPremove) {
      let equalIndex;
      const isExists = arrows.some((element, index) => {
        const isEqual =
          element.piece.to === prevPremove.to && element.piece.from === prevPremove.from;

        if (isEqual) {
          equalIndex = index;
        }

        return isEqual;
      });

      if (isExists) {
        arrows.splice(equalIndex, 1);
      }

      this.setState({ arrows: [...arrows] });
    }

    if (!prevPremove && premove) {
      arrows.push({ piece: { from: premove.from, to: premove.to }, color: premoveColor });
      this.setState({ arrows: [...arrows] });
    }

    if (prevPremove && premove) {
      let equalIndex;
      const isExists = arrows.some((element, index) => {
        const isEqual =
          element.piece.to === prevPremove.to && element.piece.from === prevPremove.from;

        if (isEqual) {
          equalIndex = index;
        }

        return isEqual;
      });

      if (isExists) {
        arrows.splice(equalIndex, 1);
      }

      arrows.push({ piece: { from: premove.from, to: premove.to }, color: premoveColor });
      this.setState({ arrows: [...arrows] });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { chess, premove } = this.props;
    const { fen } = this.state;

    if (!isEqual(premove, prevProps.premove)) {
      this.getArrowsDependOnPremove(premove, prevProps.premove);
    }

    if (fen !== chess.fen()) {
      this.setState({ legalMoves: this.getLegalMoves(), fen: chess.fen() });
    }
  }

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
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach((rank) => {
      for (let file = 1; file <= 8; file++) {
        const legal = chess
          .moves({ square: rank + file, verbose: true })
          .map((verbose) => verbose.to);
        if (!!legal && !!legal.length) moves[rank + file] = legal;
      }
    });
    return moves;
  };

  handleMove = (move, promotion) => {
    const { onDrop, chess } = this.props;

    const isCurrentTurn = this.isCurrentTurn();

    if (isCurrentTurn) {
      const lastMove = chess.move(move[0] + move[1] + promotion, { sloppy: true });

      const history = chess.history();
      const moves = history[history.length - 1];

      onDrop({ move: moves });

      this.setState({
        lastMove,
        legalMoves: this.getLegalMoves(),
      });
    } else {
      const temp = new Chess.Chess(chess.fen());
      const moves = temp.moves();
      let found = false;
      for (let x = 0; !found && x < moves.length; x++) {
        temp.move(moves[x]);
        const result = temp.move(move[0] + move[1] + promotion, { sloppy: true });
        if (!!result) {
          const history = temp.history();
          const moves = history[history.length - 1];

          onDrop({ move: moves });
          return;
        }
        temp.undo();
      }
    }
  };

  handleUpdateArrows = (arrow) => {
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

  isCurrentTurn = () => {
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

  getLastMove = () => {
    const { variations } = this.props;
    if (variations.cmi && variations.movelist[variations.cmi]) {
      return variations.movelist[variations.cmi].smith;
    }
  };

  handleRemovePremove = () => {
    const { gameId } = this.props;

    Meteor.call("removeLocalPremove", "removeLocalPremove", gameId);
  };

  render() {
    const { orientation, chess } = this.props;
    const {
      legalMoves,
      circles,
      arrows,
      smartMoves,
      showLegalMoves,
      smallSize,
      key,
      premove,
    } = this.state;
    const isCurrentTurn = this.isCurrentTurn();

    const lastMove = this.getLastMove();

    return (
      <ChessBoard
        key={key}
        raf={{ inside: false, vertical: "bottom", horizontal: "right" }}
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
          lastMove: "5px solid #3CFF33",
        }}
        lastMove={lastMove}
        showLastMove
        perspective={orientation}
        fen={chess.fen()}
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
        movable={isCurrentTurn ? legalMoves : () => getBoardSquares()}
        circles={circles}
        arrows={arrows}
        onUpdateCircles={(circle) => this.handleUpdateCircles(circle)}
        onUpdateArrows={(arrow) => this.handleUpdateArrows(arrow)}
        onMove={(move, promotion) => this.handleMove(move, promotion)}
        handleDelete={this.handleRemovePremove}
        smartMoves={smartMoves}
        edit={premove ? {} : null}
        showLegalMoves={isCurrentTurn && showLegalMoves}
        smallSize={smallSize}
        promotionPieces={["q", "n", "b", "r"]}
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
          legalMoves: "Legal moves: ",
        }}
      />
    );
  }
}

export default NewChessBoard;
