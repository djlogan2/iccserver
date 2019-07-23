import React, { Component } from 'react';

const ActionComponent = () => (
	<div className="draw-section">
		<ul>
			{/* 
							Take back request Component
							Player can request to take back the last move to the
							opponent Player. 
							*/}
			<li>
				<a href="#" title="TakeBack">
					<span>
						<img src="images/take-forward-icon.png" />
					</span>TakeBack
				</a>
			</li>
			{/* 
							Draw request Component
							Player can draw arrow and circle on the board.
							
							*/}

			<li>
				<a href="#" title="Draw">
					<span>
						<img src="images/draw-icon.png" />
					</span>Draw
				</a>
			</li>
			{/*
							Resign Component
							Players can resign the game.
							*/}

			<li>
				<a href="#" title="Resign">
					<span>
						<img src="images/resign-icon.png" />
					</span>Resign
				</a>
			</li>
			{/* 
						Game abort Component
						Players can abort the game. */}

			<li>
				<a href="#" title="Abort">
					<span>
						<img src="images/abort-icon.png" />
					</span>Abort
				</a>
			</li>
		</ul>
	</div>
);
export default ActionComponent;
