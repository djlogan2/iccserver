import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
// import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import AppWrapper from "./AppWrapper";
import PlayRightSidebar from "./RightSidebar/PlayRightSidebar";
// import RightSidebar from "./RightSidebar/RightSidebar";
import "./../css/ChessBoard";
import "./../css/leftsidebar";
import "./../css/RightSidebar";

import { Col } from "antd";

import { links, tournament } from "../hardcode.json";
import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";
import { Logger } from "../../../../lib/client/Logger";
import { ModalProvider } from "../ModalContext";
import {
  GameRequestPopup,
  GamenotificationPopup,
  GameResignedPopup,
  ExaminActionPopup,
  ActionPopup
} from "./Popup/Popup";
import i18n from "meteor/universe:i18n";
const log = new Logger("client/MainPage");

export default class ExaminePage extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = data => {
      this.setState({
        modalShow: data
      });
      if (!data) {
        props.removeGameHistory();
      }
    };
    this.gameId = null;
    this.userId = props.userId;
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
    //  this.notificationHandler = this.notificationHandler.bind(this);
    this.examineActionHandler = this.examineActionHandler.bind(this);
    this.startGameExamine = this.startGameExamine.bind(this);
    this.examinActionCloseHandler = this.examinActionCloseHandler.bind(this);
    this.resignNotificationCloseHandler = this.resignNotificationCloseHandler.bind(this);
    this.uploadPgn = this.uploadPgn.bind(this);
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

  GamenotificationPopup = (title, mid) => {
    return <GamenotificationPopup mid={mid} title={title} cssmanager={this.props.cssmanager} />;
  };
  GameResignedPopup = (title, mid) => {
    return (
      <GameResignedPopup
        mid={mid}
        title={title}
        cssmanager={this.props.cssmanager}
        resignNotificationCloseHandler={this.resignNotificationCloseHandler}
      />
    );
  };
  examinActionPopup = action => {
    return (
      <ExaminActionPopup
        action={action}
        cssmanager={this.props.cssmanager}
        examinActionCloseHandler={this.examinActionCloseHandler}
      />
    );
  };
  uploadPgn() {
    this.setState({ notification: true });
  }

  startGameExamine() {
    this.setState({ examineGame: true, newOppenetRequest: false });
  }
  examineActionHandler(action) {
    if (action === "newoppent" || action === "play") {
      this.setState({ exnotification: false, examinAction: "action", newOppenetRequest: true });
    } else if (action === "examine") {
      this.startGameExamine();
    } else this.setState({ exnotification: false, examinAction: action });
  }
  resignNotificationCloseHandler() {
    this.setState({ notification: !this.state.notification });
  }
  /*
  notificationHandler() {
    this.setState({ notification: !this.state.notification });
  }*/
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
    let translator = i18n.createTranslator("Common.MainPage", this.getLang());
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    const GameRequest = this.props.gameRequest;
    let exPopup = null;
    let actionPopup = null;
    let informativePopup = null;
    let status = "others";
    let position = { top: "w" };
    if (!!game) {
      if (game.black.id === this.props.userId) {
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
      GameRequest.receiver_id === this.props.userId
    ) {
      let msg = translator("gamerequest");
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
                actionPopup = this.actionPopup(translator(moveCount), "takeBack");
              }
              break;
            case "draw_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].draw !== "0")
              ) {
                actionPopup = this.actionPopup(translator("draw"), "draw");
              }
              break;
            case "abort_requested":
              if (
                issuer !== this.userId &&
                (!!game.pending && game.pending[othercolor].abort !== "0")
              ) {
                actionPopup = this.actionPopup(translator("abort"), "abort");
              }
              break;
            default:
              break;
          }
        }
      }
    } else {
      status = "idlemode";
      // this.intializeBoard();
    }
    if (!!this.props.GameHistory) {
      informativePopup = this.loadGameHistroyPopup(this.props.GameHistory);
    }
    if (!!this.props.clientMessage) {
      informativePopup = this.GamenotificationPopup(
        this.props.clientMessage.message,
        this.props.clientMessage._id
      );
    }
    if (!!this.state.notification) {
      informativePopup = this.GameResignedPopup("File upload succeshfully", "mid");
    }
    let w = this.state.width;
    let h = this.state.height;

    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;

    return (
      <AppWrapper cssManager={this.props.cssmanager}>
        <Col span={14}>
          <BoardWrapper>
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
              //  fen={this.props.fen}

              width={this.state.width}
              height={this.state.height}
              gameStatus={status}
              game={game}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          {/* <ExamineRightSidebar
            gameId={this.props.gameId}
            cssmanager={this.props.cssmanager}
            RightSidebarData={this.Main.RightSection}
            currentGame={this.state.examineGame}
            flip={this._flipboard}
            gameRequest={this.props.gameRequest}
            ref="right_sidebar"
            startGameExamine={this.startGameExamine}
            examineAction={this.examineActionHandler}
            activeTabnumber={this.state.activeTab}
            uploadPgn={this.uploadPgn}
          /> */}
          <PlayRightSidebar
            gameId={this.props.gameId}
            user={this.props.user}
            usersToPlayWith={this.props.usersToPlayWith}
            onChooseFriend={this.props.onChooseFriend}
            cssManager={this.props.cssManager}
            flip={this._flipboard}
            RightSidebarData={this.Main.RightSection}
          />
          {/* <RightSidebar
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
            activeTabnumber={this.state.activeTab}
            uploadPgn={this.uploadPgn}
          /> */}
        </Col>
      </AppWrapper>
    );
  }
}

ExaminePage.propTypes = {
  username: PropTypes.string
};
