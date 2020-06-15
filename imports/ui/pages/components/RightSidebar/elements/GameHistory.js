import React, { Component } from "react";
import MoveList from "./MoveList";

export default class GameHistory extends Component {
  render() {
    return (
      <div className="game-history">
        <MoveList
          cssmanager={this.props.cssmanager}
          game={this.props.game}
          flip={this.props.flip}
          currentGame={this.props.currentGame}
          gameRequest={this.props.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
