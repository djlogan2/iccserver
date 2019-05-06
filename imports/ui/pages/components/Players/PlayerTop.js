import React from 'react';


const PlayerTop = () => (
<div>
						<div className="ribbon-move-list">
							<span>1.</span> e4 d5    <span>2.</span> exd5 b5     <span>3.</span> c3 c6     <span>4.</span> dxc6    b4
						</div>


						<div className="board-player-top">
								<img className="user-pic" src="../../../../../images/player-img-top.png" alt="" title=""/>
									<div className="board-player-userTagline">
										<div className="user-tagline-component">
											<a href="#" target="_blank" className="user-tagline-username">Jack256 (633)</a> 
											<i><img src="../../../../../images/user-flag.png" alt=""/></i>
										</div> 
										<div className="captured-pieces">
										<img src="images/small-picW-1.png" /> <img src="images/small-picW-2.png" />
										</div>

										<div className="clock-top">
											10:00
										</div>
									</div>
							</div>
</div>

	
);
export default PlayerTop;