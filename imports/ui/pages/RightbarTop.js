import React from 'react';
import Tabs from './toptabs/Tabs';
import './toptabs/styles';
const RightbarTop = () => (
	<div>
		<Tabs>
			<div label="Game" cover="../../../images/game-icon-gray.png">
				<div className="game-top-header">
					<img src="images/circle-compass-icon.png" alt="" />
					<span>1/2  -  1/2    US-ch Open 2019</span>
					<div className="pull-right">
						<a href="#"><img src="images/share-icon-gray.png" alt="" /></a>&nbsp; &nbsp;
						<a href="#"><img src="images/download-icon-gray.png" alt="" /></a>&nbsp; &nbsp;
						<a href="#"><img src="images/live-analisys-icon.png" alt="" /></a>
					</div>
				</div>

				<div className="game-move-list">
					<span>1.</span> e4 d5  <span>2.</span> exd5 b5  <span>3.</span> c3 c6  <span>4.</span> dxc6 b4  <span>5.</span> ce2 a6   <span>6.</span> d4 a7
           				 <span>7.</span> c3 b7  <span>8.</span> cxb7 xb7  <span>9.</span> f4 xd4  <span>10.</span> xd4 e5  <span>11.</span> xe5
           		 <div className="bs-example">
						<div className="panel-group" id="accordion">
							<div className="panel panel-default">
								<div className="panel-heading">
									<h4 className="panel-title">
										<span>[</span> <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne1" className="minus collapsed">&nbsp;</a>
									</h4>
								</div>
								<div id="collapseOne1" className="panel-collapse collapse">
									<div className="panel-body">
										12.b3 Ra7  13.Rfd1  Rb7  14.a3  bxa3
                          			    15.Rxa3  Qb8
										<span>1/2- 1/2 (39) Larsen,L(2448) - Vaclav, J (2481) </span>
									</div>
								</div>
								<span className="sign">]</span>
							</div>
						</div>
					</div>
					<span>12</span>...bxa3 <span>13.</span>Qxa3  Qb8
						<span>14.</span> Rfd1  Ra7  <span>15.</span> b3  Rb7
						<span>16.</span> Rab1 Nd4  <span>17.</span> Nxd4
        		 </div>

				<div className="game-buttons-move">
					<a href="#"><img src="images/fast-forward-prev.png" /></a>
					<a href="#"><img src="images/prev-icon-gray.png" /></a>
					<a href="#"><img src="images/next-icon-gray.png" /></a>
					<a href="#"><img src="images/fast-forward-next.png" /></a>
					<a href="#"><img src="images/next-icon-single.png" /></a>
					<a href="#"><img src="images/flip-icon-gray.png" /></a>
					<a href="#"><img src="images/setting-icon.png" /></a>
				</div>
				<div className="draw-section">
					<ul>
						<li><a href="#" title="Takeback"><span><img src="images/take-forward-icon.png" /></span>Takeback</a></li>
						<li><a href="#" title="Draw"><span><img src="images/draw-icon.png" /></span>Draw</a></li>
						<li><a href="#" title="Resign"><span><img src="images/resign-icon.png" /></span>Resign</a></li>
						<li><a href="#" title="Abort"><span><img src="images/abort-icon.png" /></span>Abort</a></li>
					</ul>
				</div>
			</div>

			<div label="Play" cover="../../../images/play-icon-gray.png" className="play" >
				<div className="play-tab-content">
					<nav>
						<div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
							<ul>
								<li><span>Time</span><a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-time" role="tab" aria-controls="nav-home" aria-selected="true">10 min <i className="fa fa-sort-down" aria-hidden="true"></i></a></li>
								<li><span>Type</span><a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-type" role="tab" aria-controls="nav-profile" aria-selected="false"><img src="images/type-icon.png" alt="" /> <i className="fa fa-sort-down" aria-hidden="true"></i></a></li>
							</ul>
						</div>
					</nav>
					<div className="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
						<div className="tab-pane fade show active" id="nav-time" role="tabpanel" aria-labelledby="nav-time-tab">
							<ul className="multiple-time-item">
								<li><a href="#">10 min</a></li>
								<li><a href="#">5 min</a></li>
								<li><a href="#">3 min</a></li>
								<li><a href="#">1 min</a></li>
								<li><a href="#">15 | 10</a></li>
								<li><a href="#">3 | 2</a></li>
								<li><a href="#">2 | 1</a></li>
								<li><a href="#">More</a></li>
							</ul>
						</div>
						<div className="tab-pane fade" id="nav-type" role="tabpanel" aria-labelledby="nav-type-tab">
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
									<span className="competitions-list-item-name">1|0 Bullet Arena</span>
									<span className="competitions-list-item-status">in 4 min</span>
									<span className="competitions-list-item-count">40 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
									<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
									<span className="competitions-list-item-status">Round 1 of 5</span>
									<span className="competitions-list-item-count">51 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
									<span className="competitions-list-item-name">1|0 Bullet Arena</span>
									<span className="competitions-list-item-status">in 4 min</span>
									<span className="competitions-list-item-count">40 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
									<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
									<span className="competitions-list-item-status">Round 1 of 5</span>
									<span className="competitions-list-item-count">51 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
									<span className="competitions-list-item-name">1|0 Bullet Arena</span>
									<span className="competitions-list-item-status">in 4 min</span>
									<span className="competitions-list-item-count">40 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
									<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
									<span className="competitions-list-item-status">Round 1 of 5</span>
									<span className="competitions-list-item-count">51 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
							<div className="challenge-content">
								<a href="#" className="competitions-list-item-component">
									<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
									<span className="competitions-list-item-name">3|2 Blitz Arena</span>
									<span className="competitions-list-item-status">88 mins left</span>
									<span className="competitions-list-item-count">70 </span>
									<i className="fa fa-user" aria-hidden="true"></i>
								</a>
							</div>
						</div>
						<div className="play-btn-right">
							<a href="#">Play</a>
						</div>
					</div>
				</div>
			</div>

			<div label="Tournaments" cover="../../../images/tournament-icon-gray.png" className="tournament">
				<div className="tournament-content">
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
							<span className="competitions-list-item-name">1|0 Bullet Arena</span>
							<span className="competitions-list-item-status">in 4 min</span>
							<span className="competitions-list-item-count">40 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
							<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
							<span className="competitions-list-item-status">Round 1 of 5</span>
							<span className="competitions-list-item-count">51 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
							<span className="competitions-list-item-name">1|0 Bullet Arena</span>
							<span className="competitions-list-item-status">in 4 min</span>
							<span className="competitions-list-item-count">40 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
							<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
							<span className="competitions-list-item-status">Round 1 of 5</span>
							<span className="competitions-list-item-count">51 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/bullet-icon.png" /></i>
							<span className="competitions-list-item-name">1|0 Bullet Arena</span>
							<span className="competitions-list-item-status">in 4 min</span>
							<span className="competitions-list-item-count">40 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/rapid-icon.png" /></i>
							<span className="competitions-list-item-name">15|10 Rapid Swiss </span>
							<span className="competitions-list-item-status">Round 1 of 5</span>
							<span className="competitions-list-item-count">51 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
					<div className="challenge-content">
						<a href="#" className="competitions-list-item-component">
							<i className="blitzicon"><img src="images/blitz-icon.png" /></i>
							<span className="competitions-list-item-name">3|2 Blitz Arena</span>
							<span className="competitions-list-item-status">88 mins left</span>
							<span className="competitions-list-item-count">70 </span>
							<i className="fa fa-user" aria-hidden="true"></i>
						</a>
					</div>
				</div>
			</div>
		</Tabs>
	</div>
);
export default RightbarTop;