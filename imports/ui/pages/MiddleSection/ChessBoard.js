import React, { PureComponent } from "react";
import _ from "lodash";

import Chess from "chess.js";
import Chessground from "react-chessground";
import "./../css/developmentboard.css";
import "react-chessground/dist/styles/chessground.css";
import "./../css/Theme.css";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/ChessBoard_js");

export default class ChessBoard extends PureComponent {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
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
    const { arrows, circles } = this.props;

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
    const { onDrop } = this.props;
    log.debug("onMove from=" + from + ", to=" + to);

    const move = this.chess.move({
      from: from,
      to: to,
      promotion: "q"
    });

    if (move) {
      const history = this.chess.history();
      const moves = history[history.length - 1];

      onDrop({ move: moves });
    }
  };

  draggable = () => {
    if (this.props.gameStatus === "playing" || this.props.gameStatus === "examining") {
      return {
        enabled: true
      };
    } else {
      return {
        enabled: false
      };
    }
  };

  getShapes = () => {
    const { arrows = [], circles = [] } = this.props;

    const arrowList = arrows.map(arrowItem => {
      return {
        brush: arrowItem.color,
        dest: arrowItem.to,
        mouseSq: arrowItem.to,
        orig: arrowItem.from,
        pos: [],
        snapToValidMove: true
      };
    });

    const circleList = circles.map(arrowItem => {
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
    const { onDrawObject } = this.props;
    const { shapes } = this.state;

    onDrawObject(list);

    const objItem = list[0];
    let newShapes = shapes.filter(shape => {
      // cirle
      // if (shape.orig !== objItem.orig) {
      return shape.orig !== objItem.orig || shape.mouseSq !== objItem.mouseSq;
    });

    if (shapes.length === newShapes.length) {
      newShapes = [...newShapes, { ...objItem }];
    }

    this.setState(
      {
        shapes: [...newShapes]
      },
      () => {
        this.chessground.cg.setAutoShapes(shapes);
      }
    );
  };

  calcMovable() {
    const { orientation } = this.props;

    const dests = [];

    this.chess.SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.push([s, ms.map(m => m.to)]);
      }
    });

    let color = "both";
    if (this.getIsPlaying()) {
      color = orientation;
    }

    return {
      color,
      free: false,
      showDests: true,
      dests: new Map(dests)
    };
  }

  getIsPlaying = () => {
    const { gameStatus } = this.props;

    return !!gameStatus && gameStatus === "playing";
  };

  getIsExaminingOrObserving = () => {
    const { gameStatus } = this.props;

    return !!gameStatus && gameStatus === "observing";
  };

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  render() {
    const { fen, onDrawObject, width, height, orientation } = this.props;
    const { shapes } = this.state;

    this.chess.load(fen);

    const drawable = {
      shapes,
      enabled: !!onDrawObject,
      onChange: this.handleDrawObject
    };

    return (
      <div className="merida">
        <Chessground
          drawable={drawable}
          draggable={this.draggable()}
          selectable={this.draggable()}
          turnColor={this.turnColor()}
          width={width}
          height={height}
          resizable={true}
          fen={fen}
          orientation={orientation}
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

ChessBoard.defaultProps = {
  arrows: [],
  circles: [],
  width: 100,
  height: 100,
  fen: "",
  orientation: "w",
  gameStatus: "none"
};
