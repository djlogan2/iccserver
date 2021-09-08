import React, { Component } from "react";
import MoveList from "../MoveList/MoveList";

export default class GameHistory extends Component {
  render() {
    const { cssManager, game, gameRequest, moveToCMI } = this.props;

    return (
      <div style={{ flex: 1, overflow: "auto" }}>
        <MoveList
          cssManager={cssManager}
          game={game}
          gameRequest={gameRequest}
          moveToCMI={moveToCMI}
        />
      </div>
    );
  }
}
