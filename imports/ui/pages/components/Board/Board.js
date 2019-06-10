import React from "react";
import PieceSquare from "./PieceSquare.js";
import RankSquare from "./RankSquare.js";
import FileSquare from "./FileSquare.js";

/**
 * @param props React properties
 * @param props.board_class The class that defines the pieces and squares
 * @param props.board The chessboard in an 8x8 array of objects with {type: 'x', color: 'x'} or null
 * types: rbnqkp, color: bw
 * @param circles An array of ??? TODO: Define how to keep track of which squares have circles and what colors they are
 * @param arrows An array of ??? TODO: Define how to keep track of arrows and colors
 * @param props.draw_rank_and_file null, or 'tl', 'tr', 'bl', 'br', 'stl', 'str', 'sbl', 'sbr'
 * s = "in square". Without s means to the left, top, right, or bottom of the board itself.
 * @param props.side = Size of side of board in pixels
 * @param props.top = The color at the 'top' of the chessboard
 */
export default class Board extends React.Component {
  constructor(props) {
    super(props);

    if (props.draw_rank_and_file) {
      if (props.draw_rank_and_file.charAt(0) === "s") {
        this._frInSquare = props.draw_rank_and_file.substr(1);
      } else {
        if (props.draw_rank_and_file.charAt(0) === "t") this._fileline = "t";
        else if (props.draw_rank_and_file.charAt(0) === "b")
          this._fileline = "b";
        else this._fileline = "";

        if (props.draw_rank_and_file.charAt(1) === "l") this._rankline = "l";
        else if (props.draw_rank_and_file.charAt(1) === "r")
          this._rankline = "r";
        else this._rankline = "";
      }
    }

    const rank_squares =
      this._fileline === "t" || this._fileline === "b" ? 9 : 8;
    const file_squares =
      this._rankline === "l" || this._rankline === "r" ? 9 : 8;
    const h = props.side / file_squares;
    const w = props.side / rank_squares;
    this._square_side = h < w ? h : w;
  }

  renderFileSquare(file) {
    return (
      <FileSquare
        board_class={this.props.board_class}
        file={file}
        side={this._square_side}
      />
    );
  }

  renderFileRow() {
    let filerow = [];

    if (this.props.top === "w") {
      for (let file = 0; file < 8; file++) {
        filerow.push(this.renderFileSquare(file));
      }
    } else {
      for (let file = 7; file >= 0; file--) {
        filerow.push(this.renderFileSquare(file));
      }
    }

    return <div className={"chessboard-row"}>{filerow}</div>;
  }

  renderRankSquare(rank) {
    if (this.props.top !== "W") {
      rank = 7 - rank;
    }

    return (
      <RankSquare
        board_class={this.props.board_class}
        rank={rank}
        side={this._square_side}
      />
    );
  }

  renderSquare(rank, file) {
    let color;
    let piece;

    if (this.props.board[rank][file]) {
      color = this.props.board[rank][file].color;
      piece = this.props.board[rank][file].type;
    }

    if (this.props.top === "W") {
      file = 7 - file;
    } else {
      rank = 7 - rank;
    }

    return (
      <PieceSquare
        board_class={this.props.board_class}
        rank={rank}
        file={file}
        key={rank * 10 + file}
        color={color}
        piece={piece}
        draw_rank_and_file={this._frInSquare}
        onMouseUp={() => {}}
        onMouseDown={() => {}}
        side={this._square_side}
      />
    );
  }

  renderRankRow(rank) {
    let rankrow = [];

    if (this._rankline === "r") rankrow.push(this.renderRankSquare(rank));

    if (this.props.top === "w") {
      for (let file = 0; file < 8; file++) {
        rankrow.push(this.renderSquare(rank, file));
      }
    } else {
      for (let file = 7; file >= 0; file--) {
        rankrow.push(this.renderSquare(rank, file));
      }
    }

    if (this._rankline === "l") rankrow.push(this.renderRankSquare(rank));

    return (
      <div className={"chessboard-row"} key={"rank-" + rank}>
        {rankrow}
      </div>
    );
  }

  render() {
    let board = [];

    if (this._fileline === "t")
      board.push(this.renderFileRow(this.props.top === "b"));

    if (this.props.top === "w") {
      for (let rank = 7; rank >= 0; rank--) {
        board.push(this.renderRankRow(rank));
      }
    } else {
      for (let rank = 0; rank < 8; rank++) {
        board.push(this.renderRankRow(rank));
      }
    }

    if (this._fileline === "b")
      board.push(this.renderFileRow(this.props.top === "b"));

    return (
      <div
        style={{ width: this.props.side, height: this.props.side }}
        className="chessboard"
      >
        {board}
      </div>
    );
  }
}
