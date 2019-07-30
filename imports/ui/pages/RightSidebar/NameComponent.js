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
      <div className="game-top-header">
        <img src="images/circle-compass-icon.png" alt="" />
        <span>1/2 - 1/2 US-ch Open 2019</span>
        <div className="pull-right">
          {/* 
					 Game Share Component
					 Player can share the game to invite new players. 
					*/}

          <GameShareComponent CssManager={this.props.CssManager} />
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
