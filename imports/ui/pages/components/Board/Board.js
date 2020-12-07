import React from "react";
import BoardArrow from "./BoardArrow.js";
import PieceSquare from "./PieceSquare.js";
import RankSquare from "./RankSquare.js";
import FileSquare from "./FileSquare.js";
import { Logger } from "../../../../../lib/client/Logger";

const log = new Logger("client/Board_js");
/**
 * @param props React properties
 * @param props.circle.lineWidth the line width for the circle
 * @param props.circle.color the line color for the circle
 * @param props.arrow.lineWidth the line width for the arrow
 * @param props.arrow.color the line color for the arrow
 * @param props.board The chessboard in an 8x8 array of objects with {type: 'x', color: 'x'} or null
 * types: rbnqkp, color: bw
 * @param props.draw_rank_and_file null, or 'tl', 'tr', 'bl', 'br', 'stl', 'str', 'sbl', 'sbr'
 * s = "in square". Without s means to the left, top, right, or bottom of the board itself.
 * @param props.side = Size of side of board in pixels
 * @param props.top = The color at the 'top' of the chessboard
 */
export default class Board extends React.Component {
  /****************************************************************************
   * Public methods                                                           *
   ****************************************************************************/
  /**
   *
   * @param rank The rank for where to add a circle
   * @param file The file for where to add a circle
   */
  addCircle(rank, file) {
    const have = this._circleObject(rank, file);
    if (have) {
      if (have.lineWidth === this._circle.lineWidth && have.color === this._circle.color) return;
      this.removeCircle(rank, file);
    }
    //TODO :This code comment becouse each time state update from incomming props so not longer nessary when game examin mode.
    //If check circle in local then remove comment

    /* const c = { rank: rank, file: file };
    Object.assign(c, this._circle);
    let newarray = this.state.circles.splice(0);
    newarray.push(c);
    this.setState({ circles: newarray }); */
  }

  /**
   *
   * @param rank The rank of the circle to remove
   * @param file The file of the circle to remove
   */
  removeCircle(rank, file) {
    // let newarray = this.state.circles.splice(0).filter(raf => {
    //   return raf.rank !== rank || raf.file !== file;
    // });
    //TODO :This code comment becouse each time state update from incomming props so not longer nessary when game examin mode.
    //If check circle in local then remove comment
    /*   this.setState({ circles: newarray }); */
  }

