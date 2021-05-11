import React, { Component } from "react";
import MoveList from "./MoveList";

export default class GameHistory extends Component {
  render() {
    const { cssManager, game, flip, gameRequest, startGameExamine, examineAction } = this.props;

    return (
      <div style={{ flexGrow: "1" }}>
        <MoveList
          cssManager={cssManager}
          game={game}
          flip={flip}
          gameRequest={gameRequest}
          startGameExamine={startGameExamine}
          examineAction={examineAction}
        />
      </div>
    );
  }
}
