import React, { Component } from "react";
import Name from "./NameComponent";
import MoveList from "./MoveListComponent";
import Action from "./ActionComponent";
import "./Tabs/styles";
export default class GameComponent extends Component {
  render() {
    return (
      <div>
        <Name CssManager={this.props.CssManager} />
        <MoveList
          CssManager={this.props.CssManager}
          Moves={this.props.MoveHistory}
        />
        <Action CssManager={this.props.CssManager} />
      </div>
    );
  }
}
