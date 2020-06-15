import React, { Component } from "react";
import Chessboard from "chessboardjsx";

export default class OurChessboard extends Component {
  //            boardsize={boardsize}
  //             position={this.state.fen}
  //             onDrop={this.onDrop}
  //             orientation={boardtop}
  //             undo={this.props.undo}
  //             draggable={turn}
  render() {
    return (
      <Chessboard
        id="theBoard"
        darkSquareStyle={{ backgroundColor: "rgb(21, 101, 192)" }}
        lightSquareStyle={{ backgroundColor: "rgb(255, 255, 255)" }}
        calcWidth={({ screenWidth }) => this.props.boardsize}
        position={this.props.fen}
        onDrop={this.props.onDrop}
        orientation={this.props.boardtop}
        undo={this.props.undo}
        boardStyle={{
          borderRadius: "5px",
          boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
        }}
        //    dropOffBoard="trash"
        draggable={this.props.draggable}
        onMouseOutSquare={sq => console.log("onMouseOutSquare(" + sq + ")")}
        onMouseOverSquare={sq => console.log("onMouseOverSquare(" + sq + ")")}
        onSquareClick={sq => console.log("onSquareClick(" + sq + ")")}
        onSquareRightClick={sq => console.log("onSquareRightClick(" + sq + ")")}
        roughSquare={sq => console.log("roughSquare(" + sq + ")")}
      />
    );
  }
}
