import React, { Component } from "react";
import PieceSquare from "../pages/components/Board/PieceSquare";
import RankSquare from "../pages/components/Board/RankSquare";
import FileSquare from "../pages/components/Board/FileSquare";
import Board from "../pages/components/Board/Board";
import "../pages/css/developmentboard.css";
import Chess from "chess.js";

class TestContainer extends Component {
  render() {
    switch (this.props.match.params.what) {
      case "square":
        return this.renderSquare();
      case "board":
        return TestContainer.renderBoard();
      default:
        return TestContainer.renderUnknown(this.props.match.params.what);
    }
  }

  static renderUnknown(what) {
    return <div>{what} is unknown</div>;
  }

  static renderBoard() {
    let chess = new Chess.Chess();

    return (
      <Board
        board_class={"developmentboard"}
        board={chess.board()}
        show_rank={true}
        show_file={true}
        draw_rank_and_file={"br"}
        side={800}
        top={"w"}
      />
    );
  }

  renderSquare() {
    return (
      <div>
        <PieceSquare
          board_class={"developmentboard"}
          rank={0}
          file={0}
          color={"b"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"tl"}
          circle={{ color: "red", lineWidth: 5 }}
        />
        <PieceSquare
          board_class={"developmentboard"}
          rank={0}
          file={1}
          color={"w"}
          piece={"q"}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"bl"}
          circle={{ color: "green", lineWidth: 10 }}
        />
        <PieceSquare
          board_class={"developmentboard"}
          rank={0}
          file={2}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          draw_rank_and_file={"tr"}
          side={100}
        />
        <PieceSquare
          board_class={"developmentboard"}
          rank={0}
          file={3}
          onMouseDown={() => console.log("here")}
          onMouseUp={() => console.log("here")}
          side={100}
          draw_rank_and_file={"br"}
          circle={{ color: "yellow", lineWidth: 20 }}
        />
        <RankSquare
          board_class={"developmentboard"}
          rank={0}
          file={3}
          side={100}
        />
        <FileSquare
          board_class={"developmentboard"}
          rank={0}
          file={3}
          side={100}
        />
      </div>
    );
  }
}

export default TestContainer;
