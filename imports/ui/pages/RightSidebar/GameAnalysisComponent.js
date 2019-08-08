import React, { Component } from "react";

export default class GameAnalysisComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.buttonStyle()}>
        <img
          src={this.props.CssManager.buttonBackgroundImage("gameAnalysis")}
          alt="Game Analysis"
        />
      </button>
    );
  }
}
