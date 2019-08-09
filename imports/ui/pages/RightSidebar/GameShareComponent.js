import React, { Component } from "react";
export default class GameShareComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.buttonStyle()}>
        <img
          src={this.props.CssManager.buttonBackgroundImage("gameShare")}
          alt="Game Share"
        />
      </button>
    );
  }
}
