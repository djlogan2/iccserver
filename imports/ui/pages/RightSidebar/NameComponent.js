import React, { Component } from "react";
import GameShareComponent from "./GameShareComponent";
import GameSheetDownloadComponent from "./GameSheetDownloadComponent";
import GameAnalysisComponent from "./GameAnalysisComponent";
import CssManager from "../../pages/components/Css/CssManager";

export default class NameComponent extends Component {
  /*
        This Component display tournaments Name using Props 
        it load When game Load or create Game By player   
		OR
		This shows the Name of the game and Name of the players.
    */

  render() {
    return (
      <div style={CssManager.gameTopHeader()}>
        <button style={CssManager.buttonStyle()}>
          <img
            src={CssManager.buttonBackgroundImage("circleCompass")}
            alt="Circle Compass"
          />
        </button>
        <span>1/2 - 1/2 US-ch Open 2019</span>
        <div style={CssManager.pullRight()}>
          {/* 
					 Game Share Component
					 Player can share the game to invite new players. 
					*/}

          <GameShareComponent />
          {/* 
					 Game sheet download document Component
					 Player can download PGN and FEN string for further uses . */}

          <GameSheetDownloadComponent />

          {/* 
				    Game Analysis Component
					Player can analysis there game. */}

          <GameAnalysisComponent />
        </div>
      </div>
    );
  }
}
