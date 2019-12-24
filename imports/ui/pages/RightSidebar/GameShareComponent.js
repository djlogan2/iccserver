import React, { Component } from "react";

export default class GameShareComponent extends Component {
  render() {
    return (
      <button style={this.props.cssmanager.buttonStyle()}>
        <img src={this.props.cssmanager.buttonBackgroundImage("gameShare")} alt="Game Share" />
      </button>
    );
  }
}
