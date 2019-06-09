import React from "react";
import "../css/chessbord";

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
export default class Square extends React.Component {
  constructor(props) {
    super(props);

    this._style_obj = {
      width: this.props.side + "px",
      height: this.props.side + "px",
      float: "right"
    };

    this._raf =
      String.fromCharCode("a".charCodeAt(0) + this.props.file) +
      (this.props.rank + 1);
  }
}
