import React from "react";
import Square from "./Square";

/**
 * @param props React properties
 * @param props.this.props. cssManager The {this.props. cssManager} class that keeps the styles
 * @param props.file The file of the square being drawn
 */
export default class FileSquare extends Square {
  render() {
    return (
      <div style={this.props. cssManager.externalFileStyle(this.props.side)}>
        {this._raf.charAt(0)}
      </div>
    );
  }
}
