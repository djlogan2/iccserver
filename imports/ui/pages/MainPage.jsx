import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import "./css/ChessBoard";
import "./css/leftsidebar";
import "./css/RightSidebar";
import { links, tournament } from "./hardcode.json";
import MiddleBoard from "./MiddleSection/MiddleBoard";
import { Logger } from "../../../lib/client/Logger";
import { ModalProvider } from "./ModalContext";
import {
  ActionPopup,
  ExaminActionPopup,
  GameNotificationPopup,
  GameRequestPopup,
  GameResignedPopup
} from "./components/Popup";
import ExportPgnButton from "./components/Button/ExportPgnButton";
import { translate } from "../HOCs/translate";

const log = new Logger("client/MainPage");

class MainPage extends Component {
  constructor(props) {
    super(props);
    log.trace("MainPage constructor", props);

    this.gameId = null;
    this.userId = Meteor.userId();

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      examineGame: false,
      exnotification: false,
      notification: false,
      newOppenetRequest: false,
      examinAction: "action",
      activeTab: 0,
      modalShow: 0,
      toggleModal: this.toggleModal
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
          Tournaments: tournament
        },
        MoveList: {},
        status: "other",
        Action: {}
      }
    };
  }

  toggleModal = modalShow => {
    const { removeGameHistory } = this.props;

    this.setState({ modalShow });

    if (!modalShow) {
      removeGameHistory();
    }
  };

  componentWillReceiveProps(nextProps) {
    const { game } = this.props;
    const { newOppenetRequest, examineGame, exnotification } = this.state;

    if (!!game && !!nextProps.game) {
      // TODO: I have no idea what this is supposed to be doing, but it is not going to work.
      //       actions do not get published.
      if (
        nextProps.game.actions.length !== game.actions.length &&
        game.status === "examining" &&
        (exnotification || newOppenetRequest)
      ) {
        this.setState({ exnotification: false, newOppenetRequest: false });
      }
      if (game.status === "playing" && (newOppenetRequest || examineGame)) {
        this.setState({ newOppenetRequest: false, examineGame: false });
      }
    }
  }

  componentDidMount() {
    this.updateDimensions();

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  intializeBoard = () => {
    Object.assign(this.Main.MiddleSection, {
      tomove: "white",
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
    const { cssManager } = this.props;

    return <GameRequestPopup requestId={requestId} title={title} cssManager={cssManager} />;
  };

  actionPopup = (title, action) => {
    const { cssManager } = this.props;

    return (
      <ActionPopup gameId={this.gameId} title={title} action={action} cssManager={cssManager} />
    );
  };

  EnhancedGameNotificationPopup = (title, mid) => {
    const { cssManager } = this.props;

    return <GameNotificationPopup mid={mid} title={title} cssManager={cssManager} />;
  };

  GameResignedPopup = (title, mid) => {
    const { cssManager } = this.props;

    return (
      <GameResignedPopup
        mid={mid}
        title={title}
        cssManager={cssManager}
        resignNotificationCloseHandler={this.resignNotificationCloseHandler}
      />
    );
  };
  examinActionPopup = action => {
    const { cssManager } = this.props;

    return (
      <ExaminActionPopup
        action={action}
        cssManager={cssManager}
        examinActionCloseHandler={this.examinActionCloseHandler}
      />
    );
  };

  uploadPgn = () => {
    this.setState({ notification: true });
  };

  loadGameHistroyPopup = games => {
    const { cssManager, translate } = this.props;

    let result;
    const gamelist = [];

    if (!!games && games.length) {
      games.forEach(game => {
        if (
          (game.white.id === Meteor.userId() && game.result === "1-0") ||
          (game.black.id === Meteor.userId() && game.result === "0-1")
        ) {
          result = "Won";
        } else {
          result = "Loss";
        }
        let time = "Fix me"; // TODO: This line is crashing (!!games[i].startTime)?games[i].startTime.toDateString():(games[i].tags.Time).replace(/"/g, '')

        gamelist.push({
          time,
          result,
          id: game._id,
          is_imported: games.is_imported,
          name: "3 minut arina",
          white: game.white.name.replace(/"/g, ""),
          black: game.black.name.replace(/"/g, "")
        });
      });
    }

    const style = {
      width: "490px",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99999",
      left: "0px",
      right: "0",
      margin: "0px auto",
      top: "50%",
      transform: "translateY(-50%)",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };

    const btnstyle = cssManager.innerPopupMain();
    Object.assign(btnstyle, { marginTop: "15px" });

    return (
      <ModalProvider value={this.state}>
        <div style={style}>
          {gamelist.length ? (
            <div style={{ maxHeight: "350px", overflowY: "auto", width: "100%", display: "block" }}>
              <table
                className="gamehistory"
                style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                      {translate("players")}
                    </th>
                    <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                      {translate("result")}
                    </th>
                    <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                      {translate("date")}
                    </th>
                    <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                      {translate("pgn")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gamelist.map((game, index) => (
                    <tr key={index} style={{ cursor: "pointer" }}>
                      <td
                        style={{ padding: "5px 5px" }}
                        onClick={() => this.setGameExaminMode(game.id, game.is_imported)}
                      >
                        {translate("playersColumn", { white: game.white, black: game.black })}
                      </td>
                      <td style={{ padding: "5px 5px" }}>{game.result}</td>
                      <td style={{ padding: "5px 5px" }}>{game.time}</td>
                      <td style={{ padding: "5px 5px" }}>
                        <ExportPgnButton
                          id={game.id}
                          src={this.props.cssManager.buttonBackgroundImage("pgnIcon")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ maxHeight: "350px", overflowY: "auto", width: "350px" }}>
              No Data Found
            </div>
          )}
          <button onClick={() => this.toggleModal(false)} style={btnstyle}>
            Close
          </button>
        </div>
      </ModalProvider>
    );
  };

  setGameExaminMode = (id, isImported) => {
    const { removeGameHistory } = this.props;

    Meteor.call("examineGame", "ExaminedGame", id, isImported, error => {
      if (error) {
        log.error(error);
        this.setState({ modalShow: false });
      } else {
        this.setState({ examineGame: true, activeTab: 3, modalShow: false });
      }
    });

    removeGameHistory();
  };

  startGameExamine = () => {
    this.setState({ examineGame: true, newOppenetRequest: false });
  };

  examineActionHandler = action => {
    if (action === "newoppent" || action === "play") {
      this.setState({ exnotification: false, examinAction: "action", newOppenetRequest: true });
    } else if (action === "examine") {
      this.startGameExamine();
    } else this.setState({ exnotification: false, examinAction: action });
  };

  resignNotificationCloseHandler = () => {
    this.setState(prevState => {
      return { notification: !prevState.notification };
    });
  };

  /*
  notificationHandler() {
    this.setState({ notification: !this.state.notification });
  }*/
  examinActionCloseHandler = () => {
    this.setState({ exnotification: true });
  };

  _flipboard = () => {
    this.refs.middleBoard._flipboard();
  };

  render() {
    const { translate, game, GameRequest, board, GameHistory, clientMessage } = this.props;

    let gameTurn = board.turn();
    let exPopup = null;
    let actionPopup = null;
    let informativePopup = null;
    let status;
    let position = { top: "w" };
    if (!!game) {
      if (game.black.id === Meteor.userId()) {
        this.top = "w";
        Object.assign(position, { top: "w" });
      } else {
        this.top = "b";
        Object.assign(position, { top: "b" });
      }
    } else {
      Object.assign(position, { top: this.top });
    }
    if (
      !!GameRequest &&
      GameRequest.type === "match" &&
      GameRequest.receiver_id === Meteor.userId()
    ) {
      let msg = translate("gamerequest");
      informativePopup = this.gameRequest(GameRequest["challenger"] + msg, GameRequest["_id"]);
    }

    if ((!!game && game.status === "playing") || (!!game && game.status === "examining")) {
      status = game.status;
      this.gameId = game._id;

      Object.assign(this.Main.MiddleSection, { black: game.black }, { white: game.white });
      if (status === "examining") {
        if (
          this.state.exnotification === false &&
          (this.state.examinAction === "emailgame" || this.state.examinAction === "complain")
        ) {
          informativePopup = this.examinActionPopup(this.state.examinAction);
        }
      } else {
        Object.assign(this.Main.MiddleSection, { clocks: game.clocks });
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
        for (const action of actions) {
          const issuer = action["issuer"];
          switch (action["type"]) {
            case "takeback_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].takeback.number > 0)
              ) {
                let moveCount =
                  game.pending[othercolor].takeback.number === 1 ? "halfmove" : "fullmove";
                actionPopup = this.actionPopup(translate(moveCount), "takeBack");
              }
              break;
            case "draw_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].draw !== "0")
              ) {
                actionPopup = this.actionPopup(translate("draw"), "draw");
              }
              break;
            case "abort_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].abort !== "0")
              ) {
                actionPopup = this.actionPopup(translate("abort"), "abort");
              }
              break;
            default:
              break;
          }
        }
      }
    }

    if (!!GameHistory) {
      informativePopup = this.loadGameHistroyPopup(GameHistory);
    }
    if (!!clientMessage) {
      informativePopup = this.EnhancedGameNotificationPopup(
        clientMessage.message,
        clientMessage._id
      );
    }
    if (!!this.state.notification) {
      informativePopup = this.GameResignedPopup("File upload succeshfully", "mid");
    }

    let w = this.state.width;
    if (!w) w = window.innerWidth;

    let leftmenu;
    if (w <= 1199) leftmenu = null;
    else {
      leftmenu = (
        <LeftSidebar
          cssManager={this.props.cssManager}
          gameHistory={this.props.gameHistoryload}
          examineAction={this.examineActionHandler}
        />
      );
    }

    return (
      <ModalProvider value={this.state}>
        <div className={"main " + (this.state.modalShow ? "modal-show" : "modal-hide")}>
          <div className="modal-overlay" />
          <div className="main__wrap row">
            {leftmenu}
            <div className="col-sm-7 col-md-8 col-lg-6 boardcol">
              {informativePopup}
              {exPopup}

              <MiddleBoard
                cssManager={this.props.cssManager}
                MiddleBoardData={this.Main.MiddleSection}
                currentGame={this.state.examineGame}
                ref="middleBoard"
                capture={this.props.capture}
                board={this.props.board}
                onDrop={this.props.onDrop}
                onDrawCircle={this.props.onDrawCircle}
                onRemoveCircle={this.props.onRemoveCircle}
                top={position.top}
                width={this.state.width}
                height={this.state.height}
                game={game}
              />
            </div>
            <div className="col-sm-5 col-md-4 col-lg-5 right-section">
              {actionPopup}
              <RightSidebar
                cssManager={this.props.cssManager}
                RightSidebarData={this.Main.RightSection}
                gameStatus={this.props.game.status}
                newOppenetRequest={this.state.newOppenetRequest}
                flip={this._flipboard}
                gameRequest={this.props.gameRequest}
                clientMessage={this.props.clientMessage}
                ref="right_sidebar"
                game={game}
                startGameExamine={this.startGameExamine}
                examineAction={this.examineActionHandler}
                activeTabnumber={this.state.activeTab}
                uploadPgn={this.uploadPgn}
              />
            </div>
          </div>
        </div>
      </ModalProvider>
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
};

export default translate("Common.MainPage")(MainPage);
