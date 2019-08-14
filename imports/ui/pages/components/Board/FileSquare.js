import React from "react";
import Square from "./Square";
import CssManager from "../../../pages/components/Css/CssManager";

/**
 * @param props React properties
 * @param props.cssmanager The {CssManager} class that keeps the styles
 * @param props.file The file of the square being drawn
 */
export default class FileSquare extends Square {
  render() {
    return (
      <div style={CssManager.externalRankAndFileStyle(this.props.side)}>
        {this._raf.charAt(0)}
      </div>
    );
  }
}
