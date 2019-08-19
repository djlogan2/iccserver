const systemcss = {
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
  buttonBackgroundImage: {
    takeBack: "images/take-forward-icon.png",
    draw: "images/draw-icon.png",
    resign: "images/resign-icon.png",
    abort: "images/abort-icon.png",
    gameShare: "images/share-icon-gray.png",
    gameDownload: "images/download-icon-gray.png",
    gameAnalysis: "images/live-analisys-icon.png",
    circleCompass: "images/circle-compass-icon.png",
    fastForward: "images/fast-forward-prev.png",
    prevIconGray: "images/prev-icon-gray.png",
    nextIconGray: "images/next-icon-gray.png",
    fastForwardNext: "images/fast-forward-next.png",
    nextIconSingle: "images/next-icon-single.png",
    flipIconGray: "images/flip-icon-gray.png",
    settingIcon: "images/setting-icon.png",
    fullScreen: "images/full-screen-icon.png",
    tournamentUserIcon: "images/user-icon.png",
    chatSendButton: "images/send-btn.png"
  },

  button: {
    all: {
      background: "none",
      border: "none",
      outline: "none",
      WebkitFlex: "1",
      MsFlex: "1",
      flex: "1"
    },
    tournamentButton: {
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "center",
      justifyContent: "left",
      minHeight: "40px",
      maxHeight: "40px",
      cursor: "pointer",
      width: "100%",
      borderBottom: "1px solid #e8e7e6",
      color: "#a7a6a2 !important"
    },
    middleBoard: {
      float: "right"
    },
    w: {
      backgroundColor: "green"
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

  InputBox: {
    all: {},
    chat: {
      position: "absolute",
      padding: "0 0px",
      borderTop: "#ccc solid 1px !important",
      maxWidth: "100%",
      width: "100%",
      bottom: "0px",
      background: "#fff"
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
      textAlign: "center",
      padding: "8px 0",
      width: "100%",
      bottom: "350px",
      zIndex: "999",
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "center"
    }
  },
  gameTopHeader: {
    all: {
      backgroundColor: "#efefef",
      display: "inline-block",
      width: "100%",
      padding: "5px 5px"
    }
  },
  showLg: {
    all: {
      display: "block"
    }
  },
  tab: {
    all: {
      height: "100%"
    }
  },
  tabList: {
    all: {
      listStyle: "none",
      marginBottom: "-1px",
      padding: "0rem 0rem",
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center"
    },

    bottom: {
      background: "#1565c0",
      paddingTop: "8px",
      color: "#fff",
      alignItems: "flex-end"
    }
  },

  tabListItem: {
    all: {
      border: "solid #ccc",
      borderWidth: "0px 0px 0px 0px",
      fontSize: "16px",
      textAlign: "center",
      WebkitFlex: "1",
      flex: "1",
      padding: "7px 0"
    },
    active: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    }
  },
  tabContent: {
    all: {
      padding: "0px"
    }
  },
  TabIcon: {
    all: {
      marginRight: "10px"
    },
    bottom: {
      margin: "0 auto",
      display: "block"
    }
  },
  span: {
    all: {
      WebkitFlex: "1",
      flex: "1",
      textAlign: "left"
    },
    name: { flex: "3" },
    status: {
      flex: "2"
    },
    count: {
      width: "30px",
      textAlign: "right",
      marginRight: "15px"
    }
  },
  challengeContent: {
    all: {
      borderRadius: " 0 0 3px 3px",
      background: "#fff",
      marginTop: "0px",

      padding: "0 15px"
    }
  },
  competitionsListItem: {
    all: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "40px",
      maxHeight: "40px",
      cursor: "pointer",
      borderBottom: "1px solid #e8e7e6",
      color: "#a7a6a2!important",
      width: "100%"
    }
  },
  tournamentContent: {
    all: {
      maxHeight: "290px",
      overflowY: "auto"
    }
  },
  pullRight: {
    all: {
      float: "right"
    }
  },
  drawSection: {
    all: {
      width: "auto",
      textAlign: "left",
      padding: "8px 0",
      flex: "auto"
    }
  },
  drawSectionList: {
    all: {
      display: "inline-block",
      listStyle: "none",
      marginRight: "5px"
    }
  }
};

const usercss = {
  name: "default-user",
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
      backgroundImage: "images/user-flag.png"
    },
    in: {
      backgroundImage: "india.png"
    },
    us: {
      backgroundImage: "images/user-flag.png"
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
    },
    alert: {
      color: "red"
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
  }
};

export { systemcss, usercss };
