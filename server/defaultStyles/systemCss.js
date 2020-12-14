const systemCss = {
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
  fullWidth: {
    width: "100%"
  },
  drawActionSection: {
    height: "auto",
    width: "auto",
    alignItems: "center",
    backgroundColor: "red",
    fontSize: "16px",
    color: "blue",
    padding: "2px 10px"
  },
  drawSectionButton: {
    margin: "0 auto",
    display: "block",
    paddingBottom: "5px"
  },
  moveListParent: {
    backgroundColor: "#00BFFF",
    margin: "5px",
    height: "auto",
    width: "50px",
    display: "inline-block"
  },
  gameMoveStyle: {
    color: "#808080",
    fontWeight: "450"
  },
  toggleMenuHeight: {
    height: "30px"
  },
  parentDivPopupMainPage: {
    float: "left"
  },
  outerPopupMainPage: {
    width: "350px",
    height: "auto",
    borderRadius: "3px",
    background: "#b7bdc5",
    position: "fixed",
    zIndex: "99",
    left: "0",
    right: "25%",
    margin: "0 auto",
    top: "27%",
    padding: "20px",
    textAlign: "center",
    border: "3px solid ",
    borderColor: "#242f35"
  },
  innerPopupMainPage: {
    backgroundColor: "#1565c0",
    border: "none",
    color: "white",
    padding: "7px 20px",
    textAign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "12px",
    borderRadius: "5px",
    margin: "0px 6px 0 0"
  },
  buttonBackgroundImage: {
    takeBack: "images/take-forward-icon.png",
    draw: "images/draw-icon.png",
    resign: "images/resign-icon.png",
    action: "images/action-icon.png",
    abort: "images/abort-icon.png",
    gameShare: "images/share-icon-gray.png",
    gameDownload: "images/download-icon-gray.png",
    gameAnalysis: "images/live-analisys-icon.png",
    circleCompass: "images/circle-compass-icon.png",
    fastForward: "images/fast-forward-prev.png",
    prevIconGray: "images/prev-icon-gray.png",
    nextIconGray: "images/next-icon-gray.png",
    fastForwardNext: "images/fast-forward-next.png",
    nextStart: "images/next-icon-single.png",
    nextStop: "images/next-icon-single-stop.png",
    flipIconGray: "images/flip-icon-gray.png",
    settingIcon: "images/setting-icon.png",
    fullScreen: "images/full-screen-icon.png",
    tournamentUserIcon: "images/user-icon.png",
    chatSendButton: "images/send-btn.png",
    toggleMenu: "images/menu-button-of-three-lines.svg",
    deleteSign: "images/delete-sign.png",
    examine: "images/examine-icon.png",
    /**Main Page.jsx */
    infoIcon: "images/info-icon.png",
    pgnIcon: "images/pgnicon.png",
    checkedIcon: "images/checked.png",
    closeIcon: "images/close.png",
    logoWhite: "images/logo-white-lg.png",

    /**Home image */
    homeImage: "images/home-page/home-top.jpg"
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
      borderBottom: "1px solid #e8e7e6",
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "center",
      justifyContent: "left",
      minHeight: "40px",
      maxHeight: "40px",
      cursor: "pointer",
      width: "100%",
      color: "#a7a6a2 !important"
    },
    toggleOpen: {
      textAlign: "center",
      position: "absolute",
      left: "130px",
      top: "16px",
      width: "26px",
      overflow: "hidden",
      zIndex: "99"
    },
    toggleClose: {
      textAlign: "center",
      position: "absolute",
      left: "10px",
      top: "56px",
      width: "26px",
      overflow: "hidden",
      zIndex: "99"
    },
    middleBoard: {
      flex: "0",
      textAlign: "center",
      right: "0px",
      margin: "10px 5px 0px 0px",
      position: "absolute",
      top: "0px",
      zIndex: "99"
    },
    formButton: {
      backgroundColor: "#1565c0",
      textAlign: "center",
      padding: "10px 20px",
      border: "none",
      color: "#FFF",
      borderRadius: "5px"
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
      padding: "0px 10px 10px 10px",
      borderTop: "#ccc solid 1px !important",
      maxWidth: "100%",
      width: "100%",
      bottom: "0px",
      background: "#fff"
    }
  },
  gameMoveList: {
    all: {
      display: "inline-block",
      width: "100%",
      padding: "5px"
    }
  },
  gameButtonMove: {
    all: {
      background: "#f1f1f1",
      textAlign: "center",
      padding: "8px 0",
      width: "100%",
      bottom: "0px",
      zIndex: "999",
      display: "flex",
      flexWrap: "nowrap",
      position: "absolute",
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
      height: "100%",
      position: "relative"
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
      fontSize: "14px",
      textAlign: "center",
      WebkitFlex: "1",
      flex: "1",
      padding: "8px 0"
    },
    Chat: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    Events: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    RoomChat: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    PGN: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    Observers: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    Examiner: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    FollowCoach: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    GameLibrary: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    GameHistory: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    },
    AdjournedGame: {
      backgroundColor: "#fff",
      borderTop: "0px #1565c0 solid",
      borderTopLeftRadius: "6px",
      borderTopRightRadius: "6px",
      color: "#1565c0"
    }
  },
  tabListItem1: {
    all: {
      color: " #495057",
      background: "#efefef",
      borderColor: " #1565c0",
      borderTop: " 2px #1565c0 solid",
      fontSize: "18px",
      textAlign: "center",
      WebkitFlex: "1",
      flex: "1",
      padding: "8px 0"
    }
  },
  tabContent: {
    all: {
      padding: "0px"
    }
  },
  tabSeparator: {
    all: {
      backgroundColor: "#efefef",
      padding: "15px"
    }
  },
  subTabHeader: {
    all: {
      border: "#ccc 1px solid",
      borderTop: "0px"
    }
  },
  matchUserScroll: {
    all: {
      padding: "20px",
      overflowX: "hidden",
      height: "45vh",
      overflowY: "scroll"
    }
  },
  matchUserButton: {
    all: {
      backgroundColor: "transparent",
      width: "100%",
      display: "block",
      height: "auto",
      margin: "0",
      borderRadius: "0px",
      color: "#000",
      textAlign: "left",
      border: "0px",
      borderBottom: "#ccc 1px solid",
      padding: "8px 15px",
      fontSize: "14px",
      fontWeight: "bold"
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
    },
    form: {
      paddingRight: "9px"
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
  },
  formMain: {
    all: {
      width: "100%",
      marginBottom: "15px",
      float: "left"
    }
  },
  formMainHalf: {
    all: {
      width: "50%",
      float: "left"
    }
  },
  formLabelStyle: {
    all: {
      fontWeight: "300",
      paddingRight: "9px",
      marginLeft: "0px"
    },
    first: {
      marginLeft: "0px"
    },
    radio: {
      verticalAlign: "top",
      marginLeft: "5px"
    }
  }
};

export default systemCss;
