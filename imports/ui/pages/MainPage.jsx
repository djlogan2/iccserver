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
import i18n from "meteor/universe:i18n";
const log = new Logger("client/MainPage");

export default class MainPage extends Component {
  constructor(props) {
    super(props);
    this.gameId = null;
    this.userId = Meteor.userId();
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      examineGame: false,
      exnotification: false,
      resignnotification: false,
      newOppenetRequest: false,
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
    this.startGameExamine = this.startGameExamine.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!!this.props.len && !!nextProps.len) {
      if (nextProps.len !== this.props.len)
        if (
          this.props.game.status === "examining" &&
          (this.state.exnotification === true || this.state.newOppenetRequest === true)
        ) {
          this.setState({ exnotification: false, newOppenetRequest: false });
        }
      if (
        this.props.game.status === "playing" &&
        (this.state.newOppenetRequest === true || this.state.examineGame === true)
      ) {
        this.setState({ newOppenetRequest: false, examineGame: false });
      }
    }
  }
  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
  updateDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
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
  notificationPopup = (title, mid) => {
    let style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };
    return (
      <div style={style}>
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
            onClick={() => this.removeAcknowledgeMessage(mid)}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  notificationPopup1 = (title, mid) => {
    return (
      <div
        style={{
          width: "385px",
          height: "auto",
          borderRadius: "15px",
          background: "#ffffff",
          position: "fixed",
          zIndex: "99",
          left: "0px",
          right: "25%",
          margin: "0px auto",
          top: "27%",
          padding: "20px",
          textAlign: "center",
          border: "1px solid #ccc",
          boxShadow: "#0000004d"
        }}
      >
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
            onClick={() => this.resignnotificationPopup()}
            style={this.props.cssmanager.innerPopupMain()}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  examinActionPopup = action => {
    let style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };
    if (action === "complain") {
      return (
        <div style={style}>
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
        <div style={style}>
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
  loadGameHistroyPopup(games) {
    let result;
    let gamelist = [];
    for (let i = 0; i < games.length; i++) {
      if (
        (games[i].white.id === Meteor.userId() && games[i].result === "1-0") ||
        (games[i].black.id === Meteor.userId() && games[i].result === "0-1")
      ) {
        result = "Won";
      } else {
        result = "Loss";
      }
      gamelist.push({
        id: games[i]._id,
        name: "3 minut arina",
        white: games[i].white.name,
        black: games[i].black.name,
        result: result,
        time: games[i].startTime.toDateString()
      });
    }
    let style = {
      width: "390px",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };
    let btnstyle = this.props.cssmanager.innerPopupMain();
    Object.assign(btnstyle, { marginTop: "15px" });

    return (
      <div style={style}>
        {gamelist.length > 0 ? (
          <div style={{ maxHeight: "350px", overflowY: "auto", width: "350px" }}>
            <table
              className="gamehistory"
              style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Players
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Result
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    Date
                  </th>
                  <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                    PGN
                  </th>
                </tr>
              </thead>
              <tbody>
                {gamelist.map((game, index) => (
                  <tr key={index} style={{ cursor: "pointer" }}>
                    <td
                      style={{ padding: "5px 5px" }}
                      onClick={this.setGameExaminMode.bind(this, game.id)}
                    >
                      {game.white}-vs-{game.black}
                    </td>
                    <td style={{ padding: "5px 5px" }}>{game.result}</td>
                    <td style={{ padding: "5px 5px" }}>{game.time}</td>
                    <td
                      style={{ padding: "5px 5px" }}
                      onClick={this.gamePgnExport.bind(this, game.id)}
                    >
                      <img
                        src={this.props.cssmanager.buttonBackgroundImage("pgnIcon")}
                        style={{ width: "25px", height: "25px" }}
                        alt="pgnDownload"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <button onClick={this.props.removeGameHistory} style={btnstyle}>
          Close
        </button>
      </div>
    );
  }
  setGameExaminMode(id) {
    Meteor.call("examineGame", "ExaminedGame", id, (error, response) => {
      if (response) this.setState({ examineGame: true });
    });

    this.props.removeGameHistory();
  }
  gamePgnExport(id) {
    Meteor.call("exportToPGN", this.gameId);
  }
  startGameExamine() {
    this.setState({ examineGame: true });
  }
  examineActionHandler(action) {
    if (action === "newoppent" || action === "play") {
      this.setState({ exnotification: false, examinAction: "action", newOppenetRequest: true });
    } else this.setState({ exnotification: false, examinAction: action });
  }
  removeAcknowledgeMessage(messageId) {
    Meteor.call("acknowledge.client.message", messageId);
  }
  resignnotificationPopup() {
    this.setState({ resignnotification: true });
  }
  notificationHandler() {
    this.setState({ notification: !this.state.notification });
  }
  examinActionCloseHandler() {
    this.setState({ exnotification: true });
  }
  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    //  let translator = i18n.createTranslator("Common.chatBoxMessage", this.getLang());
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    const GameRequest = this.props.gameRequest;
    let exPopup = null;
    let actionPopup = null;
    let informativePopup = null;
    let status = "others";
    let undo = false;
    let position = { top: "w" };
    if (
      !!GameRequest &&
      GameRequest.type === "match" &&
      GameRequest.receiver_id === Meteor.userId()
    )
      informativePopup = this.gameRequest(
        GameRequest["challenger"] + " has requests for a game",
        GameRequest["_id"]
      );

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
      if (status === "examining") {
        undo = true;

        if (
          this.state.exnotification === false &&
          (this.state.examinAction === "emailgame" || this.state.examinAction === "complain")
        ) {
          exPopup = this.examinActionPopup(this.state.examinAction);
        }
      } else {
        if (gameTurn === "w") {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: true });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: false });
        } else {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: false });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: true });
        }
      }
      this.Main.RightSection.MoveList = game;

      const othercolor = this.userId === game.white.id ? "black" : "white";

      const actions = game.actions;

      if (!!actions && actions.length !== 0) {
        let ack = actions[actions.length - 1];
        if (!!ack["type"] && ack["type"] === "resign") {
          if (ack["issuer"] !== this.userId && this.state.resignnotification === false) {
            informativePopup = this.notificationPopup1("Opponent has resigend a game", "abort");
          }
        }

        if (!!ack["type"] && ack["type"] === "takeback_accepted") undo = true;

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
    if (!!this.props.GameHistory && this.props.GameHistory.length > 0) {
      informativePopup = this.loadGameHistroyPopup(this.props.GameHistory);
    }
    if (!!this.props.clientMessage && this.props.clientMessage.client_identifier !== "server") {
      informativePopup = this.notificationPopup(
        this.props.clientMessage.message,
        this.props.clientMessage._id
      );
    }
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;

    let leftmenu = null;
    let rightmenu = null;
    if (w <= 1199) leftmenu = null;
    else {
      leftmenu = (
        <LeftSidebar
          cssmanager={this.props.cssmanager}
          LefSideBoarData={this.Main.LeftSection}
          history={this.props.history}
          gameHistory={this.props.gameHistoryload}
          examineAction={this.examineActionHandler}
        />
      );
    }
    if (w > 600) {
      rightmenu = (
        <div className="col-sm-5 col-md-4 col-lg-5 right-section">
          {actionPopup}
          <RightSidebar
            cssmanager={this.props.cssmanager}
            RightSidebarData={this.Main.RightSection}
            gameStatus={status}
            currentGame={this.state.examineGame}
            newOppenetRequest={this.state.newOppenetRequest}
            flip={this._flipboard}
            gameRequest={this.props.gameRequest}
            clientMessage={this.props.clientMessage}
            ref="right_sidebar"
            examing={this.props.examing}
            startGameExamine={this.startGameExamine}
            examineAction={this.examineActionHandler}
          />
        </div>
      );
    } else rightmenu = null;
    return (
      <div className="main">
        <div className="row">
          {leftmenu}
          <div className="col-sm-7 col-md-8 col-lg-6 boardcol">
            {informativePopup}
            {exPopup}

            <MiddleBoard
              cssmanager={this.props.cssmanager}
              MiddleBoardData={this.Main.MiddleSection}
              currentGame={this.state.examineGame}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this.props.onDrop}
              onDrawCircle={this.props.onDrawCircle}
              onRemoveCircle={this.props.onRemoveCircle}
              top={position.top}
              circles={this.props.circles}
              undo={undo}
              width={this.state.width}
              height={this.state.height}
              gameStatus={status}
            />
          </div>
          {rightmenu}
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
    label: "mygame",
    link: "mygame",
    src: "../../../images/learning-icon-white.png"
  },
  {
    label: "learn",
    link: "learn",
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
