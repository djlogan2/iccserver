import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

export default class GameAnalysisComponent extends Component {
  render() {
    return (
      <button style={CssManager.buttonStyle()}>
        <img
          src={CssManager.buttonBackgroundImage("gameAnalysis")}
          alt="Game Analysis"
        />
      </button>
    );
  }
}
