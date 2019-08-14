import React from "react";
import Square from "./Square";
import CssManager from "../../../pages/components/Css/CssManager";

/**
 * @param props React properties
 * @param props.cssmanager The {CssManager} class that keeps the styles
 * @param props.rank The rank of the square being drawn
 * @param props.side The number of pixels on a side
 */
export default class RankSquare extends Square {
  render() {
    return (
      <div
        style={CssManager.externalRankAndFileStyle(this.props.side)}
      >
        {this._raf.charAt(1)}
      </div>
    );
  }
}
