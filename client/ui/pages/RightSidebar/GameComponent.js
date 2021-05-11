import React, { Component } from "react";
import Name from "./Name";
import MoveList from "./MoveListComponent";
import "./Tabs/styles";

export default class GameComponent extends Component {
  render() {
    const { cssManager, game, flip, gameRequest, startGameExamine, examineAction } = this.props;

    return (
      <div>
        <Name cssManager={cssManager} game={game} />
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
