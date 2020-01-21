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
          Moves={this.props.MoveHistory}
          flip={this.props.flip}
        />
        <Action
          cssmanager={this.props.cssmanager}
          game={this.props.MoveHistory}
          actionData={this.props.actionData}
          gameRequest={this.props.gameRequest}
          history={this.props.history}
        />
      </div>
    );
  }
}
