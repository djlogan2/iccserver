import React from "react";
import "../css/ChessBoard";

import Square from "../components/Board/Square.js";

export default class FallenSoldier extends React.Component {
  static renderSquare(square, i) {
    return <Square key={i} piece={square} style={square.style} />;
  }

  render() {
    return (
      <div>
        <div className="board-row dropout">
          {this.props.whiteFallenSoldiers.map((ws, index) =>
            FallenSoldier.renderSquare(ws, index)
          )}
        </div>
        <div className="board-row dropout">
          {this.props.blackFallenSoldiers.map((bs, index) =>
            FallenSoldier.renderSquare(bs, index)
          )}
        </div>
      </div>
    );
  }
}
