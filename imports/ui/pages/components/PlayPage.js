import React, { Component } from "react";
import PropTypes from "prop-types";
import AppWrapper from "./AppWrapper";
import PlayRightSidebar from "./RightSidebar/PlayRightSidebar";
import "./../css/ChessBoard";
import "./../css/leftsidebar";
import "./../css/RightSidebar";

import { Col } from "antd";

import { links, tournament } from "../hardcode.json";
import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";
import { Logger } from "../../../../lib/client/Logger";
const log = new Logger("client/PlayPage");

export default class PlayPage extends Component {
  constructor(props) {
    super(props);
    log.trace("PlayPage constructor", props);
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
    this.examineActionHandler = this.examineActionHandler.bind(this);
    this.startGameExamine = this.startGameExamine.bind(this);
    this.examinActionCloseHandler = this.examinActionCloseHandler.bind(this);
    this.resignNotificationCloseHandler = this.resignNotificationCloseHandler.bind(this);
  }

  /**
   * Add event listener
   */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  /**
   * Remove event listener
   */
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
    log.trace("PlayPage render", this.props);
    let gameTurn = this.props.board.turn();
    let status;
    let position = { top: "w" };
    if (!!this.props.game) {
      if (this.props.game.black.id === this.props.userId) {
        this.top = "w";
        Object.assign(position, { top: "w" });
      } else {
        this.top = "b";
        Object.assign(position, { top: "b" });
      }
    } else {
      Object.assign(position, { top: this.top });
    }

    if (!!this.props.game) {
      status = this.props.game.status;
      this.gameId = this.props.game._id;

      Object.assign(
        this.Main.MiddleSection,
        { black: this.props.game.black },
        { white: this.props.game.white }
      );
      if (status === "examining") {
      } else {
        Object.assign(this.Main.MiddleSection, { clocks: this.props.game.clocks });
        if (gameTurn === "w") {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: true });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: false });
        } else {
          Object.assign(this.Main.MiddleSection.clocks.white, { isactive: false });
          Object.assign(this.Main.MiddleSection.clocks.black, { isactive: true });
        }
      }
      this.Main.RightSection.MoveList = this.props.game;
    } else {
      status = "idlemode";
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
              onRemoveCircle={this.props.onRemoveCircle}
              top={position.top}
              circles={this.props.circles}
              width={this.state.width}
              height={this.state.height}
              gameStatus={status}
              game={this.props.game}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <PlayRightSidebar
            game={this.props.game}
            usersToPlayWith={this.props.usersToPlayWith}
            onChooseFriend={this.props.onChooseFriend}
            onBotPlay={this.props.onBotPlay}
            cssManager={this.props.cssManager}
            flip={this._flipboard}
            RightSidebarData={this.Main.RightSection}
          />
        </Col>
      </AppWrapper>
    );
  }
}

PlayPage.propTypes = {
  username: PropTypes.string
};
