import React from "react";
import "../css/chessbord";

import Square from "./Square.js";

export default class FallenSoldierBlock extends React.Component {
  static renderSquare(square, i) {
    return <Square key={i} piece={square} style={square.style} />;
  }

  render() {
    return (
      <div>
        <div className="board-row dropout">
          {this.props.whiteFallenSoldiers.map((ws, index) =>
            FallenSoldierBlock.renderSquare(ws, index)
          )}
        </div>
        <div className="board-row dropout">
          {this.props.blackFallenSoldiers.map((bs, index) =>
            FallenSoldierBlock.renderSquare(bs, index)
          )}
        </div>
      </div>
    );
  }
}
