import React from "react";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.board_class classname of the board square css entry, without the light or dark designation
 * @param props.rank The rank of the square being drawn
 * @param props.side The number of pixels on a side
 */
export default class RankSquare extends Square {
  render() {
    return (
      <div style={this.props.cssmanager.externalRankAndFileStyle(this.props.side)}>
        {this._raf.charAt(1)}
      </div>
    );
  }
}
