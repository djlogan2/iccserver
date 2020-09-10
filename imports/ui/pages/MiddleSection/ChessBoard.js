import React, { PureComponent } from "react";
import _ from "lodash";

import Chess from "chess.js";
import Chessground from "react-chessground";
import "./../css/developmentboard.css";
import "react-chessground/dist/styles/chessground.css";
import "./../css/Theme.css";
import Meta from "antd/lib/card/Meta";
export default class ChessBoard extends PureComponent {
  constructor(props) {
    super(props);
    this.chess = new Chess.Chess();
    this.state = {
      fen: this.chess.fen(),
      boardTop: "black"
    };
    this.deleyedHandleResize = _.debounce(this.handleResize, 300);
  }

  componentDidMount() {
    window.addEventListener("resize", this.deleyedHandleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.deleyedHandleResize);
  }

  handleResize = () => {
    this.chessground.cg.redrawAll();
  };

  onMove = (from, to) => {
    let move = this.chess.move({
      from: from,
      to: to,
      promotion: "q"
    });
    if (move === null) {
      this.setState({ fen: this.chess.fen() });
      return;
    } else {
      let history = this.chess.history();
      let moves = history[history.length - 1];
      this.props.onDrop({
        move: moves
      });

      //  this.setState({ fen: this.chess.fen() });
    }
  };
  draggable() {
    if (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") {
      return {
        enabled: true
      };
    } else {
      return {
        enabled: false
      };
    }
  }

  getObjects = () => {
    let arrowList = this.props.arrows.map((arrowItem) => {
      return {
        "brush": arrowItem.color,
        "dest": arrowItem.to,
        "mouseSq": arrowItem.to,
        "orig": arrowItem.from,
        "pos": [],
        "snapToValidMove": true
      }
    })
    let circleList = this.props.circles.map((arrowItem) => {
      return {
        "brush": arrowItem.color,
        "dest": undefined,
        "mouseSq": arrowItem.square,
        "orig": arrowItem.square,
        "pos": [],
        "snapToValidMove": true
      }
    })

    return [...arrowList, ...circleList]
  }
  

  // drawArrow = (data) => {
  //   debugger;
  //   Meteor.call("drawArrow", "DrawArrow", "gameId", "from", "to", "color", "size", (err) => {
  //     debugger;
  //     if (err) {

  //     }
  //   });

  //   // onDrawObject={this.props.onDrawObject}
  // }

  calcMovable() {
    const dests = {};
    this.chess.SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) dests[s] = ms.map(m => m.to);
    });
    let color = "both";
    if (this.getIsPlaying()) {
      color = this.props.orientation;
    }
    return {
      free: false,
      dests,
      showDests: true,
      color: color
    };
  }

  getIsPlaying = () => {
    return !!this.props.gameStatus && this.props.gameStatus === "playing"
  }

  getIsExamining = () => {
    return !!this.props.gameStatus && this.props.gameStatus === "examining"
  }

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  render() {
    this.chess.load(this.props.fen);

    const drawable = {
      enabled: true,
      autoShapes: this.getObjects(),
      onChange: this.props.onDrawObject
    };

    return (
      <div className="merida">
        <Chessground
          drawable={drawable}
          draggable={this.draggable()}
          selectable={this.draggable()}
          turnColor={this.turnColor()}
          width={this.props.width}
          height={this.props.height}
          resizable={true}
          fen={this.props.fen}
          orientation={this.props.orientation}

          // movable={this.calcMovable()}

          onMove={this.onMove}
          ref={el => {
            this.chessground = el;
          }}
        />
      </div>
    );
  }
}
