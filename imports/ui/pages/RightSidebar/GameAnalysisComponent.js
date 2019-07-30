import React, { Component } from "react";

export default class GameAnalysisComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.gameAnalysisIcon()}>
        <img src="images/live-analisys-icon.png" alt="" />
      </button>
    );
  }
}
