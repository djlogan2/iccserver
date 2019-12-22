import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import "./css/ChessBoard";
import "./css/leftsidebar";
import "./css/RightSidebar";
import MiddleBoard from "./MiddleSection/MiddleBoard";
import { Logger } from "../../../lib/client/Logger";
const log = new Logger("client/MainPage");

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.board = null;
    this.state = {
      mode: "play",
      username: "",
      visible: false,
      startgame: false,
      aborted: false,
      resigned: false,
      draw: false,
      currentPos: 0,
      history: null
    };

    this.userId = Meteor.userId();

    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        white: {
          name: "Player-1",
          rating: 1600,
          userPicture: "player-img-top.png"
        },
        black: {
          name: "Player-2",
          rating: 1600,
          userPicture: "player-img-bottom.png"
        },
        clocks: {
          white: {
            isactive: false,
            current: 300000
          },
          black: {
            isactive: false,
            current: 300000
          }
        }
      },
      RightSection: {
        TournamentList: {
          Tournaments: Tournament
        },
        MoveList: {},
        status: "other",
        Action: {}
      }
    };
  }

  intializeBoard = () => {
    Object.assign(this.Main.MiddleSection, {
      white: {
        name: "Player-1",
        rating: 1600,
        userPicture: "player-img-top.png"
      },
      black: {
        name: "Player-2",
        rating: 1600,
        userPicture: "player-img-bottom.png"
      },
      clocks: {
        white: {
          isactive: false,
          current: 480000
        },
        black: {
          isactive: false,
          current: 480000
        }
      }
    });
  };
  gameRequest = (title, param) => {
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#fff",
              fontSize: "17px"
            }}
          >
            {title}
          </h3>
          <button
            onClick={this.gameAccept.bind(this, param)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Accept
          </button>
          <button
            onClick={this.gameDecline.bind(this, param)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Decline
          </button>
        </div>
      </div>
    );
  };
  //TODO we have remove later
  actionPopup = (title, action) => {
    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            marginTop: "0px",
            alignItems: "center",
            color: "#fff",
            border: "1px solid #f88117",
            position: "absolute",
            right: "8px",
            background: "#f88117e0",
            width: "195px",
            top: "15px",
            zIndex: "9",
            webkitBoxShadow: "#949392 3px 2px 4px 0px",
            mozBoxShadow: "#949392 3px 2px 4px 0px",
            boxShadow: "#949392 3px 2px 4px 0px",
            borderRadius: "4px",
            padding: "10px 15px"
          }}
        >
          <img
            src={this.props.cssmanager.buttonBackgroundImage("infoIcon")}
            style={{ width: "18px", marginRight: "10px" }}
            alt="info"
          />
          <strong style={{ width: "100px", marginRight: "6px", fontSize: "14px" }}>{title}</strong>
          <button
            onClick={this._performAction.bind(this, "accepted", action)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("checkedIcon")}
              style={{ width: "18px" }}
              alt="accept"
            />
          </button>
          <button
            onClick={this._performAction.bind(this, "rejected", action)}
            style={{ backgroundColor: "transparent", border: "0px" }}
          >
            <img
              src={this.props.cssmanager.buttonBackgroundImage("closeIcon")}
              style={{ width: "15px" }}
              alt="close"
            />
          </button>
        </div>
      </div>
    );
  };
  _gamePgnView(actionType) {
    switch (actionType) {
      case "startposition":
        this.startPosition();
        break;
      case "endposition":
        this.endPosition();
        break;
      case "previousOne":
        this.previousOneMove();
        break;
      case "nextOne":
        this.nextOneMove();
        break;
      default:
    }
  }
  _performAction = (actionType, action, param = "none") => {
    switch (action) {
      case "takeBackRequest":
        this.takeBackRequest(param);
        break;
      case "takeBack":
        this.takeBack(actionType);
        break;
      case "drawRequest":
        this.drawRequest();
        break;
      case "draw":
        this.draw(actionType);
        break;
      case "abortRequest":
        this.abortRequest();
        break;
      case "abort":
        this.abort(actionType);
        break;
      case "adjournRequest":
        this.adjournRequest();
        break;
      case "adjourn":
        this.adjourn(actionType);
        break;
      case "resign":
        this.resignGame();
        break;
      case "pgnview":
        this._gamePgnView(actionType);
        break;
      default:
    }
  };
  takeBackRequest = num => {
    Meteor.call("requestTakeback", "takeBackRequest", this.gameId, num);
  };
  takeBack = isAccept => {
    if (isAccept === "accepted") Meteor.call("acceptTakeBack", "takeBackAccept", this.gameId);
    else Meteor.call("declineTakeback", "takeBackDecline", this.gameId);
  };
  gameAccept = gameRequestData => {
    Meteor.call("gameRequestAccept", "gameAccept", gameRequestData["_id"]);
  };
  gameDecline = gameRequestData => {
    Meteor.call("gameRequestDecline", "gameDecline", gameRequestData["_id"]);
  };
  drawRequest = () => {
    Meteor.call("requestToDraw", "drawRequest", this.gameId);
  };
  draw = isAccept => {
    if (isAccept === "accepted") Meteor.call("acceptDraw", "drawAccept", this.gameId);
    else Meteor.call("declineDraw", "drawDecline", this.gameId);
  };
  abortRequest = () => {
    Meteor.call("requestToAbort", "abortRequest", this.gameId);
  };

  abort = isAccept => {
    if (isAccept === "accepted") Meteor.call("acceptAbort", "abortAccept", this.gameId);
    else Meteor.call("declineAbort", "abortDecline", this.gameId);
  };
  adjournRequest = () => {
    Meteor.call("requestToAdjourn", "adjournRequest", this.gameId);
  };
  adjourn = isAccept => {
    if (isAccept === "accepted") Meteor.call("acceptAdjourn", "adjournAccept", this.gameId);
    else Meteor.call("declineAdjourn", "adjournDecline", this.gameId);
  };
  resignGame = () => {
    Meteor.call("resignGame", "resignGame", this.gameId);
  };

  hideInformativePopup(param) {
    this.setState({
      draw: true,
      aborted: true,
      startgame: true
    });
  }

  _pieceSquareDragStop = raf => {
    let isMove = this.props.onDrop({
      from: raf.from,
      to: raf.to
    });
    return isMove;
  };

  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };
  startPosition = () => {
    let history = this.props.board.history();
    this.board = this.props.board;
    this.board.reset();
    this.setState({ currentPos: 0, history: history, mode: "view" });
    //this.board.move(history[this.state.currentPos]);
  };
  nextOneMove = () => {
    if (this.state.currentPos < this.state.history.length) {
      this.board.move(this.state.history[this.state.currentPos]);
      this.setState({ currentPos: this.state.currentPos + 1, mode: "view" });
    } else if (this.state.currentPos === this.state.history.length) {
      this.setState({ mode: "play" });
    }
  };
  endPosition = () => {
    let history = this.props.board.history();
    //  this.board = new Chess.Chess();
    this.board.load_pgn(history);
    this.setState({
      currentPos: history.length,
      history: history,
      mode: "play"
    });
    // this.board.move(history[history.lenth]);
  };
  previousOneMove = () => {
    if (!this.board) {
      this.board = this.props.board;
      //  let history = this.props.board.history();
    }
    this.board.undo();
    /*  this.setState({
      currentPos: currentPos,
      history: history,
      mode: "view"
    });
     */
  };
  // If Next button clicked, move forward one

  render() {
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    const gameRequest = this.props.gameRequest;
    let informativePopup = null;
    let actionPopup = null;
    let status = "others";
    let position = { top: "w" };
    if (gameRequest !== undefined) {
      if (gameRequest.type === "match" && gameRequest.receiver_id === Meteor.userId())
        informativePopup = this.gameRequest("Opponent has requested for a game", gameRequest);
    }
    if (game !== undefined) {
      this.gameId = game._id;
      if (game.black.name === Meteor.user().username) {
        Object.assign(position, { top: "w" });
      }
      if (game.white.name === Meteor.user().username) {
        Object.assign(position, { top: "b" });
      }
      if (game.status === "playing") {
        status = "playing";
        // this.Main.MiddleSection.black = game.black;
        Object.assign(this.Main.MiddleSection, { black: game.black });
        Object.assign(this.Main.MiddleSection, { white: game.white });
        Object.assign(this.Main.MiddleSection, { clocks: game.clocks });

        if (gameTurn === "w") {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: true });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: false });
        } else {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: false });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: true });
        }
        this.userId = Meteor.userId();
        this.gameId = game._id;
        this.Main.RightSection.MoveList = game.variations;
        this.Main.RightSection.Action.userId = this.userId;
        this.Main.RightSection.Action.user = Meteor.user().username;
        this.Main.RightSection.Action.gameTurn = gameTurn;
        this.Main.RightSection.Action.whitePlayer = game.white.name;
        this.Main.RightSection.Action.blackPlayer = game.black.name;
        this.Main.RightSection.Action.gameId = game._id;
        const othercolor = this.userId === game.white.id ? "black" : "white";

        const actions = game.actions;
        if (actions !== undefined && actions.length !== 0) {
          for (const action of actions) {
            const issuer = action["issuer"];
            switch (action["type"]) {
              case "takeback_requested":
                if (issuer !== this.userId && game.pending[othercolor].takeback.number > 0) {
                  actionPopup = this.actionPopup("Take Back", "takeBack");
                }
                break;
              case "draw_requested":
                if (issuer !== this.userId && game.pending[othercolor].draw !== "0") {
                  actionPopup = this.actionPopup("Draw", "draw");
                }
                break;
              case "abort_requested":
                if (issuer !== this.userId && game.pending[othercolor].abort !== "0") {
                  actionPopup = this.actionPopup("Abort", "abort");
                }
                break;
              default:
                break;
            }
          }
        }
      }
    } else {
      this.intializeBoard();
    }

    let w = this.state.width;
    let h = this.state.height;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
    return (
      <div className="main">
        <div className="row">
          <LeftSidebar
            cssmanager={this.props.cssmanager}
            LefSideBoarData={this.Main.LeftSection}
            history={this.props.history}
          />
          <div className="col-sm-6 col-md-6" style={this.props.cssmanager.parentPopup(h, w)}>
            {informativePopup}
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.state.mode === "play" ? this.props.board : this.board}
              onDrop={this._pieceSquareDragStop}
              top={position.top}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            {actionPopup}
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
              gameStatus={status}
              flip={this._flipboard}
              performAction={this._performAction}
              actionData={this.Main.RightSection.Action}
              gameRequest={this.props.gameRequest}
              clientMessage={this.props.clientMessage}
              ref="right_sidebar"
            />
          </div>
        </div>
      </div>
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
};

