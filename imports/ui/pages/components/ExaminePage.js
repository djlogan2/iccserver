import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import AppWrapper from "./AppWrapper";
import ExamineRightSidebar from "./RightSidebar/ExamineRightSidebar";
import "./../css/ChessBoard";
import "./../css/leftsidebar";
import "./../css/RightSidebar";

import { Col } from "antd";

import { links, tournament } from "../hardcode.json";
import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";
import {
  EnhancedGameRequestPopup,
  GameResignedPopup,
  ExaminActionPopup,
  ActionPopup,
  EnhancedGameNotificationPopup
} from "./Popup/Popup";

export default class ExaminePage extends Component {
  constructor(props) {
    super(props);
    this.toggleModal = data => {
      this.setState({
        modalShow: data
      });
    };
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
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

    this.examineActionHandler = this.examineActionHandler.bind(this);
    this.startGameExamine = this.startGameExamine.bind(this);
    this.examinActionCloseHandler = this.examinActionCloseHandler.bind(this);
    this.resignNotificationCloseHandler = this.resignNotificationCloseHandler.bind(this);
    this.uploadPgn = this.uploadPgn.bind(this);

    this.delayedUpdateDimensions = _.debounce(this.updateDimensions, 100);
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
    window.addEventListener("resize", this.delayedUpdateDimensions);
  }

  /**
   * Remove event listener
   */
  componentWillUnmount() {
    window.removeEventListener("resize", this.delayedUpdateDimensions);
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

    return <EnhancedGameRequestPopup requestId={requestId} title={title} cssManager={cssManager} />;
  };

  actionPopup = (title, action) => {
    return (
      <ActionPopup
        gameID={this.game._id}
        title={title}
        action={action}
        cssManager={this.props.cssManager}
      />
    );
  };

  GamenotificationPopup = (title, mid) => {
    return (
      <EnhancedGameNotificationPopup mid={mid} title={title} cssManager={this.props.cssManager} />
    );
  };

  GameResignedPopup = (title, mid) => {
    return (
      <GameResignedPopup
        mid={mid}
        title={title}
        cssManager={this.props.cssManager}
        resignNotificationCloseHandler={this.resignNotificationCloseHandler}
      />
    );
  };

  examinActionPopup = action => {
    return (
      <ExaminActionPopup
        action={action}
        cssManager={this.props.cssManager}
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
    this.refs.middleBoard.switchSides();
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
    let gameTurn = this.props.board.turn();
    const game = this.props.game;
    let status;
    let position = { top: "w" };
    if (!!game) {
      if (!!game.black && game.black.id === Meteor.userId()) {
        this.top = "w";
        Object.assign(position, { top: "w" });
      } else {
        this.top = "b";
        Object.assign(position, { top: "b" });
      }
    } else {
      Object.assign(position, { top: this.top });
    }
    if ((!!game && game.status === "playing") || (!!game && game.status === "examining")) {
      status = game.status;

      Object.assign(this.Main.MiddleSection, { black: game.black }, { white: game.white });
      if (status !== "examining") {
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
    }

    return (
      <AppWrapper cssManager={this.props.cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={this.props.cssManager}
              MiddleBoardData={this.Main.MiddleSection}
              ref="middleBoard"
              capture={this.props.capture}
              board={this.props.board}
              onDrop={this.props.onDrop}
              onDrawObject={this.props.onDrawObject}
              top={position.top}
              width={this.state.width}
              height={this.state.height}
              gameStatus={Meteor.user().status.game} // DJL REMOVE
              game={game}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <ExamineRightSidebar
            game={game}
            allUsers={this.props.allUsers}
            observeUser={this.props.observeUser}
            unObserveUser={this.props.unObserveUser}
            cssManager={this.props.cssManager}
            RightSidebarData={this.Main.RightSection}
            flip={this._flipboard}
            gameRequest={this.props.gameRequest}
            ref="right_sidebar"
            startGameExamine={this.startGameExamine}
            onPgnUpload={this.props.onPgnUpload}
            examineAction={this.examineActionHandler}
            activeTabnumber={this.state.activeTab}
            uploadPgn={this.uploadPgn}
            history={this.props.history}
          />
        </Col>
      </AppWrapper>
    );
  }
}

ExaminePage.propTypes = {
  username: PropTypes.string
};
