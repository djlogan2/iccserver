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
    (this.gameId = null),
      (this.state = {
        username: "",
        visible: false,
        popup: false,
        takeBack: false,
        IsBlackActive: true,
        IsWhiteActive: false,
        move: null
      });

    this.toggleMenu = this.toggleMenu.bind(this);
    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        BlackPlayer: {
          Rating: "1400",
          Name: "John",
          Flag: "us",
          Timer: 1000,
          UserPicture: "player-img-top.png",
          IsActive: true
        },
        WhitePlayer: {
          Rating: "1200",
          Name: "Json",
          Flag: "us",
          Timer: 1100,
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
        }
      }
    };
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
  _takeBack = (actionType, action) => {
    Meteor.call("execute-game-action", this.gameId, actionType, action);
  };
  randomMoveObject() {
    let move = this.props.move; //moveList[Math.floor(Math.random() * moveList.length)];

    this.setState({
      move: move
    });
  }
  requestTackBack = () => {
    Meteor.call("execute-game-action", this.gameId, "request", "takeback");
  };
  acceptTackBack = () => {
    Meteor.call("execute-game-action", this.gameId, "accept", "takeback");
  };
  rejectTakeBack = () => {
    Meteor.call("execute-game-action", this.gameId, "reject", "takeback");
  };

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }
  hidePopup() {
    this.setState({ popup: !this.state.popup, takeBack: true });
  }
  render() {
    let gameTurn = this.props.board.turn();
    let popup = false;
    let takeback = false;

    if (
      this.props.move !== this.Main.RightSection.MoveList.GameMove &&
      this.props.move !== ""
    ) {
      this.Main.RightSection.MoveList.GameMove = "";
      this.Main.RightSection.MoveList.GameMove = this.props.move + ",";
    }
    if (this.props.loggedUsers !== undefined) {
      this.Main.RightSection.loggedUsers = this.props.loggedUsers;
    }
    if (gameTurn === "w") {
      this.Main.MiddleSection.BlackPlayer.IsActive = false;
      this.Main.MiddleSection.WhitePlayer.IsActive = true;
    } else {
      this.Main.MiddleSection.BlackPlayer.IsActive = true;
      this.Main.MiddleSection.WhitePlayer.IsActive = false;
    }
    if (this.props.player !== undefined) {
      this.gameId = this.props.player._id;
      this.Main.MiddleSection.BlackPlayer.Name = this.props.player.black.name;
      this.Main.MiddleSection.WhitePlayer.Name = this.props.player.white.name;
      this.Main.RightSection.MoveList.GameMove = this.props.player;

      let actions = this.props.player.actions;
      if (actions !== undefined && actions.length !== 0) {
        let action = actions[actions.length - 1];

        if (action["request"] === "takeback") {
          if (gameTurn === "w") {
            takeback = "w";
          } else {
            takeback = "b";
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

    // this.Main.RightSection.MoveList.GameMove = this.state.move + ", ";
    log.debug("MainPage render, cssmanager=" + this.props.cssmanager);
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;

    if (
      this.props.player !== undefined &&
      this.state.popup === false &&
      this.props.player.black.name === Meteor.user().username
    ) {
      if (this.props.player.moves.length === 0) {
        popup = true;
      }
    }
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
            {popup ? (
              <div style={this.props.cssmanager.outerPopupMain()}>
                <div className="popup_inner">
                  <h3>Your game started</h3>
                  <button
                    onClick={this.hidePopup.bind(this)}
                    style={this.props.cssmanager.innerPopupMain()}
                  >
                    close me
                  </button>
                </div>
              </div>
            ) : null}
            {(() => {
              if (takeback === "w") {
                return (
                  <div style={this.props.cssmanager.outerPopupMain()}>
                    <div className="popup_inner">
                      <h3>Take Back request</h3>
                      <button
                        onClick={this.acceptTackBack.bind(this)}
                        style={this.props.cssmanager.innerPopupMain()}
                      >
                        Accept
                      </button>
                      <button
                        onClick={this.rejectTakeBack.bind(this)}
                        style={this.props.cssmanager.innerPopupMain()}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                );
              } else if (takeback === "b") {
                return (
                  <div style={this.props.cssmanager.outerPopupMain()}>
                    <div className="popup_inner">
                      <h3>Take Back request</h3>
                      <button
                        onClick={this.acceptTackBack.bind(this)}
                        style={this.props.cssmanager.innerPopupMain()}
                      >
                        Accept
                      </button>
                      <button
                        onClick={this.hidePopup.bind(this)}
                        style={this.props.cssmanager.innerPopupMain()}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this._pieceSquareDragStop}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
              flip={this._flipboard}
              takeBack={this.requestTackBack}
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
  /*,
    {
      name: "1|0 Bullet Arena",
      status: "in 8 min",
      count: "55",
      src: "images/bullet-icon.png"
    },
    {
      name: "15|10 Rapid Swiss",
      status: "Round 1 of 3",
      count: "25",
      src: "images/blitz-icon.png"
    },
    {
      name: "15|10 Rapid Swiss ",
      status: "Round 1 of 5",
      count: "15",
      src: "images/rapid-icon.png"
    }
    */
];
