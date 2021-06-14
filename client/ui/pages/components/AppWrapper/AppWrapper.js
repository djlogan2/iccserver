import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { notification, Row } from "antd";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { GameRequestCollection, mongoCss } from "../../../../../imports/api/client/collections";

import LeftSidebar from "../LeftSidebar/LeftSidebar";

import { RESOURCE_LOGIN, RESOURCE_PLAY } from "../../../../constants/resourceConstants";
import GameRequestModal from "../Modaler/GameRequest/GameRequestModal";
import { get } from "lodash";
import { gameStatusPlaying } from "../../../../constants/gameConstants";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import classNames from "classnames";

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

    if (!Meteor.userId() && !Meteor.isAppTest) {
      const { history } = this.props;

      history.push(RESOURCE_LOGIN);
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
  injectSheet(dynamicStyles)
)(AppWrapper);
