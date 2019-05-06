import React from 'react';
import '../css/chessbord';
import decode from './decode';
import Square from './square.js';

export default class Board extends React.Component {

  renderLabelText(x, y) {
    const isLeftColumn = x === 0
    const isBottomRow = y === 7

    if ((!isLeftColumn && !isBottomRow)) {
      return null
    }

    if (isLeftColumn && isBottomRow) {
      return [
        <span key="blx" className="notation-322f9 alpha-d2270">
          a
        </span>,
        <span key="bly" className="notation-322f9 numeric-fc462">
          1
        </span>
      ]
    }

    const label = isLeftColumn ? 8 - y : String.fromCharCode(decode.charCodeOffset + x)
    return <span className={isLeftColumn ? "notation-322f9 numeric-fc462" : "notation-322f9 alpha-d2270" }>{label}</span>
  }
  
  renderSquare(i, squareShade,x,y) {
    return <Square 
    style = {this.props.squares[i]? this.props.squares[i].style : null}
    shade = {squareShade}
    onClick={() => this.props.onClick(i)}>
       {this.renderLabelText(x, y)}
    
    </Square>
  
  }

  render() {
    const board = [];
    for(let i = 0; i < 8; i++){
      const squareRows = [];
      for(let j = 0; j < 8; j++){
        const squareShade = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j))? "blue" : "white";
        squareRows.push(this.renderSquare((i*8) + j, squareShade,j,i));
     
      }
      board.push(squareRows)
    }

    return (
      <div className="main-square">
        {board}
      </div>
    );
  }
}


function isEven(num){
  return num % 2 === 0
}