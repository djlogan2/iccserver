import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

export default class GameShareComponent extends Component {
  render() {
    return (
      <button style={CssManager.buttonStyle()}>
        <img
          src={CssManager.buttonBackgroundImage("gameShare")}
          alt="Game Share"
        />
      </button>
    );
  }
}
