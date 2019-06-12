import React, { Component } from "react";
import PieceSquare from "../pages/components/Board/PieceSquare";
import RankSquare from "../pages/components/Board/RankSquare";
import FileSquare from "../pages/components/Board/FileSquare";
import Board from "../pages/components/Board/Board";
import "../pages/css/developmentboard.css";
import Chess from "chess.js";

class TestContainer extends Component {
  constructor() {
    super();
    var canvas = "";
    var context;
    var dragging = false;
    var dragStartLocation;
    var snapshot;
  }

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

  getCanvasCoordinates(event) {
    var x = event.clientX - this.canvas.getBoundingClientRect().left;
    var y = event.clientY - this.canvas.getBoundingClientRect().top;

    return { x: x, y: y };
  }

  takeSnapshot() {
    this.snapshot = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    console.log(this.snapshot);
  }

  restoreSnapshot() {
    this.context.putImageData(this.snapshot, 0, 0);
  }
  drawLine(position) {
    var headlen = 10;
    var angle = Math.atan2(
      position.y - this.dragStartLocation.y,
      position.x - this.dragStartLocation.x
    );

    this.context.beginPath();
    this.context.moveTo(this.dragStartLocation.x, this.dragStartLocation.y);
    this.context.lineTo(position.x, position.y);
    this.context.stroke();
    //starting a new path from the head of the arrow to one of the sides of the point
    this.context.beginPath();
    this.context.lineTo(position.x, position.y);
    this.context.lineTo(
      position.x - headlen * Math.cos(angle - Math.PI / 7),
      position.y - headlen * Math.sin(angle - Math.PI / 7)
    );

    //path from the side point of the arrow, to the other side point
    this.context.lineTo(
      position.x - headlen * Math.cos(angle + Math.PI / 7),
      position.y - headlen * Math.sin(angle + Math.PI / 7)
    );

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    this.context.lineTo(position.x, position.y);
    this.context.lineTo(
      position.x - headlen * Math.cos(angle - Math.PI / 7),
      position.y - headlen * Math.sin(angle - Math.PI / 7)
    );

    this.context.strokeStyle = "#cc0000";
    this.context.lineWidth = 22;
    this.context.stroke();
    this.context.fillStyle = "#cc0000";
    this.context.fill();
  }

  drawCircle(position) {
    //var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
    radius = 25;
    context.beginPath();
    context.arc(
      dragStartLocation.x,
      dragStartLocation.y,
      radius,
      0,
      2 * Math.PI,
      false
    );
    context.lineWidth = 22;
    context.stroke();
  }

  dragStart = event => {
    if (event.shiftKey) {
      this.dragging = true;
      this.dragStartLocation = this.getCanvasCoordinates(event);

      this.takeSnapshot();
    }
  };

  drag = event => {
    var position;
    if (event.shiftKey) {
      if (this.dragging === true) {
        this.restoreSnapshot();
        position = this.getCanvasCoordinates(event);
        //  drawCircle(position);

        this.drawLine(position);
      }
    }
  };

  dragStop = event => {
    if (event.shiftKey) {
      this.dragging = false;
      this.restoreSnapshot();
      var position = this.getCanvasCoordinates(event);
      //   drawCircle(position);
      this.drawLine(position);
    }
  };

  init() {
    this.canvas = document.getElementById("demoCanvas");
    if (this.canvas != null) {
      this.context = this.canvas.getContext("2d");
      this.canvas.addEventListener("mousedown", this.dragStart, false);
      this.canvas.addEventListener("mousemove", this.drag, false);
      this.canvas.addEventListener("mouseup", this.dragStop, false);
    }
  }

  componentDidMount() {
    this.init();
    //  this.drawCircleOnSquare();
  }
  static renderBoard() {
    let chess = new Chess.Chess();

    return (
      <div>
        <Board
          board_class={"developmentboard"}
          board={chess.board()}
          show_rank={true}
          show_file={true}
          side={800}
          top={"w"}
        />
        <canvas id="demoCanvas" height="500" width="500" />
      </div>
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
