import React, { Component } from "react";

export default class GameSheetDownloadComponent extends Component {
  render() {
    let id;
    if (!!this.props.game) id = this.props.game._id;
    return (
      <button style={this.props.cssmanager.buttonStyle()}>
        <a href={"export/pgn/game/" + id}>
          <img
            src={this.props.cssmanager.buttonBackgroundImage("gameDownload")}
            alt="Game Download"
          />
        </a>
      </button>
    );
  }
}
