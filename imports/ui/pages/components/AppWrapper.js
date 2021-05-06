import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notification, Row } from "antd";
import { withRouter } from "react-router-dom";
import { GameRequestCollection } from "../../../api/client/collections";

import LeftSidebar from "./LeftSidebar/LeftSidebar";

//import "react-chessground/dist/styles/chessground.css";

import "./../css/developmentboard.css";
import "./../css/Spare.css";
import "./../css/Editor.css";
import "./../css/AppWrapper.css";
import "./../css/GameHistory.css";
import "./../css/Examine.css";
import "./../css/ExamineSidebarTop.css";
import "./../css/ChatApp.css";
import "./../css/FenPgn.css";
import "./../css/Loading.css";

import "./../css/ExamineRightSidebar.css";
import "./../css/ExamineObserveTab.css";

import "./../css/PlayFriend.css";
import "./../css/PlayRightSidebar.css";
import "./../css/GameControlBlock.css";

import "./../css/Community.css";
import "./../css/Messenger.css";
import { RESOURCE_LOGIN, RESOURCE_PLAY } from "../../../constants/resourceConstants";
import GameRequestModal from "./Modaler/GameRequest/GameRequestModal";
import { get } from "lodash";
import { gameStatusPlaying } from "../../../constants/gameConstants";
import { isReadySubscriptions } from "../../../utils/utils";

class AppWrapper extends Component {
  componentDidMount() {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { gameRequest, history } = this.props;

    const prevSeekId = get(prevProps, "gameRequest._id");
    const currentSeek = get(gameRequest, "_id");

    if (prevSeekId && prevSeekId !== currentSeek) {
      notification.close(prevSeekId);
    }

    const currentUser = Meteor.user();

    const isPlaying = get(currentUser, "status.game") === gameStatusPlaying;
    const pathName = get(history, "location.pathname");

    if (isPlaying && pathName !== RESOURCE_PLAY) {
      history.push(RESOURCE_PLAY);
    }

    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }

    // const clientStatus = get(currentUser, "status.client");

    // if (clientStatus && clientStatus !== pathName.substring(1)) {
    //   history.push(`/${clientStatus}`);
    // }
  }

  render() {
    const { className, children, gameRequest } = this.props;

    return (
      <div className="app-wrapper">
        {gameRequest && <GameRequestModal gameRequest={gameRequest} />}
        <LeftSidebar />
        <Row className={`app-wrapper__row ${className}`}>{children}</Row>
      </div>
    );
  }
}

export default withTracker(() => {
  const subscriptions = {};

  return {
    isReady: isReadySubscriptions(subscriptions),
    gameRequest: GameRequestCollection.findOne(
      {
        $or: [
          {
            receiver_id: Meteor.userId(),
          },
          { type: "seek", owner: Meteor.userId() },
        ],
      },
      {
        sort: { create_date: -1 },
      }
    ),
  };
})(withRouter(AppWrapper));
