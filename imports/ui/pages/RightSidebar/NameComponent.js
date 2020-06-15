import React, { Component } from "react";
import GameShareComponent from "./GameShareComponent";
import GameSheetDownloadComponent from "./GameSheetDownloadComponent";
import GameAnalysisComponent from "./GameAnalysisComponent";

export default class NameComponent extends Component {
  /*
        This Component display tournaments Name using Props
        it load When game Load or create Game By player
		OR
		This shows the Name of the game and Name of the players.
    */

  render() {
    return (
      <div style={this.props.cssmanager.gameTopHeader()}>
        {/* <button style={this.props.cssmanager.buttonStyle()}>
          <img
            src={this.props.cssmanager.buttonBackgroundImage("circleCompass")}
            alt="Circle Compass"
          />
        </button> */}
        {/* <span>1/2 - 1/2 US-ch Open 2019</span> */}
        <div style={this.props.cssmanager.pullRight()}>
          {/*
					 Game Share Component
					 Player can share the game to invite new players.
					*/}

          <GameShareComponent cssmanager={this.props.cssmanager} />
          {/*
					 Game sheet download document Component
					 Player can download PGN and FEN string for further uses . */}

          <GameSheetDownloadComponent cssmanager={this.props.cssmanager} game={this.props.game} />

          {/*
				    Game Analysis Component
					Player can analysis there game. */}

          <GameAnalysisComponent cssmanager={this.props.cssmanager} />
        </div>
      </div>
    );
  }
}
