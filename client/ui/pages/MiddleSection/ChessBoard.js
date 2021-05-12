import React, { PureComponent } from "react";
import _ from "lodash";
import { Modal } from "antd";

import Chess from "../../../../node_modules/chess.js/chess";
//import Chessground from "react-chessground";
import "chessboard/dist/index.css";
import "../../../../imports/css/developmentboard.css";
//import "react-chessground/dist/styles/chessground.css";
import "../../../../imports/css/Theme.css";
import { areArraysOfObectsEqual } from "../../../utils/utils";

export default class ChessBoard extends PureComponent {
  constructor(props) {
    super(props);

    this.chess = new Chess.Chess();

    this.state = {
      shapes: [],
      pendingMove: null,
      selectVisible: false,
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

    if (!areArraysOfObectsEqual(arrows, prevProps.arrows)) {
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

    const moves = this.chess.moves({ verbose: true });

    for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
      if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
        // setPendingMove([from, to])
        // setSelectVisible(true)
        this.setState({ pendingMove: [from, to], selectVisible: true });
        return;
      }
    }

    const move = this.chess.move({
      from,
      to,
      promotion: "x",
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
        enabled: true,
      };
    } else {
      return {
        enabled: false,
      };
    }
  };

  getShapes = () => {
    const { arrows = [], circles = [] } = this.props;

    const arrowList = arrows.map((arrowItem) => {
      return {
        brush: arrowItem.color,
        dest: arrowItem.to,
        mouseSq: arrowItem.to,
        orig: arrowItem.from,
        pos: [],
        snapToValidMove: true,
      };
    });

    const circleList = circles.map((arrowItem) => {
      return {
        brush: arrowItem.color,
        dest: undefined,
        mouseSq: arrowItem.square,
        orig: arrowItem.square,
        pos: [],
        snapToValidMove: true,
      };
    });

    return [...arrowList, ...circleList];
  };

  updateShapes = () => {
    this.setState(
      {
        shapes: this.getShapes(),
      },
      () => {
        this.chessground.cg.setAutoShapes(this.state.shapes);
      }
    );
  };

  handleDrawObject = (list) => {
    const { onDrawObject } = this.props;
    const { shapes } = this.state;

    onDrawObject(list);

    const objItem = list[0];
    let newShapes = shapes.filter((shape) => {
      // cirle
      // if (shape.orig !== objItem.orig) {
      return shape.orig !== objItem.orig || shape.mouseSq !== objItem.mouseSq;
    });

    if (shapes.length === newShapes.length) {
      newShapes = [...newShapes, { ...objItem }];
    }

    this.setState(
      {
        shapes: [...newShapes],
      },
      () => {
        this.chessground.cg.setAutoShapes(shapes);
      }
    );
  };

  calcMovable() {
    const { orientation } = this.props;

    const dests = [];

    this.chess.SQUARES.forEach((s) => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.push([s, ms.map((m) => m.to)]);
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
      dests: new Map(dests),
    };
  }

  getIsPlaying = () => {
    const { gameStatus } = this.props;

    return !!gameStatus && gameStatus === "playing";
  };

  getIsExaminingOrObserving = () => {
    const { gameStatus } = this.props;

    return !!gameStatus && (gameStatus === "observing" || gameStatus === "examining");
  };

  turnColor() {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  promotion = (e) => {
    const { onDrop } = this.props;
    const { pendingMove } = this.state;

    const from = pendingMove[0];
    const to = pendingMove[1];
    const move = this.chess.move({ from, to, promotion: e });

    this.setState({ selectVisible: false });

    if (move) {
      const history = this.chess.history();
      const moves = history[history.length - 1];

      onDrop({ move: moves });
    }
  };

  render() {
    const { fen } = this.props;
    const { selectVisible } = this.state;

    this.chess.load(fen);

    const color = this.chess.turn();

    return (
      <div className="merida">
        {/*<Chessground*/}
        {/*  drawable={drawable}*/}
        {/*  draggable={this.draggable()}*/}
        {/*  selectable={this.draggable()}*/}
        {/*  turnColor={this.turnColor()}*/}
        {/*  width={width}*/}
        {/*  height={height}*/}
        {/*  resizable={true}*/}
        {/*  fen={fen}*/}
        {/*  orientation={orientation}*/}
        {/*  movable={this.calcMovable()}*/}
        {/*  onMove={this.onMove}*/}
        {/*  ref={el => {*/}
        {/*    this.chessground = el;*/}
        {/*  }}*/}
        {/*/>*/}
        <Modal visible={selectVisible} footer={null} closable={false}>
          <div style={{ textAlign: "center", cursor: "pointer" }}>
            <span role="presentation" onClick={() => this.promotion("q")}>
              <img src={`/images/pieces/merida/${color}Q.svg`} alt="queen" style={{ width: 50 }} />
            </span>
            <span role="presentation" onClick={() => this.promotion("r")}>
              <img src={`/images/pieces/merida/${color}R.svg`} alt="rook" style={{ width: 50 }} />
            </span>
            <span role="presentation" onClick={() => this.promotion("b")}>
              <img src={`/images/pieces/merida/${color}B.svg`} alt="bishop" style={{ width: 50 }} />
            </span>
            <span role="presentation" onClick={() => this.promotion("n")}>
              <img src={`/images/pieces/merida/${color}N.svg`} alt="knight" style={{ width: 50 }} />
            </span>
          </div>
        </Modal>
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
  gameStatus: "none",
};