  /**
   *
   * @param lineWidth the width of lines of future circles
   * @param color the color of future circles
   */
  setCircleParameters(lineWidth, color) {
    this._circle = { lineWidth: lineWidth, color: color };
  }
  /****************************************************************************
   * React overridden methods                                                 *
   ****************************************************************************/
  render() {
    this._setup();
    let board = [];

    if (this._fileline === "t") board.push(this._renderFileRow(this.props.top === "b"));

    if (this.props.top === "w") {
      for (let rank = 7; rank >= 0; rank--) {
        board.push(this._renderRankRow(rank));
      }
    } else {
      for (let rank = 0; rank < 8; rank++) {
        board.push(this._renderRankRow(rank));
      }
    }
    if (this._fileline === "b") board.push(this._renderFileRow(this.props.top === "b"));
    const arrows = this.state.arrows.map(arrow => this._renderArrow(arrow)) || "";
    if (this.state.currentarrow) arrows.push(this._renderArrow(this.state.currentarrow));

    return (
      <div>
        <div
          style={{
            width: this.props.side,
            height: this.props.side
          }}
        >
          {board}
        </div>
        {arrows}
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      circles: this.props.circles,
      arrows: [],
      currentarrow: null
    };
    this._circle = this.props.circle;
    this._setup();
    this.rankFrom = "";
    this.rankTo = "";
    this.piece = "";
    this.fileFrom = "";
    this.fileTo = "";
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.circles !== prevState.circles) {
      return { circles: nextProps.circles };
    } else return null;
  }

  /****************************************************************************
   * private methods                                                          *
   ****************************************************************************/
  _setup() {
    if (this.props.draw_rank_and_file) {
      if (this.props.draw_rank_and_file.charAt(0) === "s") {
        this._frInSquare = this.props.draw_rank_and_file.substr(1);
        this._rankline = "";
        this._fileline = "";
      } else {
        this._frInSquare = "";
        if (this.props.draw_rank_and_file.charAt(0) === "t") this._fileline = "t";
        else if (this.props.draw_rank_and_file.charAt(0) === "b") this._fileline = "b";
        else this._fileline = "";

        if (this.props.draw_rank_and_file.charAt(1) === "l") this._rankline = "l";
        else if (this.props.draw_rank_and_file.charAt(1) === "r") this._rankline = "r";
        else this._rankline = "";
      }
    } else {
      this._rankline = "";
      this._fileline = "";
      this._frInSquare = "";
    }

    this._rank_squares = this._fileline === "t" || this._fileline === "b" ? 9 : 8;
    this._file_squares = this._rankline === "l" || this._rankline === "r" ? 9 : 8;
    const h = this.props.side / this._file_squares;
    const w = this.props.side / this._rank_squares;
    this._square_side = Math.min(h, w);
  }

  _circleObject(rank, file) {
    /*
    const circleobj = this.state.circles.filter(obj => {
      return obj.rank === rank && obj.file === file;
    });
    if (circleobj && circleobj.length !== 0)
      return {
        lineWidth: circleobj[0].lineWidth,
        color: circleobj[0].color
      };
     */
  }
  _fileSquareClick = () => {
    log.error("fileSquareclick");
  };

  _rankSquareClick = () => {
    log.error("rankSquareclick");
  };

  _pieceSquareMouseDown = raf => {
    this.mousedown = raf;
    this.mousein = raf;
  };

  _pieceSquareIn = raf => {
    if (!this.mousedown) return;
    if (this.mousein.rank === raf.rank && this.mousein.file === raf.file) return;
    this.mousein = raf;

    const currentarrow = {
      from: this.mousedown,
      to: raf,
      lineWidth: this.props.arrow.lineWidth,
      color: this.props.arrow.color
    };

    this.setState({ currentarrow: currentarrow });
  };

  _squareToCoordinate(rank, file) {
    const side = this._square_side * 8;

    let x = file * this._square_side + this._square_side / 2;
    let y = rank * this._square_side + this._square_side / 2;

    if (this.props.top === "b") {
      y = side - y;
    } else {
      x = side - x;
    }

    if (this._fileline === "t") y += this._square_side;
    if (this._rankline === "l") x += this._square_side;

    return { x: x, y: y };
  }

  _pieceSquareDragStart = raf => {
    this.fileFrom = raf.file;
    this.rankFrom = raf.rank + 1;
    this.piece = raf.piece;
  };
  _pieceSquareDragStop = raf => {
    this.rankTo = raf.rank + 1;
    this.fileTo = raf.file;

    const filefromList = ["a", "b", "c", "d", "e", "f", "g", "h"];
    this.fileFrom = filefromList[this.fileFrom];
    this.fileTo = filefromList[this.fileTo];

    let moveFrom = this.fileFrom + this.rankFrom;
    let moveTo = this.fileTo + this.rankTo;
    let isMove = this.props.onDrop({
      from: moveFrom,
      to: moveTo,
      p: this.piece
    });
    return isMove;
  };
  getCoordinates(rank, file) {
    this.rankTo = rank + 1;
    const filefromList = ["a", "b", "c", "d", "e", "f", "g", "h"];
    this.fileTo = filefromList[file];
    return this.fileTo + this.rankTo;
  }
  _pieceSquareMouseUp = raf => {
    /*   if (raf.rank === this.mousedown.rank && raf.file === this.mousedown.file) {
      const obj = this._circleObject(raf.rank, raf.file);
      if (obj) {
        this.removeCircle(raf.rank, raf.file);
        let circle = this.getCoordinates(raf.rank, raf.file);
        //  this.props.onRemoveCircle(circle);
      } else {
        this.addCircle(raf.rank, raf.file);
        let circle = this.getCoordinates(raf.rank, raf.file);
        //    this.props.onDrawCircle(circle, this._circle.color, this._circle.lineWidth);
      }
    } else {
      // The arrows
      const newarrows = this.state.arrows.splice(0);
      newarrows.push({
        from: this.mousedown,
        to: raf,
        lineWidth: this.props.arrow.lineWidth,
        color: this.props.arrow.color
      });
      this.mousedown = null;
      this.mousein = null;
      this.setState({ arrows: newarrows, currentarrow: null });
    } */
  };

  _pieceDrawCicle = (event, raf) => {
    event.preventDefault();
    let color;
    if (event.type === "click") {
      if (event.ctrlKey && event.altKey) {
        color = "yellow";
      } else if (event.shiftKey) {
        color = "green";
      } else if (event.ctrlKey) {
        color = "red";
      } else if (event.altKey) {
        color = "blue";
      }
    }
    if (raf.rank === this.mousedown.rank && raf.file === this.mousedown.file) {
      const obj = this._circleObject(raf.rank, raf.file);
      if (obj) {
        this.removeCircle(raf.rank, raf.file);
        let circle = this.getCoordinates(raf.rank, raf.file);
        this.props.onRemoveCircle(circle);
      } else {
        if (!!color) {
          this.addCircle(raf.rank, raf.file);
          let circle = this.getCoordinates(raf.rank, raf.file);
          this.props.onDrawCircle(circle, color, this._circle.lineWidth);
        }
      }
    }
  };

  _renderFileSquare(file) {
    return (
      <FileSquare
        cssManager={this.props.cssManager}
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
      <div
        style={{
          width: this.props.side,
          height: this.props.side / this._rank_squares
        }}
      >
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
        cssManager={this.props.cssManager}
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
      height: this._square_side / 5,
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
        cssManager={this.props.cssManager}
        rank={rank}
        file={file}
        key={"piece-" + file + rank}
        color={color}
        piece={piece}
        draw_rank_and_file={this._frInSquare}
        onMouseUp={this._pieceSquareMouseUp}
        onMouseDown={this._pieceSquareMouseDown}
        onSquareIn={this._pieceSquareIn}
        side={this._square_side}
        circle={circle}
        onDragStart={this._pieceSquareDragStart}
        onDrop={this._pieceSquareDragStop}
        onDrawCircle={this.drawCircle}
        pieceDrawCicle={this._pieceDrawCicle}
      />
    );
  }

  _renderArrow(arrow) {
    const from = this._squareToCoordinate(arrow.from.rank, arrow.from.file);

    const to = this._squareToCoordinate(arrow.to.rank, arrow.to.file);

    return (
      <BoardArrow
        cssManager={this.props.cssManager}
        size={this.props.side}
        from={{ x: from.x, y: from.y }}
        to={{ x: to.x, y: to.y }}
        arrow={{
          lineWidth: arrow.lineWidth,
          color: arrow.color
        }}
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
        style={{
          width: this.props.side,
          height: this._square_side
        }}
        key={"rank-" + rank}
      >
        {rankrow}
      </div>
    );
  }
}
