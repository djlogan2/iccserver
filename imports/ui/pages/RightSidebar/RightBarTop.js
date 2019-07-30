import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import CreateGame from "./CreategameComponent";
import TournamentsList from "./TournamentsListComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";

export default class RightBarTop extends Component {
  constructor(props) {
    super(props);
  }

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
    //i18n.setLocale(getLang());
    let translator = i18n.createTranslator(
      "Common.RightBarTop",
      this.getLang()
    );

    return (
      <Tabs>
        {/* 
		    GameHistory is the dynamic component and loads as Player
		  	starts the game.
		  	also these component with 
	    	*/}
        <div label={translator("Game")} imgsrc="images/game-icon-gray.png">
          <GameHistory CssManager={this.props.CssManager} />
        </div>

        <div
          label={translator("Play")}
          imgsrc="images/play-icon-gray.png"
          className="play"
        >
          <CreateGame />
        </div>

        {/*  Tournament list
			   List of all tournaments will be displayed here.
		   */}
        <div
          label={translator("Tournaments")}
          imgsrc="images/tournament-icon-gray.png"
          className="tournament"
        >
          <TournamentsList />
        </div>
      </Tabs>
    );
  }
}
