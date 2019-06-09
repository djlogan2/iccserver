import React from "react";
import "../css/chessbord";
import newid from "../../../../lib/client/newid";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.board_class classname of the board square css entry, without the light or dark designation
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 * @param props.color The color of the piece or null if no piece
 * @param props.piece The piece on the square, or null if no piece
 * @param props.draw_rank_and_file null won't write the square name, else use 'tl', 'tr', 'bl', or 'br'
 * @param props.onMouseDown The method to call if we push the mouse
 * @param props.onMouseUp The method to call if we release the mouse
 * @param props.side The number of pixels on a side
 */
export default class PieceSquare extends Square {
  constructor(props) {
    super(props);

    this._class = this.props.board_class + "-";
    if (this.props.piece)
      this._class += this.props.color + this.props.piece + "-";
    this._class +=
      (this.props.rank & 1) === (this.props.file & 1) ? "dark" : "light";
    this._class += " square-normal";

    this._canvasid = newid();
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.circle) {
      const c = document.getElementById(this._canvasid);
      const h = c.clientHeight;
      const w = c.clientWidth;
      const r = (h < w ? h : w) / 2 - this.props.circle.lineWidth / 2;
      const ctx = c.getContext("2d");

      ctx.strokeStyle = this.props.circle.color;
      ctx.lineWidth = this.props.circle.lineWidth;

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  renderRankAndFile() {
    if (this.props.draw_rank_and_file) {
      const _text_class =
        "square-text-" +
        this.props.draw_rank_and_file +
        "-" +
        ((this.props.rank & 1) === (this.props.file & 1) ? "dark" : "light");

      return <div className={_text_class}>{this._raf}</div>;
    } else {
      return "";
    }
  }

  render() {
    //
    // TODO: Can we, and should we, disable drawing of text in mobile devices? If so, how?
    //
    return (
      <div
        className={"square-div"}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        style={this._style_obj}
      >
        <div style={this._style_obj} className={this._class} />
        <canvas
          className={"square-canvas"}
          width={this._style_obj.width}
          height={this._style_obj.height}
          id={this._canvasid}
        />
        {this.renderRankAndFile()}
      </div>
    );
  }
}
