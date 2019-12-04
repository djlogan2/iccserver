import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import Chess from "chess.js";
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
    this.toggleMenu = this.toggleMenu.bind(this);
    this.userId = Meteor.userId();

    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        BlackPlayer: {
          Rating: "0000",
          Name: "Player-1",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-top.png",
          IsActive: false
        },
        WhitePlayer: {
          Rating: "0000",
          Name: "Player-2",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-bottom.png",
          IsActive: false
        }
      },
      RightSection: {
        TournamentList: {
          Tournaments: Tournament
        },
        MoveList: {
          GameMove: ""
        },
        Action: {}
      }
    };
  }

  intializeBoard = () => {
    this.Main.MiddleSection.BlackPlayer.IsActive = false;
    this.Main.MiddleSection.WhitePlayer.IsActive = false;
    /*
  this.Main.MiddleSection.BlackPlayer.Rating="0000";
  this.Main.MiddleSection.BlackPlayer.Name="Player-1";
  this.Main.MiddleSection.BlackPlayer.Flag= "us";
  this.Main.MiddleSection.BlackPlayer.Timer= 1000;
  this.Main.MiddleSection.BlackPlayer.UserPicture="player-img-top.png";
  this.Main.MiddleSection.BlackPlayer.IsActive= false;
  this.Main.MiddleSection.WhitePlayer.Rating= "0000";
  this.Main.MiddleSection.WhitePlayer.Name="Player-2";
  this.Main.MiddleSection.WhitePlayer.Flag= "us";
  this.Main.MiddleSection.WhitePlayer.Timer=1000;
  this.Main.MiddleSection.WhitePlayer.UserPicture="player-img-bottom.png";
  this.Main.MiddleSection.WhitePlayer.IsActive= false; */
  };
  gameRequest = (title, param) => {
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3>{title}</h3>
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

  actionPopup = (title, action) => {
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3>{title}</h3>

          <button
            onClick={this._performAction.bind(this, "accepted", action)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Accept
          </button>
          <button
            onClick={this._performAction.bind(this, "rejected", action)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            cancel
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
  _performAction = (actionType, action) => {
    switch (action) {
      case "takeBackRequest":
        this.takeBackRequest();
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
  takeBackRequest = () => {
    Meteor.call("requestTakeback", "takeBackRequest", this.gameId, 1);
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

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

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
    let position = {};
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
        this.Main.MiddleSection.BlackPlayer.Name = game.black.name;
        this.Main.MiddleSection.BlackPlayer.Rating = game.black.rating;
        this.Main.MiddleSection.WhitePlayer.Name = game.white.name;
        this.Main.MiddleSection.WhitePlayer.Rating = game.white.rating;
        this.Main.MiddleSection.BlackPlayer.Timer = game.clocks.black.current;
        this.Main.MiddleSection.WhitePlayer.Timer = game.clocks.white.current;
        if (gameTurn === "w") {
          this.Main.MiddleSection.BlackPlayer.IsActive = false;
          this.Main.MiddleSection.WhitePlayer.IsActive = true;
        } else {
          this.Main.MiddleSection.BlackPlayer.IsActive = true;
          this.Main.MiddleSection.WhitePlayer.IsActive = false;
        }
        this.userId = Meteor.userId();
        this.gameId = game._id;
        this.Main.RightSection.MoveList.GameMove = game;
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
            //  const action = actions[actions.length - 1];
            // TODO: Why are we scanning actions? Isn't just checking the game.pending values enough for display and decisions?
            const issuer = action["issuer"];
            switch (action["type"]) {
              case "takeback_requested":
                if (issuer !== this.userId && game.pending[othercolor].takeback.number > 0) {
                  actionPopup = this.actionPopup("Oppenent has requested to Take Back", "takeBack");
                }
                break;
              case "draw_requested":
                if (issuer !== this.userId && game.pending[othercolor].draw !== "0") {
                  actionPopup = this.actionPopup("Oppenent has requested to Draw", "draw");
                }
                break;
              case "abort_requested":
                if (issuer !== this.userId && game.pending[othercolor].abort !== "0") {
                  actionPopup = this.actionPopup("Oppenent has requested to Abort", "abort");
                }
                break;
              default:
                break;
            }
          }
        }
      }
    }

    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }
    // log.debug("MainPage render, cssmanager=" + this.props.cssmanager);
    let w = this.state.width;
    let h = this.state.height;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
    return (
      <div className="main">
        <div className="row">
          <div className="col-sm-2 left-col">
            <aside>
              <div
                className={
                  this.state.visible ? "sidebar left device-menu fliph" : "sidebar left device-menu"
                }
              >
                <div className="pull-left image">
                  <img src="../../../images/logo-white-lg.png" alt="" />
                </div>
                <button
                  style={this.props.cssmanager.buttonStyle(buttonStyle)}
                  onClick={this.toggleMenu}
                >
                  <img
                    src={this.props.cssmanager.buttonBackgroundImage("toggleMenu")}
                    style={this.props.cssmanager.toggleMenuHeight()}
                    alt="toggle menu"
                  />
                </button>
                <LeftSidebar
                  cssmanager={this.props.cssmanager}
                  LefSideBoarData={this.Main.LeftSection}
                  history={this.props.history}
                />
              </div>
            </aside>
          </div>

          <div className="col-sm-6 col-md-6" style={this.props.cssmanager.parentPopup(h, w)}>
            {informativePopup}
            {actionPopup}
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
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
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
    link: "#home",
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
