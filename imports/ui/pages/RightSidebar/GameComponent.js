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
          performAction={this.props.performAction}
          actionData={this.props.actionData}
        />
      </div>
    );
  }
}
