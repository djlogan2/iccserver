import React from "react";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.board_class classname of the board square css entry, without the light or dark designation
 * @param props.file The file of the square being drawn
 */
export default class FileSquare extends Square {
  render() {
    return <div style={this.props.cssmanager.externalRankAndFileStyle(this.props.side)}>{this._raf.charAt(0)}</div>;
  }
}
