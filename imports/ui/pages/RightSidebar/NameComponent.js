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
      <div style={this.props. cssManager.gameTopHeader()}>
        {/* <button style={this.props. cssManager.buttonStyle()}>
          <img
            src={this.props. cssManager.buttonBackgroundImage("circleCompass")}
            alt="Circle Compass"
          />
        </button> */}
        {/* <span>1/2 - 1/2 US-ch Open 2019</span> */}
        <div style={this.props. cssManager.pullRight()}>
          {/*
					 Game Share Component
					 Player can share the game to invite new players.
					*/}

          <GameShareComponent  cssManager={this.props. cssManager} />
          {/*
					 Game sheet download document Component
					 Player can download PGN and FEN string for further uses . */}

          <GameSheetDownloadComponent  cssManager={this.props. cssManager} game={this.props.game} />

          {/*
				    Game Analysis Component
					Player can analysis there game. */}

          <GameAnalysisComponent  cssManager={this.props. cssManager} />
        </div>
      </div>
    );
  }
}
