import React from "react";
import "../css/chessbord";
import newid from "../../../../lib/client/newid";

/**
 * @param props React properties
 * @param props.board_class classname of the board square css entry, without the light or dark designation
 * @param props.rank The rank of the square being drawn
 * @param props.file The file of the square being drawn
 * @param props.color The color of the piece or null if no piece
 * @param props.piece The piece on the square, or null if no piece
 * @param props.draw_rank_and_file 'true' if we want to label the square (i.e. 'a4'.) null or any non-true otherwise
 * @param props.onMouseDown The method to call if we push the mouse
 * @param props.onMouseUp The method to call if we release the mouse
 * @param props.side The number of pixels on a side
 * @param props.circle null, or an object: {color: "#112233", lineWidth: 99}
 */
export default class Square extends React.Component {
  constructor(props) {
    super(props);

    this._class = this.props.board_class + "-";
    if (this.props.piece)
      this._class += this.props.color + this.props.piece + "-";
    this._class +=
      (this.props.rank & 1) === (this.props.file & 1) ? "dark" : "light";
    this._class += " square-normal";

    this._text = this.props.board_class + "-squaretext";
    this._canvasid = newid();

    this._style_obj = {
      width: this.props.side + "px",
      height: this.props.side + "px"
    };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.circle) {
      const c = document.getElementById(this._canvasid);
      const h = c.clientHeight;
      const w = c.clientWidth;
      const r = ((h < w ? h : w) / 2) - (this.props.circle.lineWidth / 2);
      const ctx = c.getContext("2d");

      ctx.strokeStyle = this.props.circle.color;
      ctx.lineWidth = this.props.circle.lineWidth;

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  render() {
    //
    // TODO: Figure out how to get the square text (i.e. 'a4') in one of the corners with a good fond and color. This is controlled by the "draw_rank_and_file" boolean
    // TODO: Can we, and should we, disable drawing of text in mobile devices? If so, how?
    //
    return (
      <div
        className={"square-div"}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
      >
        <div style={this._style_obj} className={this._class} />
        <canvas
          className={"square-canvas"}
          width={this._style_obj.width}
          height={this._style_obj.height}
          id={this._canvasid}
        />
      </div>
    );
  }
}
