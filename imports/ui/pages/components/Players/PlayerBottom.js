import React from 'react';


const PlayerBottom = () => (

<div>

  <div className="board-player-bottom">
				<img className="user-pic" src="../../../images/player-img-bottom.png" alt="" title=""/>
					<div className="board-player-userTagline">
						<div className="user-tagline-component">
							<a href="#" target="_blank" className="user-tagline-username">John256 (210)</a> <i><img src="../../../images/user-flag.png" alt=""/></i>
						</div>
						<div className="captured-pieces">
					<img src="images/small-picB-1.png" /> <img src="images/small-picB-2.png" />
					</div> 
						<div className="clock-bottom active">
							10:00
						</div>
					</div>
	</div>

				<div className="move-list-buttons ipad-768">
						<div className="move-list-item">
							<a href="#"><img src="images/more-icon.png" /></a>
						</div>
						<div className="move-list-item">
							<a href="#"><img src="images/chat-icon-gray.png" /></a>
						</div>
						<div className="move-list-item">
							<a href="#"><img src="images/flip-icon.png" /></a>
						</div>
						<div className="move-list-item">
							<a href="#"><img src="images/prev-icon.png" /></a>
						</div>

						<div className="move-list-item hidden-xs">
							<a href="#"><img src="images/prev-icon-single.png" /></a>
						</div>
						<div className="move-list-item hidden-xs">
							<a href="#"><img src="images/next-icon-single.png" /></a>
						</div>

						<div className="move-list-item">
							<a href="#"><img src="images/next-icon.png" /></a>
						</div>
				</div>
</div>

);
export default PlayerBottom;