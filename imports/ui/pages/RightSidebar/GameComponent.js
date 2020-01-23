import React, { Component } from "react";
import Name from "./NameComponent";
import MoveList from "./MoveListComponent";
import Action from "./ActionComponent";
import "./Tabs/styles";
export default class GameComponent extends Component {
  render() {
    return (
      <div>
        <Name cssmanager={this.props.cssmanager} />
        <MoveList
          cssmanager={this.props.cssmanager}
          game={this.props.game}
          flip={this.props.flip}
        />
        <Action
          cssmanager={this.props.cssmanager}
          game={this.props.game}
          gameRequest={this.props.gameRequest}
          startGameExamine={this.props.startGameExamine}
          examineAction={this.props.examineAction}
        />
      </div>
    );
  }
}
