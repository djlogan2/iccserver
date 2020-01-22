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
import { GameRequestPopup, ActionPopup } from "./components/Popup/Popup";
const log = new Logger("client/MainPage");

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.userId = Meteor.userId();
    this.state = {
      notification: false,
      exnotification: false,
      examinAction: "action"
    };
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
    this.notificationHandler = this.notificationHandler.bind(this);
    this.examineActionHandler = this.examineActionHandler.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.len && !!nextProps.len) {
      if (nextProps.len !== this.props.len)
        if (this.props.game.status === "examining" || this.state.notification === true) {
          this.setState({ notification: false, exnotification: false });
        }
    }
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
  gameRequest = (title, requestId) => {
    return (
      <GameRequestPopup requestId={requestId} title={title} cssmanager={this.props.cssmanager} />
    );
  };
  examineActionHandler(action) {
    this.setState({ exnotification: false, examinAction: action });
  }
  actionPopup = (title, action) => {
    return (
      <ActionPopup
        gameID={this.gameId}
        title={title}
        action={action}
        cssmanager={this.props.cssmanager}
      />
    );
  };
  notificationPopup = (title, action) => {
    return (
      <div style={this.props.cssmanager.outerPopupMain()}>
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#000",
              fontSize: "17px"
            }}
          >
            {title}
          </h3>
          <button
            onClick={() => this.notificationHandler()}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  examinActionPopup = action => {
    if (action === "complain") {
      return (
        <div style={this.props.cssmanager.outerPopupMain()}>
          <button
            style={{
              position: "absolute",
              top: "-17px",
              right: "-16px",
              background: "#b7bdc5",
              borderRadius: "50%",
              border: "3px solid #242f35"
            }}
            onClick={() => this.examinActionCloseHandler()}
          >
            <img src={this.props.cssmanager.buttonBackgroundImage("deleteSign")} alt="Delete" />
          </button>
          <div className="popup_inner">
            <div>
              <label>Email</label>
              <input type="text" name="email" />
            </div>
            <div>
              <label>Complaint</label>
              <textarea name="complaint" rows="4" cols="35" />
            </div>
            <div>
              <button
                onClick={() => this.examinActionCloseHandler()}
                style={this.props.cssmanager.innerPopupMain()}
              >
                submit
              </button>
            </div>
          </div>
        </div>
      );
    } else if (action === "emailgame") {
      return (
        <div style={this.props.cssmanager.outerPopupMain()}>
          <button
            style={{
              position: "absolute",
              top: "-17px",
              right: "-16px",
              background: "#b7bdc5",
              borderRadius: "50%",
              border: "3px solid #242f35"
            }}
            onClick={() => this.examinActionCloseHandler()}
          >
            <img src={this.props.cssmanager.buttonBackgroundImage("deleteSign")} alt="Delete" />
          </button>
          <div className="popup_inner">
            <div>
              <label>Email</label>
              <input type="text" name="email" />
            </div>

            <div>
              <button
                onClick={() => this.examinActionCloseHandler()}
                style={this.props.cssmanager.innerPopupMain()}
              >
                submit
              </button>
            </div>
          </div>
        </div>
      );
    }
  };
  notificationHandler() {
    this.setState({ notification: !this.state.notification });
  }
  examinActionCloseHandler() {
    this.setState({ exnotification: true });
  }
  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };
  render() {
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    const GameRequest = this.props.gameRequest;
    let informativePopup = null;
    let actionPopup = null;
    let status = "others";
    let undo = false;
    let position = { top: "w" };
    if (
      !!GameRequest &&
      GameRequest.type === "match" &&
      GameRequest.receiver_id === Meteor.userId()
    )
      informativePopup = this.gameRequest("Opponent has requested for a game", GameRequest["_id"]);

    if ((!!game && game.status === "playing") || (!!game && game.status === "examining")) {
      status = game.status;
      this.gameId = game._id;
      if (game.black.id === Meteor.userId()) {
        Object.assign(position, { top: "w" });
      } else {
        Object.assign(position, { top: "b" });
      }
      Object.assign(
        this.Main.MiddleSection,
        { black: game.black },
        { white: game.white },
        { clocks: game.clocks }
      );

      if (gameTurn === "w") {
        Object.assign(this.Main.MiddleSection.clocks.white, { isactive: true });
        Object.assign(this.Main.MiddleSection.clocks.black, { isactive: false });
      } else {
        Object.assign(this.Main.MiddleSection.clocks.white, { isactive: false });
        Object.assign(this.Main.MiddleSection.clocks.black, { isactive: true });
      }
      this.Main.RightSection.MoveList = game;
      Object.assign(this.Main.RightSection.Action, {
        gameId: this.gameId,
        userId: this.userId,
        user: Meteor.user().username
      });
      const othercolor = this.userId === game.white.id ? "black" : "white";

      const actions = game.actions;
      if (status === "examining") {
        undo = true;
      }
      if (!!actions && actions.length !== 0) {
        let ack = actions[actions.length - 1];
        switch (ack["type"]) {
          case "abort_accepted":
            if (ack["issuer"] !== this.userId && this.state.notification === false) {
              informativePopup = this.notificationPopup(
                "Abort request has been accepted by the opponent",
                "abort"
              );
            }
            break;
          case "abort_declined":
            if (ack["issuer"] !== this.userId && this.state.notification === false) {
              informativePopup = this.notificationPopup(
                "Abort request has been declined by the opponent",
                "abort"
              );
            }
            break;
          case "draw_accepted":
            if (ack["issuer"] !== this.userId && this.state.notification === false) {
              informativePopup = this.notificationPopup(
                "Draw request has been accepted by the opponent",
                "abort"
              );
            }
            break;
          case "draw_declined":
            if (ack["issuer"] !== this.userId && this.state.notification === false) {
              informativePopup = this.notificationPopup(
                "Draw request has been declined by the opponent",
                "abort"
              );
            }
            break;
          case "resign":
            if (ack["issuer"] !== this.userId && this.state.notification === false) {
              informativePopup = this.notificationPopup("Game is resigned by opponent", "abort");
            }
            break;
          case "takeback_accepted":
            undo = true;
            break;
          default:
            break;
        }

        for (const action of actions) {
          const issuer = action["issuer"];
          switch (action["type"]) {
            case "takeback_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].takeback.number > 0)
              ) {
                let backCount =
                  game.pending[othercolor].takeback.number === 1
                    ? "Take Back 1 Move"
                    : " Take Back 2 Moves";
                actionPopup = this.actionPopup(backCount, "takeBack");
              }
              break;
            case "draw_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].draw !== "0")
              ) {
                actionPopup = this.actionPopup("Draw", "draw");
              }
              break;
            case "abort_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].abort !== "0")
              ) {
                actionPopup = this.actionPopup("Abort", "abort");
              }
              break;
            default:
              break;
          }
        }
      }
    } else {
      this.intializeBoard();
    }
    let exPopup = null;

    if (
      this.state.exnotification === false &&
      (this.state.examinAction === "emailgame" || this.state.examinAction === "complain")
    ) {
      exPopup = this.examinActionPopup(this.state.examinAction);
    }
    let w;
    let h;
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
            {exPopup}
            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this.props.onDrop}
              onDrawCircle={this.props.onDrawCircle}
              onRemoveCircle={this.props.onRemoveCircle}
              top={position.top}
              circles={this.props.circles}
              undo={undo}
              gameStatus={status}
            />
          </div>
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            {actionPopup}
            <RightSidebar
              cssmanager={this.props.cssmanager}
              RightSidebarData={this.Main.RightSection}
              gameStatus={status}
              flip={this._flipboard}
              actionData={this.Main.RightSection.Action}
              gameRequest={this.props.gameRequest}
              clientMessage={this.props.clientMessage}
              ref="right_sidebar"
              examing={this.props.examing}
              path={this.props.path}
              examineAction={this.examineActionHandler}
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
