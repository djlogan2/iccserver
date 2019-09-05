import { Logger } from "../../../../../lib/client/Logger";
const log = new Logger("Css/CssManager_js");
/**
 * CssManager
 */
export default class CssManager {
  constructor(css) {
    const us = this;
    //this._styleObject = developmentcss; // Default when nothing is loaded
    this._boardStyle = this.search("board", developmentcss);
    this._systemStyle = this.search("system", developmentcss);
  }
  search(typeKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].type === typeKey) {
        return myArray[i];
      }
    }
  }
  /**
   *
   * @param squareColor 'b' or 'w' for the color of the square
   * @param piece null, or the piece that's on the square
   * @param color null, or the color of the piece that's on the square
   */
  squareStyle(squareColor, piece, color, side) {
    var style = { width: side, height: side };
    if (this._boardStyle.square.all)
      Object.assign(style, this._boardStyle.square.all);
    Object.assign(style, this._boardStyle.square[squareColor]);

    if (!!piece && !!color) {
      if (this._boardStyle.pieces.all)
        Object.assign(style, this._boardStyle.pieces.all);
      Object.assign(style, this._boardStyle.pieces[color][piece]);
    }

    return style;
  }
  fSquareStyle(squareColor, piece, side) {
    var style = { width: side, height: side };
    if (this._boardStyle.square.all)
      Object.assign(style, this._boardStyle.fsquare.all);
    Object.assign(style, this._boardStyle.fsquare[squareColor]);
    if (!!piece && !!squareColor) {
      if (this._boardStyle.pieces.all)
        Object.assign(style, this._boardStyle.fallendpieces.all);
      Object.assign(style, this._boardStyle.fallendpieces[squareColor][piece]);
    }

    return style;
  }
  flags(country) {
    var style = {};
    if (this._boardStyle.flags.all)
      Object.assign(style, this._boardStyle.flags.all);
    Object.assign(style, this._boardStyle.flags[country]);

    return style;
  }

  tagLine() {
    var style = {};
    Object.assign(style, this._boardStyle.tagLine.all);
    return style;
  }
  userName() {
    var style = {};
    Object.assign(style, this._boardStyle.userName.all);
    return style;
  }

  clock() {
    var style = {};
    Object.assign(style, this._boardStyle.clock.all);
    return style;
  }
  //This css code for Right sidebar
  settingIcon() {
    var style = {};
    Object.assign(style, this._systemStyle.settingIcon.all);
    return style;
  }
  rightTopContent() {
    var style = {};
    Object.assign(style, this._systemStyle.rightTopContent.all);
    return style;
  }
  rightBottomContent() {
    var style = {};
    Object.assign(style, this._systemStyle.rightBottomContent.all);
    return style;
  }
  actionButtonImage(imageName) {
    var style = {};
    /*	if (this._rightBarStyle.actionButtonImage.all)
      Object.assign(style, this._rightBarStyle.actionButtonImage.all);
    */
    Object.assign(style, this._systemStyle.actionButtonImage[imageName]);
    return style;
  }
  gameAnalysisIcon() {
    var style = {};
    Object.assign(style, this._systemStyle.gameAnalysisIcon.all);
    return style;
  }
  gameSheetDownloadIcon() {
    var style = {};
    Object.assign(style, this._systemStyle.gameSheetDownloadIcon.all);
    return style;
  }
  gameShareIcon() {
    var style = {};
    Object.assign(style, this._systemStyle.gameShareIcon.all);
    return style;
  }
  chatContent() {
    var style = {};
    Object.assign(style, this._systemStyle.chatContent.all);
    return style;
  }
  chatInputBox() {
    var style = {};
    Object.assign(style, this._systemStyle.chatInputBox.all);
    return style;
  }
  chatSendButton() {
    var style = {};
    Object.assign(style, this._systemStyle.chatSendButton.all);
    return style;
  }
  gameMoveList() {
    var style = {};
    Object.assign(style, this._systemStyle.gameMoveList.all);
    return style;
  }
  gameButtonMove() {
    var style = {};
    Object.assign(style, this._systemStyle.gameButtonMove.all);
    return style;
  }
  gameTopHeader() {
    var style = {};
    Object.assign(style, this._systemStyle.gameTopHeader.all);
    return style;
  }
  //LeftSideBarComponent MenuLink li
  showLg() {
    var style = {};
    Object.assign(style, this._systemStyle.showLg.all);
    return style;
  }
  tab() {
    var style = {};
    Object.assign(style, this._systemStyle.tab.all);
    return style;
  }
  tabList() {
    var style = {};
    Object.assign(style, this._systemStyle.tabList.all);
    return style;
  }
  tabContent() {
    var style = {};
    Object.assign(style, this._systemStyle.tabContent.all);
    return style;
  }

  //
  // TODO: There is no point in having canvas as a database item. Just put it directly into the component.
  //
  squareCanvasStyle(side) {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 2
    };
  }

  ribbonMoveList() {
    return {};
  }
  /**
   *
   * @param which Position of the text
   * @param color Color of the square
   */
  internalRankAndFileStyle(which, color, side) {
    const style = {}; // width: side, height: side };

    if (this._boardStyle.internal_rank_and_file.all)
      Object.assign(style, this._boardStyle.internal_rank_and_file.all);

    Object.assign(style, this._boardStyle.internal_rank_and_file.color[color]);
    Object.assign(
      style,
      this._boardStyle.internal_rank_and_file.position[which]
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

    if (this._boardStyle.external_rank_and_file.all)
      Object.assign(style, this._boardStyle.external_rank_and_file.all);

    return style;
  }
}

