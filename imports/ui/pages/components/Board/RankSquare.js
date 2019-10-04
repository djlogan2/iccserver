import React from "react";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.this.props.cssmanager The {this.props.cssmanager} class that keeps the styles
 * @param props.rank The rank of the square being drawn
 * @param props.side The number of pixels on a side
 */
export default class RankSquare extends Square {
  render() {
    return (
      <div style={this.props.cssmanager.externalRankStyle(this.props.side)}>
        {this._raf.charAt(1)}
      </div>
    );
  }
}
