import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import CreateGame from "./CreateGameComponent";
import TournamentsList from "./TournamentsListComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightBarTop");

export default class RightBarTop extends Component {
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    log.debug("legacyMessage=" + this.props.legacymessages);
    let translator = i18n.createTranslator(
      "Common.rightBarTop",
      this.getLang()
    );

    return (
      <Tabs cssmanager={this.props.cssmanager}>
        {/* 
		    GameHistory is the dynamic component and loads as Player
		  	starts the game.
		  	also these component with 
	    	*/}
        <div label={translator("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
            cssmanager={this.props.cssmanager}
            MoveHistory={this.props.RightBarTopData.MoveList.GameMove}
            flip={this.props.flip}
            performAction={this.props.performAction}
            actionData={this.props.actionData}
          />
        </div>

        <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame
            cssmanager={this.props.cssmanager}
            ref="create_game"
            legacymessages={this.props.legacymessages}
          />
        </div>

        <div
          label={translator("tournaments")}
          imgsrc="images/tournament-icon-gray.png"
        >
          <TournamentsList
            cssmanager={this.props.cssmanager}
            TournamentsList={
              this.props.RightBarTopData.TournamentList.Tournaments
            }
          />
        </div>
      </Tabs>
    );
  }
}
