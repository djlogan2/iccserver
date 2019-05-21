import React from 'react';
import '../css/chessbord';

import Square from './square.js';

export default class FallenSoldierBlock extends React.Component {

  renderSquare(square, i, squareShade) {
    return <Square 
    key= {i}
    piece = {square} 
    style = {square.style}
    />
  }

  render() {
    return (
      <div>
      <div className="board-row dropout">{this.props.whiteFallenSoldiers.map((ws, index) =>
        this.renderSquare(ws, index)
        )}</div>
      <div className="board-row dropout">{this.props.blackFallenSoldiers.map((bs, index) =>
        this.renderSquare(bs, index)
        )}</div>
      </div>
      );
  }
}

