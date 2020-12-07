import React, { Component } from "react";

export default class GameSheetDownloadComponent extends Component {
  render() {
    let id;
    let game = this.props.game;
    if (!!game) id = game._id;

    return (
      <button style={this.props.cssManager.buttonStyle()}>
        <a href={"export/pgn/game/" + id}>
          <img
            src={this.props.cssManager.buttonBackgroundImage("gameDownload")}
            alt="Game Download"
          />
        </a>
      </button>
    );
  }
}
