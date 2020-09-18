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
      boardTop: "black",
      shapes: []
    };
    this.deleyedHandleResize = _.debounce(this.handleResize, 300);
  }

  componentDidMount() {
    window.addEventListener("resize", this.deleyedHandleResize);
    if (this.getIsExaminingOrObserving()) {
      this.updateShapes();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.deleyedHandleResize);
  }

  componentDidUpdate(prevProps, prevState) {
    let { arrows, circles } = this.props;
    if (arrows.length !== prevProps.arrows.length) {
      this.updateShapes();
    } else if (circles.length !== prevProps.circles.length) {
      this.updateShapes();
    }
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

  getShapes = () => {
    let { arrows, circles } = this.props;
    if (!arrows) {
      arrows = [];
    }
    if (!circles) {
      circles = [];
    }
    let arrowList = arrows.map(arrowItem => {
      return {
        brush: arrowItem.color,
        dest: arrowItem.to,
        mouseSq: arrowItem.to,
        orig: arrowItem.from,
        pos: [],
        snapToValidMove: true
      };
    });
    let circleList = circles.map(arrowItem => {
      return {
        brush: arrowItem.color,
        dest: undefined,
        mouseSq: arrowItem.square,
        orig: arrowItem.square,
        pos: [],
        snapToValidMove: true
      };
    });

    return [...arrowList, ...circleList];
  };

  updateShapes = () => {
    this.setState(
      {
        shapes: this.getShapes()
      },
      () => {
        this.chessground.cg.setAutoShapes(this.state.shapes);
      }
    );
  };

  handleDrawObject = list => {
    this.props.onDrawObject(list);
    let objItem = list[0];
    let shapes = [...this.state.shapes];
    let newShapes = shapes.filter(shape => {
      // cirle
      // if (shape.orig !== objItem.orig) {
      if (shape.orig !== objItem.orig || shape.mouseSq !== objItem.mouseSq) {
        return true;
      }
      return false;
    });
    if (shapes.length === newShapes.length) {
      newShapes = [...newShapes, { ...objItem }];
    }
    this.setState(
      {
        shapes: [...newShapes]
      },
      () => {
        this.chessground.cg.setAutoShapes(this.state.shapes);
      }
    );
  };

  calcMovable() {
    const dests = [];
    this.chess.SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.push([s, ms.map(m => m.to)]);
      }
    });
    let color = "both";
    if (this.getIsPlaying()) {
      color = this.props.orientation;
    }

    return {
      free: false,
      dests: new Map(dests),
      showDests: true,
      color: color
    };
  }

  getIsPlaying = () => {
    return !!this.props.gameStatus && this.props.gameStatus === "playing";
  };

  getIsExaminingOrObserving = () => {
    return !!this.props.gameStatus && (this.props.gameStatus === "examining"|| this.props.gameStatus === "observing");
  };

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  render() {
    this.chess.load(this.props.fen);

    const drawable = {
      enabled: true,
      // autoShapes: [],
      shapes: this.state.shapes,
      onChange: this.handleDrawObject
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
          movable={this.calcMovable()}
          onMove={this.onMove}
          ref={el => {
            this.chessground = el;
          }}
        />
      </div>
    );
  }
}
