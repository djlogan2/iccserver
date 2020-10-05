import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Row, Modal } from "antd";
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
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/AppWrapper_js");

const AppWrapper = ({ className, user, history, children, cssManager, game_request }) => {
  log.trace("AppWrapper render", this.props);

  return (
    <div className={`app-wrapper`}>
      {game_request && (
        <Modal
          title="Game request"
          visible={!!game_request}
          onOk={() => {
            Meteor.call("gameRequestAccept", "gameAccept", game_request._id, () => {
              history.push("/play");
            });
          }}
          onCancel={() => {
            Meteor.call("gameRequestDecline", "gameDecline", game_request._id);
          }}
        >
          <p>{game_request.challenger} would like to play with you</p>
        </Modal>
      )}

      <LeftSidebar cssManager={cssManager} />
      <Row className={`app-wrapper__row ${className}`}>{children}</Row>
    </div>
  );
};

export default withTracker(props => {
  Meteor.subscribe("game_requests");
  return {
    game_request: GameRequestCollection.findOne(
      {
        $or: [
          // {
          //   challenger_id: Meteor.userId()
          // },
          {
            receiver_id: Meteor.userId()
          },
          { type: "seek" }
        ]
      },
      {
        sort: { create_date: -1 }
      }
    ),
    user: Meteor.users.findOne({ _id: Meteor.userId() })
  };
})(withRouter(AppWrapper));
