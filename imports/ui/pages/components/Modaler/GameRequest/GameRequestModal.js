import React, { Component } from "react";
import { notification, Button } from "antd";
import { get } from "lodash";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { Meteor } from "meteor/meteor";

import { translate } from "../../../../HOCs/translate";
import gameRequestNotification from "./GameRequestNotification";
import { RESOURCE_PLAY } from "../../../../../constants/resourceConstants";
import injectSheet from "react-jss";
import { dynamicRequestNotificationsStyles } from "./dynamicRequestNotificationStyles";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../api/client/collections";
import { Logger } from "../../../../../../lib/client/Logger";

const log = new Logger("server/i18n_js");

class GameRequestModal extends Component {
  handleCancelSeek = () => {
    const { gameRequest } = this.props;

    Meteor.call("removeGameSeek", "remove_game_seek", gameRequest._id, (err) => {
      if (err) {
        log.error(err.reason);
      } else {
        notification.close(gameRequest._id);
      }
    });
  };

  generateMessage = () => {
    const { translate, classes } = this.props;

    return (
      <div className={classes.seekSearchDiv}>
        <div className={classes.gameSeekSearchingDiv}>{translate("gameSeekSearching")}</div>
        <Button onClick={this.handleCancelSeek} className={classes.cancelSeekButton}>
          {translate("cancel")}
        </Button>
      </div>
    );
  };

  componentDidUpdate(prevProps) {
    const { gameRequest } = this.props;

    if (prevProps.gameRequest && prevProps.gameRequest._id !== get(gameRequest, "_id")) {
      notification.close(prevProps.gameRequest._id);
    }
  }

  componentWillUnmount() {
    const { gameRequest } = this.props;

    this.handleCancelSeek();
    notification.close(gameRequest._id);
  }

  generateSearchingGameNotification = () => {
    const { gameRequest } = this.props;

    notification.open({
      key: gameRequest._id,
      message: this.generateMessage(),
      description: null,
      duration: 0,
      style: {
        height: "6.4rem",
      },
      closeIcon: () => null,
    });
  };

  handleAcceptGame = () => {
    const { history, gameRequest } = this.props;

    Meteor.call("gameRequestAccept", "gameAccept", gameRequest._id, () => {
      history.push(RESOURCE_PLAY);
    });
  };

  handleDeclineGame = () => {
    const { gameRequest } = this.props;

    Meteor.call("gameRequestDecline", "gameDecline", gameRequest._id);
  };

  render() {
    const { gameRequest, translate, classes } = this.props;

    switch (gameRequest.type) {
      case "seek":
        if (gameRequest.owner === Meteor.userId()) {
          this.generateSearchingGameNotification();
        }
        return null;
      case "match":
        gameRequestNotification(
          gameRequest,
          translate,
          classes,
          this.handleAcceptGame,
          this.handleDeclineGame
        );
        return null;
      default:
        console.error("Missmatch at game request");
        return null;
    }
  }
}

export default compose(
  translate("Play.PlaySeek"),
  withRouter,
  withTracker(() => {
    return {
      challengeNotificationCss: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicRequestNotificationsStyles)
)(GameRequestModal);
