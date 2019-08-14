import React, { Component } from "react";
import CssManager from "../../pages/components/Css/CssManager";

export default class GameSheetDownloadComponent extends Component {
  render() {
    return (
      <button style={CssManager.buttonStyle()}>
        <img
          src={CssManager.buttonBackgroundImage("gameDownload")}
          alt="Game Download"
        />
      </button>
    );
  }
}
