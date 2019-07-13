import React from "react";
import PieceSquare from "./PieceSquare.js";
import RankSquare from "./RankSquare.js";
import FileSquare from "./FileSquare.js";

/**
 * @param props React properties
 * @param props.cssmanager {CssManager} The CSS Manager
 * @param props.circle.lineWidth the line width for the circle
 * @param props.circle.color the line color for the circle
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
    this.state = { circles: [] };
    this._circle = this.props.circle;
  }

  _setup() {
    if (this.props.draw_rank_and_file) {
      if (this.props.draw_rank_and_file.charAt(0) === "s") {
        this._frInSquare = this.props.draw_rank_and_file.substr(1);
        this._rankline = "";
        this._fileline = "";
      } else {
        this._frInSquare = "";
        if (this.props.draw_rank_and_file.charAt(0) === "t")
          this._fileline = "t";
        else if (this.props.draw_rank_and_file.charAt(0) === "b")
          this._fileline = "b";
        else this._fileline = "";

        if (this.props.draw_rank_and_file.charAt(1) === "l")
          this._rankline = "l";
        else if (this.props.draw_rank_and_file.charAt(1) === "r")
          this._rankline = "r";
        else this._rankline = "";
      }
    } else {
      this._rankline = "";
      this._fileline = "";
      this._frInSquare = "";
    }

    const rank_squares =
      this._fileline === "t" || this._fileline === "b" ? 9 : 8;
    const file_squares =
      this._rankline === "l" || this._rankline === "r" ? 9 : 8;
    const h = this.props.side / file_squares;
    const w = this.props.side / rank_squares;
    this._square_side = h < w ? h : w;
  }

  _circleObject(rank, file) {
    const circleobj = this.state.circles.filter(obj => {
      return obj.rank === rank && obj.file === file;
    });
    if (circleobj && circleobj.length !== 0)
      return { lineWidth: circleobj[0].lineWidth, color: circleobj[0].color };
  }

  /**
   *
   * @param rank The rank for where to add a circle
   * @param file The file for where to add a circle
   */
  addCircle(rank, file) {
    const have = this._circleObject(rank, file);
    if (have) {
      if (
        have.lineWidth === this._circle.lineWidth &&
        have.color === this._circle.color
      )
        return;
      this.removeCircle(rank, file);
    }
    const c = { rank: rank, file: file };
    Object.assign(c, this._circle);
    let newarray = this.state.circles.splice(0);
    newarray.push(c);
    this.setState({ circles: newarray });
  }

  /**
   *
   * @param rank The rank of the circle to remove
   * @param file The file of the circle to remove
   */
  removeCircle(rank, file) {
    let newarray = this.state.circles.splice(0).filter(raf => {
      return raf.rank !== rank || raf.file !== file;
    });
    this.setState({ circles: newarray });
  }

  /**
   *
   * @param lineWidth the width of lines of future circles
   * @param color the color of future circles
   */
  setCircleParameters(lineWidth, color) {
    this._circle = { lineWidth: lineWidth, color: color };
  }

  _fileSquareClick = () => {
    console.log("fileSquareclick");
  };

  _rankSquareClick = () => {
    console.log("fileSquareclick");
  };

  _pieceSquareMouseDown = raf => {
    this.mousedown = raf;
  };

  _pieceSquareMouseUp = raf => {
    if (raf.rank === this.mousedown.rank && raf.file === this.mousedown.file) {
      const obj = this._circleObject(raf.rank, raf.file);
      if (obj) {
        this.removeCircle(raf.rank, raf.file);
      } else {
        this.addCircle(raf.rank, raf.file);
      }
    } else {
      // The arrows
    }
  };

  _renderFileSquare(file) {
    return (
      <FileSquare
        cssmanager={this.props.cssmanager}
        file={file}
        side={this._square_side}
        key={"filesquare-" + file}
        onClick={this._fileSquareClick}
      />
    );
  }

  _renderFileRow() {
    let filerow = [];

    if (this._rankline === "l") filerow.push(this._renderEmptySquare());

    if (this.props.top === "b") {
      for (let file = 0; file < 8; file++) {
        filerow.push(this._renderFileSquare(file));
      }
    } else {
      for (let file = 7; file >= 0; file--) {
        filerow.push(this._renderFileSquare(file));
      }
    }

    return (
      <div style={{ width: this.props.side, height: this.props.side / 8 }}>
        {filerow}
      </div>
    );
  }

  _renderRankSquare(rank) {
    if (this.props.top !== "W") {
      rank = 7 - rank;
    }

    return (
      <RankSquare
        cssmanager={this.props.cssmanager}
        rank={rank}
        side={this._square_side}
        key={"ranksquare-" + rank}
        onClick={this._rankSquareClick}
      />
    );
  }

  _renderEmptySquare() {
    const style = {
      width: this._square_side,
      height: this._square_side,
      position: "relative",
      float: "left"
    };
    return <div style={style} />;
  }

  _renderSquare(rank, file) {
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

    const circle = this._circleObject(rank, file);

    return (
      <PieceSquare
        cssmanager={this.props.cssmanager}
        rank={rank}
        file={file}
        key={"piece-" + file + rank}
        color={color}
        piece={piece}
        draw_rank_and_file={this._frInSquare}
        onMouseUp={this._pieceSquareMouseUp}
        onMouseDown={this._pieceSquareMouseDown}
        side={this._square_side}
        circle={circle}
      />
    );
  }

  _renderRankRow(rank) {
    let rankrow = [];

    if (this._rankline === "l") rankrow.push(this._renderRankSquare(rank));

    if (this.props.top === "w") {
      for (let file = 7; file >= 0; file--) {
        rankrow.push(this._renderSquare(rank, file));
      }
    } else {
      for (let file = 0; file < 8; file++) {
        rankrow.push(this._renderSquare(rank, file));
      }
    }

    if (this._rankline === "r") rankrow.push(this._renderRankSquare(rank));

    return (
      <div
        style={{ width: this.props.side, height: this._square_side }}
        key={"rank-" + rank}
      >
        {rankrow}
      </div>
    );
  }

  render() {
    this._setup();
    let board = [];

    if (this._fileline === "t")
      board.push(this._renderFileRow(this.props.top === "b"));

    if (this.props.top === "w") {
      for (let rank = 7; rank >= 0; rank--) {
        board.push(this._renderRankRow(rank));
      }
    } else {
      for (let rank = 0; rank < 8; rank++) {
        board.push(this._renderRankRow(rank));
      }
    }

    if (this._fileline === "b")
      board.push(this._renderFileRow(this.props.top === "b"));

    return (
      <div
        style={{
          //position: "relative",
          width: this.props.side,
          height: this.props.side
        }}
      >
        {board}
      </div>
    );
  }
}
