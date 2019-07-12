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
    if (this.props.circle) {
      const c = document.getElementById(this._canvasid);
      const h = c.clientHeight - 2 * this.props.circle.lineWidth;
      const w = c.clientWidth - 2 * this.props.circle.lineWidth;
      const t = h / 2 + this.props.circle.lineWidth;
      const l = w / 2 + this.props.circle.lineWidth;
      const r = 50 - this.props.circle.lineWidth / 2; //(h < w ? h : w) / 2;
      const ctx = c.getContext("2d");

      ctx.strokeStyle = this.props.circle.color;
      ctx.lineWidth = this.props.circle.lineWidth;

      ctx.beginPath();
      //ctx.rect(5, 5, w - 10, h - 10);
      ctx.arc(l, t, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  renderRankAndFile() {
    const rafStyle = this.props.cssmanager.internalRankAndFileStyle(
      this.props.draw_rank_and_file,
      this._squarecolor,
      this.props.side
    );
    if (this.props.draw_rank_and_file) {
      return <div style={rafStyle}>{this._raf}</div>;
    } else {
      return "";
    }
  }

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
      canvasStyle = this.props.cssmanager.squareCanvasStyle(this.props.side);

    return (
      <div
        style={{
          width: this.props.side,
          height: this.props.side,
          position: "relative",
          float: "left"
        }}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
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
