import React, { Component } from 'react'

export default class PlayerTop extends Component {
	constructor(props) {
		super(props);

	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.playerInfo !== this.props.playerInfo && this.props.playerInfo != '') {
			//	console.log("this.props.playerInfo:", this.props.playerInfo);
		}
	}
	render() {
		return (
			<div className="user-tagline-component">
				<a href="#" target="_blank" className="user-tagline-username">{this.props.playerInfo['name']} ({this.props.playerInfo['rating']})</a>
				<i><img src="../../../../../images/user-flag.png" alt="" /></i>
			</div>
		);
	}
}