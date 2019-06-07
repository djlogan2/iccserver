import React from "react";
import "../css/chessbord";
import Square from "./Square.js";

/**
 * @param props React properties
 * @param props.board_class The class that defines the pieces and squares
 * @param props.board The chessboard in an 8x8 array of objects with {type: 'x', color: 'x'} or null
 * types: rbnqkp, color: bw
 * @param circles An array of ??? TODO: Define how to keep track of which squares have circles and what colors they are
 * @param arrows An array of ??? TODO: Define how to keep track of arrows and colors
 * @param props.show_rank null, left, right
 * @param props.show_file null, top, bottom
 * @param props.side = Size of side of board in pixels
 * @param props.top = The color at the 'top' of the chessboard
 */
export default class Board extends React.Component {
  renderSquare(rank, file, side) {
    let color;
    let piece;

    if (this.props.board[rank][file]) {
      color = this.props.board[rank][file].color;
      piece = this.props.board[rank][file].type;
    }
    return (
      <Square
        board_class={this.props.board_class}
        rank={rank}
        file={file}
        color={color}
        piece={piece}
        draw_rank_and_file={false}
        onMouseUp={() => {}}
        onMouseDown={() => {}}
        side={side}
      />
    );
  }

  render() {
    const ranks = 8 + !!this.props.show_file;
    const files = 8 + !!this.props.show_rank;
    const rank_side = this.props.side / ranks;
    const file_side = this.props.side / files;
    const side = rank_side < file_side ? rank_side : file_side;
    let board = [];

    if (this.props.top === "b") {
      for (let file = 7; file >= 0; file--) {
        for (let rank = 0; rank < 8; rank++) {
          board.push(this.renderSquare(rank, file, side));
        }
      }
    } else {
      for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
          board.push(this.renderSquare(rank, file, side));
        }
      }
    }
    return <div className="main-square">{board}</div>;
  }
}
