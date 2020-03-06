import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class GameSheetDownloadComponent extends Component {
  render() {
    let id;
    let game = this.props.game;
    if (!!game) id = game._id;

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
