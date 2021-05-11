import React, { Component } from "react";

import ChessBoard from "chessboard";
import "chessboard/dist/index.css";

import Chess from "../../../../node_modules/chess.js/chess";
import AppWrapper from "../components/AppWrapper/AppWrapper";
import PropertiesModal from "./PropertiesModal";

class CustomizableBoard extends Component {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
      legalMoves: this.getLegalMoves(),
      fen: this.chess.fen(),
      raf: { inside: true, vertical: "top", horizontal: "right" },
      circles: [],
      arrows: [],
      smartMoves: false,
      showLegalMoves: true,
      smallSize: 500,
      promotionPieces: ["q", "r", "b", "n"],
      perspective: "white",
      boardColorsLight: { default: "#FFFFFF", active: "#9c9c9c" },
      boardColorsDark: { default: "#1565c0", active: "#1255A1" },
      wrapperColor: "#292929",
      promotionColor: "#a8a8a8",
      filesColor: "#ffffff",
      ranksColor: "#ffffff",
    };
  }

  getColorFromEvent = () => {
    return "#fafafa";
  };

  handleUpdateCircles = (circle) => {
    const { circles } = this.state;

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
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach((rank) => {
      for (let file = 1; file <= 8; file++) {
        const legal = this.chess
          .moves({ square: rank + file, verbose: true })
          .map((verbose) => verbose.to);
        if (!!legal && !!legal.length) moves[rank + file] = legal;
      }
    });
    return moves;
  };

  handleMove = (move, promotion) => {
    this.chess.move(move[0] + move[1] + promotion, { sloppy: true });
    this.setState({ legalMoves: this.getLegalMoves(), fen: this.chess.fen() });
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

  handleModalUpdate = (newStateProperties) => {
    this.setState({ ...newStateProperties });
  };

  render() {
    const {
      fen,
      raf,
      legalMoves,
      circles,
      arrows,
      smartMoves,
      showLegalMoves,
      smallSize,
      promotionPieces,
      perspective,
      boardColorsLight,
      boardColorsDark,
      wrapperColor,
      promotionColor,
      filesColor,
      ranksColor,
    } = this.state;

    return (
      <AppWrapper>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          <ChessBoard
            raf={raf}
            perspective={perspective}
            fen={fen}
            boardSquares={{
              light: { ...boardColorsLight },
              dark: { ...boardColorsDark },
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
            styles={{
              wrapper: {
                backgroundColor: wrapperColor,
              },
              files: {
                color: filesColor,
              },
              ranks: {
                color: ranksColor,
              },
              promotion: {
                backgroundColor: promotionColor,
              },
            }}
            movable={legalMoves}
            circles={circles}
            arrows={arrows}
            onUpdateCircles={(circle) => this.handleUpdateCircles(circle)}
            onUpdateArrows={(arrow) => this.handleUpdateArrows(arrow)}
            onMove={(move, promotion) => this.handleMove(move, promotion)}
            smartMoves={smartMoves}
            showLegalMoves={showLegalMoves}
            smallSize={smallSize}
            promotionPieces={promotionPieces}
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
          <PropertiesModal
            raf={raf}
            boardColorsLight={boardColorsLight}
            boardColorsDark={boardColorsDark}
            smartMoves={smartMoves}
            smallSize={smallSize}
            showLegalMoves={showLegalMoves}
            promotionPieces={promotionPieces}
            perspective={perspective}
            wrapperColor={wrapperColor}
            promotionColor={promotionColor}
            handleUpdate={this.handleModalUpdate}
          />
        </div>
      </AppWrapper>
    );
  }
}

export default CustomizableBoard;
