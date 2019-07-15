import React from 'react';
import Tabs from './toptabs/Tabs';
import GameHistory from './GameComponent';
import CreateGame from './CreategameComponent';
import TournamentsList from './TournamentslistComponent';
import './toptabs/styles';
const RightbarTop = () => (

	<Tabs>
		<div label="Game" imgsrc="images/game-icon-gray.png" >
			<GameHistory />
		</div>

		<div label="Play" imgsrc="images/play-icon-gray.png" className="play" >
			<CreateGame />
		</div>

		<div label="Tournaments" imgsrc="images/tournament-icon-gray.png" className="tournament">
			<TournamentsList />
		</div>
	</Tabs>

);
export default RightbarTop;