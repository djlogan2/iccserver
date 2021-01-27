import React, { Component } from "react";
import GameRequestMatch from "./GameRequestMatch";
import gameRequestSeek from "./GameRequestSeek";
import { translate } from "../../../../HOCs/translate";

class GameRequestModal extends Component {
  render() {
    const { gameRequest, translate } = this.props;

    switch (gameRequest.type) {
      case "seek":
        gameRequestSeek({ gameRequest, translate });
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
