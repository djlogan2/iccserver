import React, { Component } from 'react'

export default class PlayerTop extends Component {
	constructor(props) {
		super(props);
		this.state = { time: "" };
	}

	componentDidUpdate(prevProps, prevState) {

		if (prevProps.gameClockInfo !== this.props.gameClockInfo) {
			let recivedProps = this.props.gameClockInfo;
			let pTime = recivedProps.millis;
			if (recivedProps.color === 'b' && recivedProps.startclock === "true") {
				setInterval(() => this.gametimeUpdate(pTime - 50), 1000);
			} else {
				this.gametimeUpdate(pTime);
			}

		}
		if (prevProps.playerInfo !== this.props.playerInfo && this.props.playerInfo != '') {
			//	console.log("this.props.playerInfo:", this.props.playerInfo);

		}
	}

	gametimeUpdate(millisSecond) {
		let themillis = '';
		themillis = millisSecond;
		let millis = millisSecond % 1000;
		let seconds = parseInt((themillis - millis) / 1000);
		let minutes = parseInt(seconds / 60);
		seconds -= (minutes * 60);
		let hours = parseInt(minutes / 60);
		minutes -= (hours * 60);
		let timestring = '';

		if (hours) timestring = hours + ':';
		if (hours || minutes) {
			if (minutes < 10) timestring += '0';
			timestring += minutes + ':';
		} else
			timestring += '0:';
		if (seconds < 10)
			timestring += '0';

		timestring += seconds;
		if (seconds < 15 && !minutes && !hours)
			timestring += '.' + millis.toString().substr(0, 1);

		this.setState({ time: timestring });

	}

	render() {
		//	let propsTime = this.props.gameClockInfo;
		//	let blackPlayerTime = this.gametimeUpdate(propsTime);

		return (
			<div>
				<div className="ribbon-move-list">
					<span>1.</span> e4 d5    <span>2.</span> exd5 b5     <span>3.</span> c3 c6     <span>4.</span> dxc6    b4
		</div>


				<div className="board-player-top">
					<img className="user-pic" src="../../../../../images/player-img-top.png" alt="" title="" />
					<div className="board-player-userTagline">
						<div className="user-tagline-component">
							<a href="#" target="_blank" className="user-tagline-username">{this.props.playerInfo['name']} ({this.props.playerInfo['rating']})</a>
							<i><img src="../../../../../images/user-flag.png" alt="" /></i>
						</div>
						{/* <div className="captured-pieces">
							<img src="images/small-picW-1.png" /> <img src="images/small-picW-2.png" />
						</div> */}

						<div className="clock-top">
							{this.state.time}
						</div>
					</div>
				</div>
			</div>

		)
	}
}