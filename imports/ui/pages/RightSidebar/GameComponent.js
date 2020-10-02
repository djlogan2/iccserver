import React, { Component } from "react";
import Name from "./NameComponent";
import MoveList from "./MoveListComponent";
import "./Tabs/styles";
export default class GameComponent extends Component {
  render() {
    return (
      <div>
        <Name cssManager={this.props. cssManager} game={this.props.game} />
        <MoveList
           cssManager={this.props. cssManager}
          game={this.props.game}
          flip={this.props.flip}
          gameRequest={this.props.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
