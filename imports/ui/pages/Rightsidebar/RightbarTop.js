import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import CreateGame from "./CreateGameComponent";
import TournamentsList from "./TournamentsListComponent";
import "./Tabs/styles";
const RightBarTop = () => (
  <Tabs>
    {/* 
		    GameHistory is the dynamic component and loads as Player
			starts the game.
			also these component with 
		*/}
    <div label="Game" imgsrc="images/game-icon-gray.png">
      <GameHistory />
    </div>

    <div label="Play" imgsrc="images/play-icon-gray.png" className="play">
      <CreateGame />
    </div>

    {/*  Tournament list
			 List of all tournaments will be displayed here.
		 */}
    <div
      label="Tournaments"
      imgsrc="images/tournament-icon-gray.png"
      className="tournament"
    >
      <TournamentsList />
    </div>
  </Tabs>
);
export default RightBarTop;
