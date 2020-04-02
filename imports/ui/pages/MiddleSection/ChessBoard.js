import React, { PureComponent } from "react";

import Chess from "chess.js";
import Chessground from "react-chessground";
import "react-chessground/dist/assets/chessground.css";
import "react-chessground/dist/assets/theme.css"; // Or your own chess theme

export default class ChessBoard extends PureComponent {
  constructor(props) {
    super(props);
    this.chess = new Chess.Chess();
    this.state = {
      fen: this.chess.fen(),
      boardTop: "black"
    };
  }

  onMove = (from, to) => {
    console.log("-- " + from + " -- " + to);
    let move = this.chess.move({
      from: from,
      to: to,
      promotion: "q"
    });
    console.log("move in chessboard" + move);
    if (move === null) {
      this.setState({ fen: this.chess.fen() });
      // console.log("move has been "+ this.chess.fen());
      return;
    } else {
      let history = this.chess.history();
      let moves = history[history.length - 1];
      this.props.onDrop({
        move: moves
      });

      //  this.setState({ fen: this.chess.fen() });
    }
  };
  draggable() {
    if (
      this.props.gameStatus === "playing" ||
      (this.props.gameStatus === "examining" && this.props.currentGame === true)
    ) {
      return {
        enabled: true
      };
    } else {
      return {
        enabled: false
      };
    }
  }
  render() {
    console.log("pure fen " + this.props.fen);
    this.chess.load(this.props.fen);
    return (
      <div className="merida">
        <Chessground
          draggable={this.draggable()}
          selectable={this.draggable()}
          width={this.props.width}
          height={this.props.height}
          fen={this.props.fen}
          orientation={this.props.orientation}
          onMove={this.onMove}
        />
      </div>
    );
  }
}
