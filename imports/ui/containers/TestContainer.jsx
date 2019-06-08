import React, { Component } from "react";
import Square from "../pages/components/Square";
import Board from "../pages/components/Board";
import "../pages/css/developmentboard.css";
import "../pages/css/developmentboard.css";
import Chess from "chess.js";

class TestContainer extends Component {
  render() {
    switch (this.props.match.params.what) {
      case "square":
        return this.renderSquare();
      case "board":
        return this.renderBoard();
      default:
        return TestContainer.renderUnknown(this.props.match.params.what);
    }
  }

  static renderUnknown(what) {
    return <div>{what} is unknown</div>;
  }

  renderBoard() {
    let chess = new Chess.Chess();

    return (
      <Board
        board_class={"developmentboard"}
        board={chess.board()}
        show_rank={false}
        show_file={false}
        side={100}
      />
    );
  }

  renderSquare() {
    return (
      <div>
        <Square
          board_class={"developmentboard"}
          rank={0}
          file={0}
          color={"b"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          circle={{ color: "red", lineWidth: 5 }}
        />
        <Square
          board_class={"developmentboard"}
          rank={0}
          file={1}
          color={"w"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          circle={{ color: "green", lineWidth: 10 }}
        />
        <Square
          board_class={"developmentboard"}
          rank={0}
          file={2}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
        />
        <Square
          board_class={"developmentboard"}
          rank={0}
          file={3}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          circle={{ color: "yellow", lineWidth: 20 }}
        />
      </div>
    );
  }
}

export default TestContainer;
