import React, { Component } from "react";

export default class GameAnalysisComponent extends Component {
  render() {
    return (
      <button style={this.props. cssManager.buttonStyle()}>
        <img
          src={this.props. cssManager.buttonBackgroundImage("gameAnalysis")}
          alt="Game Analysis"
        />
      </button>
    );
  }
}
