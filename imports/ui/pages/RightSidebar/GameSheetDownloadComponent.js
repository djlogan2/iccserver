import React, { Component } from "react";
export default class GameSheetDownloadComponent extends Component {
  render() {
    return (
      <button style={this.props.CssManager.buttonStyle()}>
        <img
          src={this.props.CssManager.buttonBackgroundImage("gameDownload")}
          alt="Game Download"
        />
      </button>
    );
  }
}
