import React, { Component } from "react";
import PropTypes from "prop-types";
import AppWrapper from "./AppWrapper/AppWrapper";
import PlayRightSidebar from "./RightSidebar/PlayRightSidebar";
import "../../../../imports/css/ChessBoard";
import "../../../../imports/css/leftsidebar";
import "../../../../imports/css/RightSidebar";

import { Col } from "antd";

import { links, tournament } from "../hardcode.json";
import MiddleBoard from "../MiddleSection/MiddleBoard";
import BoardWrapper from "./BoardWrapper";

export default class PlayPage extends Component {
  constructor(props) {
    super(props);

    this.gameId = null;

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
      toggleModal: this.toggleModal,
      switchSides: Date.now(),
    };

    this.middleBoard = React.createRef();

    this.Main = {
      LeftSection: {
        MenuLinks: links,
      },
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
  }

  toggleModal = (modalShow) => {
    this.setState({ modalShow });
  };

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
      onRemoveCircle,
      usersToPlayWith,
      sentRequests,
      onChooseFriend,
      onBotPlay,
      onSeekPlay,
    } = this.props;
    const { width, height, switchSides } = this.state;

    const gameTurn = board.turn();
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

      status = game.status;
      this.gameId = game._id;

      Object.assign(this.Main.MiddleSection, { black: game.black }, { white: game.white });
      if (status === "examining") {
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
    } else {
      Object.assign(position, { top: this.top });
      status = "idlemode";
    }

    return (
      <AppWrapper cssManager={cssManager}>
        <Col span={14}>
          <BoardWrapper>
            <MiddleBoard
              cssManager={cssManager}
              MiddleBoardData={this.Main.MiddleSection}
              switchSides={switchSides}
              capture={capture}
              board={board}
              onDrop={onDrop}
              onDrawObject={onDrawObject}
              onRemoveCircle={onRemoveCircle}
              top={position.top}
              width={width}
              height={height}
              gameStatus={status}
              game={game}
            />
          </BoardWrapper>
        </Col>
        <Col span={10}>
          <PlayRightSidebar
            game={game}
            usersToPlayWith={usersToPlayWith}
            sentRequests={sentRequests}
            onChooseFriend={onChooseFriend}
            onBotPlay={onBotPlay}
            onSeekPlay={onSeekPlay}
            cssManager={cssManager}
            flip={this._flipboard}
            RightSidebarData={this.Main.RightSection}
          />
        </Col>
      </AppWrapper>
    );
  }
}

PlayPage.propTypes = {
  username: PropTypes.string,
};
