import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notification, Row } from "antd";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { GameRequestCollection, mongoCss } from "../../../../../imports/api/client/collections";

import LeftSidebar from "../LeftSidebar/LeftSidebar";

import { RESOURCE_PLAY } from "../../../../constants/resourceConstants";
import GameRequestModal from "../Modaler/GameRequest/GameRequestModal";
import { get } from "lodash";
import { gameStatusPlaying } from "../../../../constants/gameConstants";
import classNames from "classnames";
import { withSounds } from "../../../HOCs/withSounds";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

class AppWrapper extends Component {
  componentDidMount() {
    if (Meteor.isTest || Meteor.isAppTest) return; //TODO: fix this!!!
  }

  componentDidUpdate(prevProps, prevState) {
    const { gameRequest, history, playSound } = this.props;
    if (Meteor.isTest || Meteor.isAppTest) return; //TODO: fix this!!!

    const prevSeekId = get(prevProps, "gameRequest._id");
    const currentSeek = get(gameRequest, "_id");

    if (prevSeekId && prevSeekId !== currentSeek) {
      notification.close(prevSeekId);
    }

    if (!prevProps.gameRequest && gameRequest) {
      playSound("sound");
    }

    const currentUser = Meteor.user();

    const isPlaying = get(currentUser, "status.game") === gameStatusPlaying;
    const pathName = get(history, "location.pathname");

    if (isPlaying && pathName !== RESOURCE_PLAY) {
      history.push(RESOURCE_PLAY);
    }
  }

  render() {
    const { className, children, gameRequest, classes } = this.props;

    return (
      <div className={classes.appWrapper}>
        {gameRequest && <GameRequestModal gameRequest={gameRequest} />}
        <LeftSidebar />
        <Row className={classNames(classes.appWrapperRow, className)}>{children}</Row>
      </div>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
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
  }),
  withRouter,
  withSounds("AppWrapper"),
  withDynamicStyles("css.appWrapperCss")
)(AppWrapper);
