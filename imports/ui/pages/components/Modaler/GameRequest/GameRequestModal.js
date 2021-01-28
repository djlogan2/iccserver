import React, { Component } from "react";
import { notification, Button } from "antd";

import GameRequestMatch from "./GameRequestMatch";
import { translate } from "../../../../HOCs/translate";

class GameRequestModal extends Component {
  generateMessage = () => {
    const { translate } = this.props;

    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ marginTop: "0.5rem" }}>{translate("gameSeekSearching")}</div>
        <Button style={{ backgroundColor: "#1565C0", color: "#ffffff" }}>
          {translate("cancel")}
        </Button>
      </div>
    );
  };

  generateSearchingGameNotification = () => {
    const { gameRequest } = this.props;

    notification.open({
      key: gameRequest._id,
      message: this.generateMessage(),
      description: null,
      duration: 0,
      style: {
        height: "6.4rem"
      },
      closeIcon: () => null
    });
  };

  render() {
    const { gameRequest } = this.props;

    switch (gameRequest.type) {
      case "seek":
        if (gameRequest.owner === Meteor.userId()) {
          this.generateSearchingGameNotification();
        }
        // gameRequestSeek({ gameRequest, translate });
        return null;
      case "match":
        return <GameRequestMatch gameRequest={gameRequest} />;
      default:
        console.error("Missmatch at game request");
        return null;
    }
  }
}

export default translate("Play.PlaySeek")(GameRequestModal);
