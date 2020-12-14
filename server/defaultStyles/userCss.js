const userCss = {
  name: "default-user",
  type: "board",
  tagLine: {
    all: {
      display: "inline-block",
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
    all: "images/user-flag.png",
    in: "images/india.png",
    us: "images/user-flag.png"
  },
  clock: {
    all: {
      right: "0",
      lineHeight: "30px",
      padding: "3px 20px",
      textAlign: "center",
      borderRadius: "3px",
      fontSize: "19px",
      color: "#fff",
      top: "5px",
      height: "36px",
      width: "93px",
      background: "#333333",
      fontWeight: "700",
      position: "absolute"
    },
    alert: {
      color: "red"
    }
  },
  userFlag: {
    all: {}
  },
  userPicture: {
    all: {
      display: "inline-block",
      borderRadius: "50%"
    }
  },
  clockMain: {
    all: {}
  },
  square: {
    all: {},

    w: {
      backgroundColor: "#fff"
    },
    b: {
      backgroundColor: "#1565c0"
    }
  },
  external_rank: {
    all: {
      float: "left",
      position: "relative",
      color: "white"
    }
  },
  external_file: {
    all: {
      float: "left",
      position: "relative",
      color: "white"
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
    w: {
      r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
      b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
      n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
      q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
      k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
      p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg"
    },
    b: {
      r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
      b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
      n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
      q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
      k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
      p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"
    }
  },
  fallendpieces: {
    all: {},
    w: {
      r: "images/fallenpieces/wR.png",

      b: "images/fallenpieces/wB.png",

      n: "images/fallenpieces/wN.png",

      q: "images/fallenpieces/wQ.png",

      k: "images/fallenpieces/wK.png",

      p: "images/fallenpieces/wP.png"
    },
    b: {
      r: "images/fallenpieces/bR.png",

      b: "images/fallenpieces/bB.png",

      n: "images/fallenpieces/bN.png",

      q: "images/fallenpieces/bQ.png",

      k: "images/fallenpieces/bK.png",

      p: "images/fallenpieces/bP.png"
    }
  }
};

export default userCss;
