import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import AppWrapper from "./AppWrapper/AppWrapper";
import ExamineRightSidebar from "./RightSidebar/ExamineRightSidebar";
import "../../../../imports/css/ChessBoard";
import "../../../../imports/css/leftsidebar";
import "../../../../imports/css/RightSidebar";

import { Col } from "antd";

import { tournament } from "../hardcode.json";
import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";
import { GameRequestPopup, GameResignedPopup } from "./Popup";

export default class ExaminePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      exnotification: false,
      notification: false,
      newOppenetRequest: false,
      examinAction: "action",
      activeTab: 0,
      switchSides: Date.now(),
    };

    this.Main = {
      MiddleSection: {
        white: {
          name: "Player-1",
          rating: 1600,
          userPicture: "player-img-top.png",
        },
        black: {
          name: "Player-2",
          rating: 1600,
          userPicture: "player-img-bottom.png",
        },
        clocks: {
          white: {
            isactive: false,
            current: 300000,
          },
          black: {
            isactive: false,
            current: 300000,
          },
        },
      },
      RightSection: {
        TournamentList: {
          Tournaments: tournament,
        },
        MoveList: {},
        status: "other",
        Action: {},
      },
    };

    this.delayedUpdateDimensions = _.debounce(this.updateDimensions, 100);
  }

  componentWillReceiveProps(nextProps) {
    const { len, game } = this.props;
    const { exnotification, newOppenetRequest, examineGame } = this.state;

    if (!!len && !!nextProps.len) {
      if (nextProps.len !== len)
        if (game.status === "examining" && (exnotification || newOppenetRequest)) {
          this.setState({ exnotification: false, newOppenetRequest: false });
        }
      if (game.status === "playing" && (newOppenetRequest || examineGame)) {
        this.setState({ newOppenetRequest: false, examineGame: false });
      }
    }
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.delayedUpdateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.delayedUpdateDimensions);
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  intializeBoard = () => {
    Object.assign(this.Main.MiddleSection, {
      tomove: "white",
      white: {
        name: "Player-1",
        rating: 1600,
        userPicture: "player-img-top.png",
      },
      black: {
        name: "Player-2",
        rating: 1600,
        userPicture: "player-img-bottom.png",
      },
      clocks: {
        white: {
          isactive: false,
          current: 480000,
        },
        black: {
          isactive: false,
          current: 480000,
        },
      },
    });
  };

  gameRequest = (title, requestId) => {
    const { cssManager } = this.props;

    return <GameRequestPopup requestId={requestId} title={title} cssManager={cssManager} />;
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

  uploadPgn = () => {
    this.setState({ notification: true });
  };

  startGameExamine = () => {
    this.setState({ examineGame: true, newOppenetRequest: false });
  };

  examineActionHandler = (action) => {
    if (action === "newoppent" || action === "play") {
      this.setState({ exnotification: false, examinAction: "action", newOppenetRequest: true });
    } else if (action === "examine") {
      this.startGameExamine();
    } else this.setState({ exnotification: false, examinAction: action });
  };

  resignNotificationCloseHandler = () => {
    this.setState((prevState) => {
      return { notification: !prevState.notification };
    });
  };

  examinActionCloseHandler = () => {
    this.setState({ exnotification: true });
  };

  _flipboard = () => {
    this.setState({ switchSides: Date.now() });
  };

  render() {
    const {
      board,
      game,
      cssManager,
      capture,
      onDrop,
      onDrawObject,
      allUsers,
      observeUser,
      unObserveUser,
      gameRequest,
      onPgnUpload,
      onImportedGames,
    } = this.props;
    const { width, height, activeTab, switchSides } = this.state;

    const gameTurn = board.turn();

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

      if (game.status === "playing" || game.status === "examining") {
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
    } else {
      Object.assign(position, { top: this.top });
    }

    return (
      <AppWrapper cssManager={cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={cssManager}
              capture={capture}
              board={board}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              width={width}
              height={height}
              game={game}
              switchSides={switchSides}
              top={position.top}
              gameStatus={Meteor.user().status.game} // DJL REMOVE
              MiddleBoardData={this.Main.MiddleSection}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <ExamineRightSidebar
            game={game}
            allUsers={allUsers}
            observeUser={observeUser}
            unObserveUser={unObserveUser}
            cssManager={cssManager}
            activeTabnumber={activeTab}
            onPgnUpload={onPgnUpload}
            gameRequest={gameRequest}
            onImportedGames={onImportedGames}
            RightSidebarData={this.Main.RightSection}
            flip={this._flipboard}
            startGameExamine={this.startGameExamine}
            examineAction={this.examineActionHandler}
            uploadPgn={this.uploadPgn}
            ref="right_sidebar"
          />
        </Col>
      </AppWrapper>
    );
  }
}

ExaminePage.propTypes = {
  username: PropTypes.string,
};
