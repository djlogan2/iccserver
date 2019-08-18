import React, { Component } from "react";

export default class GameAnalysisComponent extends Component {
  render() {
    return (
      <button style={this.props.cssmanager.buttonStyle()}>
        <img
          src={this.props.cssmanager.buttonBackgroundImage("gameAnalysis")}
          alt="Game Analysis"
        />
      </button>
    );
  }
}
