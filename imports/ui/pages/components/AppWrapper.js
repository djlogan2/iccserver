import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Modal, Row } from "antd";
import { withRouter } from "react-router-dom";
import { GameRequestCollection } from "../../../api/client/collections";

import LeftSidebar from "./LeftSidebar/LeftSidebar";

import "react-chessground/dist/styles/chessground.css";

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
import { translate } from "../../HOCs/translate";

class AppWrapper extends Component {
  componentDidMount() {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!Meteor.userId()) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
    }
  }

  render() {
    const { history, className, children, translate, gameRequest } = this.props;

    return (
      <div className={`app-wrapper`}>
        {gameRequest && (
          <Modal
            title={translate("gameRequestModal.gameRequest")}
            visible={!!gameRequest}
            onOk={() => {
              Meteor.call("gameRequestAccept", "gameAccept", gameRequest._id, () => {
                history.push(RESOURCE_PLAY);
              });
            }}
            onCancel={() => {
              Meteor.call("gameRequestDecline", "gameDecline", gameRequest._id);
            }}
          >
            <p>
              {translate("gameRequestModal.challangerWantsToPlay", {
                challenger: gameRequest.challenger
              })}
            </p>
          </Modal>
        )}
        <LeftSidebar />
        <Row className={`app-wrapper__row ${className}`}>{children}</Row>
      </div>
    );
  }
}

export default withTracker(() => {
  return {
    gameRequest: GameRequestCollection.findOne(
      {
        $or: [
          {
            receiver_id: Meteor.userId()
          },
          { type: "seek" }
        ]
      },
      {
        sort: { create_date: -1 }
      }
    )
  };
})(withRouter(translate("Common.appWrapper")(AppWrapper)));
