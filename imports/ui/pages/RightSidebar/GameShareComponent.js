import React, { Component } from "react";

export default class GameShareComponent extends Component {
  render() {
    return (
      <button style={this.props.cssManager.buttonStyle()}>
        <img src={this.props.cssManager.buttonBackgroundImage("gameShare")} alt="Game Share" />
      </button>
    );
  }
}
