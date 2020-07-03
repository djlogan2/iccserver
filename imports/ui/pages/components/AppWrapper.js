import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Row, Modal } from "antd";
import { GameRequestCollection } from "./../../../api/collections";

import LeftSidebar from "./LeftSidebar/LeftSidebar";

// import "antd/dist/antd.css";
import "react-chessground/dist/assets/theme.css";

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

const AppWrapper = ({ className, children, cssManager, game_request }) => {
  Meteor.subscribe("game_requests");

  return (
    <div className={`app-wrapper`}>
      {game_request && (
        <Modal
          title="Game request"
          visible={game_request ? true : false}
          onOk={() => {
            Meteor.call("gameRequestAccept", "gameAccept", game_request._id, (err, data) => {
              debugger;
            });
          }}
          onCancel={() => {
            Meteor.call("gameRequestDecline", "gameDecline", game_request._id, (err, data) => {
              debugger;
            });
          }}
        >
          <p>{game_request.challenger} would like to play with you</p>
        </Modal>
      )}

      <LeftSidebar cssmanager={cssManager} />
      <Row className={`app-wrapper__row ${className}`}>{children}</Row>
    </div>
  );
};

export default withTracker(props => {
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
    )
  };
})(AppWrapper);
