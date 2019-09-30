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
    this.state = {
      username: "",
      visible: false,
      startgame: false,
      aborted: false,
      resigned: false,
      draw: false,
      move: null
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

  componentDidUpdate(prevProps) {
    if (this.props.game !== undefined) {
      if (prevProps.game !== this.props.game) {
        this.setState({
          draw: false,
          aborted: false,
          startgame: false
        });
      }
    }
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
            onClick={this.hideInformativePopup.bind(this, "startgame")}
            style={this.props.cssmanager.innerPopupMain()}
          >
            close me
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
            onClick={this._performAction.bind(
              this,
              "accepted",
              action,
              this.userId
            )}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Accept
          </button>
          <button
            onClick={this.gameDecline.bind(
              this,
              "rejected",
              action,
              this.userId
            )}
            style={this.props.cssmanager.innerPopupMain()}
          >
            cancel
          </button>
        </div>
      </div>
    );
  };
  _gamePgnView(actionType) {
    return true;
  }
  _performAction = (actionType, action) => {
    alert(action);
    switch (action) {
      case "takeBack":
        this.tackBack(actionType);
        break;
      case "draw":
        this.draw(actionType);
        break;
      case "abort":
        this.abort(actionType);
        break;
      case "resign":
        this.resign(actionType);
        break;
      case "pgnview":
        this._gamePgnView(actionType);
        break;
      default:
    }
  };

  gameDecline = (actionType, action) => {
    Meteor.call("game.decline", this.gameId, action);
  };

  gameAccept = name => {
    Meteor.call("game.accept", name);
  };

  tackBack = actionType => {
    Meteor.call("game.takeback", this.gameId, actionType);
  };

  draw = actionType => {
    Meteor.call("game.draw", this.gameId, actionType);
  };

  abort = actionType => {
    Meteor.call("game.abort", this.gameId, actionType);
  };

  resign = (actionType, action) => {
    Meteor.call("game.resign", this.gameId, actionType);
  };

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  hideInformativePopup(param) {
    if (param === "startgame") {
      this.setState({
        startgame: true,
        resigned: false,
        aborted: false,
        draw: false
      });
    } else if (param === "resigned") {
      this.setState({
        resigned: true,
        startgame: false,
        aborted: false,
        draw: false
      });
    } else if (param === "aborted") {
      this.setState({
        aborted: true,
        startgame: false,
        draw: false
      });
    } else if (param === "draw") {
      this.setState({
        draw: false,
        aborted: false,
        startgame: false
      });
    }
  }

  _pieceSquareDragStop = raf => {
    this.props.onDrop({
      from: raf.from,
      to: raf.to
    });
  };

  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };

  render() {
    log.debug("legacyMessage=" + this.props.legacymessages);
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    let informativePopup = null;
    let actionPopup = null;
    let position = {};
    if (game !== undefined) {
      if (game.black.name === Meteor.user().username) {
        Object.assign(position, { top: "w" });
      }
      if (game.white.name === Meteor.user().username) {
        Object.assign(position, { top: "b" });
      }
      if (
        game.requestBy !== this.userId &&
        game.status === "pending" &&
        this.state.startgame === false
      ) {
        informativePopup = this.gameRequest(
          "Opponent has requested for a game",
          game.requestBy
        );
        this.intializeBoard();
      } else if (game.status === "playing") {
        this.Main.MiddleSection.BlackPlayer.Name = game.black.name;
        this.Main.MiddleSection.WhitePlayer.Name = game.white.name;
        this.Main.MiddleSection.BlackPlayer.Timer = game.clocks.black.time;
        this.Main.MiddleSection.WhitePlayer.Timer = game.clocks.white.time;
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
        let actions = game.actions;
        if (actions !== undefined && actions.length !== 0) {
          let action = actions[actions.length - 1];
          if (action["type"] === "takeBack" && action["value"] === "request") {
            if (
              gameTurn === "w" &&
              game.white.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.black.name + " has requested to Take Back",
                "takeBack"
              );
            } else if (
              gameTurn === "b" &&
              game.black.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.white.name + " has requested to Take Back",
                "takeBack"
              );
            }
          } else if (
            action["type"] === "draw" &&
            action["value"] === "request"
          ) {
            if (
              gameTurn === "b" &&
              game.white.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.black.name + " has requested to draw",
                "draw"
              );
            } else if (
              gameTurn === "w" &&
              game.black.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.white.name + " has requested to draw",
                "draw"
              );
            }
          } else if (
            action["type"] === "resign" &&
            action["value"] === "request"
          ) {
            if (
              gameTurn === "b" &&
              game.white.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.black.name + " has requested to resign",
                "resign"
              );
            } else if (
              gameTurn === "w" &&
              game.black.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.white.name + " has requested to resign",
                "resign"
              );
            }
          } else if (
            action["type"] === "abort" &&
            action["value"] === "request"
          ) {
            if (
              gameTurn === "b" &&
              game.white.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.black.name + " has requested to abort",
                "abort"
              );
            } else if (
              gameTurn === "w" &&
              game.black.name === Meteor.user().username
            ) {
              actionPopup = this.actionPopup(
                game.white.name + " has requested to abort",
                "abort"
              );
            }
          } else if (action["value"] === "accepted") {
            this.intializeBoard();
          }
        }
      } else {
        this.intializeBoard();
      }
    }
    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }
    log.debug("MainPage render, cssmanager=" + this.props.cssmanager);
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
                  this.state.visible
                    ? "sidebar left device-menu fliph"
                    : "sidebar left device-menu"
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
                    src={this.props.cssmanager.buttonBackgroundImage(
                      "toggleMenu"
                    )}
                    style={this.props.cssmanager.toggleMenuHeight()}
                    alt="toggle menu"
                  />
                </button>
                <LeftSidebar
                  cssmanager={this.props.cssmanager}
                  LefSideBoarData={this.Main.LeftSection}
                />
              </div>
            </aside>
          </div>

          <div
            className="col-sm-6 col-md-6"
            style={this.props.cssmanager.parentPopup(h, w)}
          >
            {informativePopup}
            {actionPopup}
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this._pieceSquareDragStop}
              top={position.top}
              legacymessages={this.props.legacymessages}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
              flip={this._flipboard}
              performAction={this._performAction}
              actionData={this.Main.RightSection.Action}
              ref="right_sidebar"
              legacymessages={this.props.legacymessages}
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
    label: "logIn",
    link: "#log-in",
    src: "../../../images/login-icon-white.png"
  },
  {
    label: "singUp",
    link: "#sign-up",
    src: "../../../images/signup-icon-white.png"
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
