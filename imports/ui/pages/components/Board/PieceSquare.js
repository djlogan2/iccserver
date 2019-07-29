import React from "react";
import newid from "../../../../../lib/client/newid";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.cssmanager {CssManager} The CssManager
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 * @param props.color The color of the piece or null if no piece
 * @param props.piece The piece on the square, or null if no piece
 * @param props.draw_rank_and_file null won't write the square name, else use 'tl', 'tr', 'bl', or 'br'
 * @param props.onMouseDown The method to call if we push the mouse
 * @param props.onMouseUp The method to call if we release the mouse
 * @param props.onSquareIn The method to call when our mouse enters a square
 * @param props.side The number of pixels on a side
 * @param props.circle styling of the circle if one is being drawn
 * @param props.circle.color the color of the circle
 * @param props.circle.lineWidth the line with of the circle
 */

export default class PieceSquare extends Square {
  constructor(props) {
    super(props);
    this._canvasid = newid();
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const c = document.getElementById(this._canvasid);
    const ctx = c.getContext("2d");
    const h = c.clientHeight;
    const w = c.clientWidth;
    ctx.clearRect(0, 0, w, h);

    if (this.props.circle) {
      const t = h / 2 + this.props.circle.lineWidth;
      const l = w / 2 + this.props.circle.lineWidth;
      const r = Math.min(h, w) / 2 - this.props.circle.lineWidth / 2;

      ctx.strokeStyle = this.props.circle.color;
      ctx.lineWidth = this.props.circle.lineWidth;

      ctx.beginPath();
      //ctx.rect(5, 5, w - 10, h - 10);
      ctx.arc(l, t, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  renderRankAndFile() {
    if (this.props.draw_rank_and_file) {
      const rafStyle = this.props.cssmanager.internalRankAndFileStyle(
        this.props.draw_rank_and_file,
        this._squarecolor,
        this.props.side
      );
      return <div style={rafStyle}>{this._raf}</div>;
    } else {
      return "";
    }
  }

  mouseDown = () => {
    this.props.onMouseDown({ rank: this.props.rank, file: this.props.file });
  };

  mouseUp = () => {
    this.props.onMouseUp({ rank: this.props.rank, file: this.props.file });
  };

  render() {
    //
    // TODO: Can we, and should we, disable drawing of text in mobile devices? If so, how?
    //

    const squareStyle = this.props.cssmanager.squareStyle(
      this._squarecolor,
      this.props.piece,
      this.props.color,
      this.props.side
    );

    let canvasStyle;
    if (this.props.circle)
      canvasStyle = CssManager.squareCanvasStyle(this.props.side);

    return (
      <div
        style={{
          width: this.props.side,
          height: this.props.side,
          position: "relative",
          float: "left"
        }}
        onMouseDown={this.mouseDown}
        onMouseUp={this.mouseUp}
      >
        <div style={squareStyle} />
        <canvas
          style={canvasStyle}
          id={this._canvasid}
          width={this.props.side}
          height={this.props.side}
        />
        {this.renderRankAndFile()}
      </div>
    );
  }
}
