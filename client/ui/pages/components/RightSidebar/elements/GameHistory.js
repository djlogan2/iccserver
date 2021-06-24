import React, { Component } from "react";
import MoveList from "./MoveList";

export default class GameHistory extends Component {
  render() {
    const { cssManager, game, gameRequest, startGameExamine, examineAction } = this.props;

    return (
      <div style={{ flexGrow: "1" }}>
        <MoveList
          cssManager={cssManager}
          game={game}
          gameRequest={gameRequest}
          startGameExamine={startGameExamine}
          examineAction={examineAction}
        />
      </div>
    );
  }
}