let links = [
  {
    label: "play",
    link: "play",
    src: "../../../images/play-icon-white.png",
    active: true
  },
  {
    label: "learn",
    link: "#learn",
    src: "../../../images/learning-icon-white.png"
  },
  {
    label: "connect",
    link: "#connect",
    src: "../../../images/connect-icon-white.png"
  },
  {
    label: "examine",
    link: "#examine",
    src: "../../../images/examine-icon-white.png"
  },
  {
    label: "topPlayers",
    link: "#top-players",
    src: "../../../images/top-player-icon-white.png"
  },
  {
    label: "logout",
    link: "#",
    src: "../../../images/login-icon-white.png"
  },
  {
    label: "help",
    link: "#help",
    src: "../../../images/help-icon-white.png"
  }
];
let Tournament = [
  {
    name: "3|2 Blitz Arena",
    status: "Round 1 of 5",
    count: "15",
    src: "images/blitz-icon.png"
  },
  {
    name: "1|0 Bullet Arena",
    status: "in 4 min",
    count: "40 ",
    src: "images/rapid-icon.png"
  },
  {
    name: "15|10 Rapid Swiss ",
    status: "Round 1 of 5",
    count: "54",
    src: "images/bullet-icon.png"
  },
  {
    name: "1|0 Bullet Arena",
    status: "Round 1 of 5",
    count: "35",
    src: "images/blitz-icon.png"
  },
  {
    name: "3|2 Blitz Arena",
    status: "Round 1 of 7",
    count: "49",
    src: "images/rapid-icon.png"
  }
];