const developmentcss = [
  {
    name: "developmentcss",
    type: "system",
    settingIcon: {
      all: {
        position: "absolute",
        left: "-40px",
        top: "10px"
      }
    },
    rightTopContent: {
      all: {
        height: "55vh"
      }
    },
    rightBottomContent: {
      all: {
        height: "45vh"
      }
    },
    actionButtonImage: {
      takeBack: {
        backgroundImage: "../../../../../public/images/take-forward-icon.png"
      },
      draw: {
        backgroundImage: "../../../../../public/images/draw-icon.png"
      },
      resign: {
        backgroundImage: "../../../../../public/images/resign-icon.png"
      },
      abort: {
        backgroundImage: "../../../../../public/images/abort-icon.png"
      }
    },
    gameAnalysisIcon: {
      all: {
        backgroundImage: "../../../../../public/images/live-analisys-icon.png"
      }
    },
    gameSheetDownloadIcon: {
      all: {
        backgroundImage: "../../../../../public/images/download-icon-gray.png"
      }
    },
    gameShareIcon: {
      all: {
        backgroundImage: "../../../../../public/images/share-icon-gray.png"
      }
    },
    chatContent: {
      all: {
        padding: "20px 15px",
        maxHeight: "230px",
        overflowY: "scroll",
        minHeight: "230px"
      }
    },

    chatInputBox: {
      all: {
        position: "absolute",
        padding: "0 0px",
        borderTop: "#ccc solid 1px !important",
        maxWidth: "100%",
        width: "100%",
        bottom: "0px",
        background: "#fff"
      }
    },
    chatSendButton: {
      all: {
        background: "../../../../../public/images/send-btn.png",
        position: "absolute",
        right: "0",
        top: "0",
        width: "50px",
        height: "50px",
        border: "none",
        outline: "none",
        cursor: "pointer"
      }
    },
    gameMoveList: {
      all: {
        background: "#fff",
        padding: "10px 15px",
        color: "#808080",
        overflowY: "auto",
        maxHeight: "185px"
      }
    },
    gameButtonMove: {
      all: {
        background: "#f1f1f1",
        display: "flex",
        flexWrap: "nowrap",
        textAlign: "center",
        padding: "8px 0",
        position: "absolute",
        width: "100%",
        bottom: "350px",
        zIndex: "999"
      }
    },
    gameTopHeader: {
      all: {
        marginLeft: "5px"
      }
    },
    showLg: {
      all: {
        display: "block"
      }
    },
    tab: {
      all: {}
    },
    tabList: {
      all: {
        display: "inline-block",
        listStyle: "none",
        marginBottom: "-1px",
        padding: "1.5rem 1.75rem"
      }
    },
    tabContent: {
      all: {}
    }
  },
  {
    name: "developmentcss",
    type: "board",
    tagLine: {
      all: {
        marginTop: "10px",
        marginLeft: "10px"
      }
    },
    userName: {
      all: {
        color: "#fff",
        fontSize: "18px",
        fontWeight: "600",
        marginRight: "15px"
      }
    },
    flags: {
      all: {
        backgroundImage: "../../../../../public/images/user-flag.png"
      },
      in: {
        backgroundImage: "india.png"
      },
      us: {
        backgroundImage: "../../../../../public/images/user-flag.png"
      }
    },
    clock: {
      all: {
        position: "absolute",
        right: "0",
        height: "auto",
        lineHeight: "30px",
        padding: "6px 20px",
        textAlign: "right",
        borderRadius: "3px",
        fontSize: "19px",
        color: "#fff",
        top: "5px",
        background: "#333333",
        fontWeight: "700"
      }
    },
    square: {
      all: {},
      w: {
        backgroundColor: "green"
      },
      b: {
        backgroundColor: "yellow"
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
    },
    fsquare: {
      all: {},
      w: {
        backgroundColor: "blue"
      },
      b: {
        backgroundColor: "blue"
      }
    },
    fallendpieces: {
      all: {
        margin: "2px",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100%",
        backgroundPosition: "center",
        display: "inline-block",
        borderRadius: "3px"
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
  }
];
