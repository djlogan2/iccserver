import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../../lib/client/Logger";
const log = new Logger("Css/CssManager_js");
/**
 * CssManager
 */
export default class CssManager {
  constructor(css) {
    const us = this;
    this._styleObject = developmentcss; // Default when nothing is loaded
    Meteor.call("getcss", css, function(error, result) {
      if (error) log.error(error);
      us._styleObject = result;
    });
  }

  /**
   *
   * @param squareColor 'b' or 'w' for the color of the square
   * @param piece null, or the piece that's on the square
   * @param color null, or the color of the piece that's on the square
   */
  squareStyle(squareColor, piece, color, side) {
    var style = { width: side, height: side };
    if (this._styleObject.square.all)
      Object.assign(style, this._styleObject.square.all);
    Object.assign(style, this._styleObject.square[squareColor]);

    if (!!piece && !!color) {
      if (this._styleObject.pieces.all)
        Object.assign(style, this._styleObject.pieces.all);
      Object.assign(style, this._styleObject.pieces[color][piece]);
    }

    return style;
  }

  squareCanvasStyle(side) {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2
    };
  }
  /**
   *
   * @param which Position of the text
   * @param color Color of the square
   */
  internalRankAndFileStyle(which, color, side) {
    const style = {}; // width: side, height: side };

    if (this._styleObject.internal_rank_and_file.all)
      Object.assign(style, this._styleObject.internal_rank_and_file.all);

    Object.assign(style, this._styleObject.internal_rank_and_file.color[color]);
    Object.assign(
      style,
      this._styleObject.internal_rank_and_file.position[which]
    );

    return style;
  }

  /**
   *
   * @param which Position of the text
   * @param color Color of the square
   */
  externalRankAndFileStyle(side) {
    const style = { width: side, height: side };

    if (this._styleObject.external_rank_and_file.all)
      Object.assign(style, this._styleObject.external_rank_and_file.all);

    return style;
  }
}

const developmentcss = {
  name: "developmentcss",
  type: "board",
  square: {
    all: {},
    w: {
      backgroundColor: "#fff"
    },
    b: {
      backgroundColor: "#1565c0"
    }
  },
  external_rank_and_file: {
    all: {
      float: "left",
      position: "relative",
      color: "black"
    }
  },
  internal_rank_and_file: {
    all: {
      position: "absolute",
      zIndex: 3
    },
    color: {
      w: {
        color: "red"
      },
      b: {
        color: "white"
      }
    },
    position: {
      tl: {
        top: 0,
        left: 0
      },
      tr: {
        top: 0,
        right: 0,
        textAlign: "right"
      },
      bl: {
        bottom: 0,
        left: 0
      },
      br: {
        bottom: 0,
        right: 0,
        textAlign: "right"
      }
    }
  },
  pieces: {
    all: {
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      backgroundPosition: "center"
    },
    w: {
      r: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg)`
      },
      b: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg)`
      },
      n: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg)`
      },
      q: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg)`
      },
      k: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg)`
      },
      p: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg)`
      }
    },
    b: {
      r: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg)`
      },
      b: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg)`
      },
      n: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg)`
      },
      q: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg)`
      },
      k: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg)`
      },
      p: {
        backgroundImage: `url(https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg)`
      }
    }
  }
};
