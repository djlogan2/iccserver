import React, { Component } from "react";

export default class GameSheetDownloadComponent extends Component {
  render() {
    return (
      <button style={this.props.cssmanager.buttonStyle()}>
        <img
          src={this.props.cssmanager.buttonBackgroundImage("gameDownload")}
          alt="Game Download"
        />
      </button>
    );
  }
}
