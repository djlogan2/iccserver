import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LeftSidebar from './LeftSidebar/LeftSidebar';
import RightSidebar from './RightSidebar/RightSidebar';
import './css/ChessBoard';
import './css/LeftSidebar';
import './css/RightSidebar';
import MiddleBoard from './MiddleBoard/MiddleBoard';
import RealTime from '../../../lib/client/RealTime';
import TrackerReact from 'meteor/ultimatejs:tracker-react';

export default class MainPage extends TrackerReact(React.Component) {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			visible: false,
			subscription: {
				tasks: Meteor.subscribe('userData')
			}
		};
		this.toggleMenu = this.toggleMenu.bind(this);
	}

	toggleMenu() {
		this.setState({ visible: !this.state.visible });
	}

	getingData() {
		let game_info = [];
		let rm_index = 1;
		let records = RealTime.find({ nid: { $gt: rm_index } }, { sort: { nid: 1 } }).fetch();
		//  let records = RealTime.find().fetch();

		if (records.length)
			// this.setState({ rm_index: records[records.length - 1].nid });

			records.map(rec => {
				rm_index = rec.nid;
				switch (rec.type) {
					case 'setup_logger':
						game_info = rec;
						break;

					case 'game_start':
						this.setState();
						game_info = rec;
						break;

					case 'game_move':
						game_info = rec;
						break;

					case 'update_game_clock':
						game_info = rec;
						break;
					default:
					//             log.error('realtime_message default', rec);
				}
			});

		return game_info;
	}

	render() {
		let currentUser = this.props.currentUser;
		let userDataAvailable = currentUser !== undefined;
		let loggedIn = currentUser && userDataAvailable;
		const gameStart = this.getingData();
		//  const gameStart = this.gameStartData();

		return (
			<div className="main">
				<div className="row">
					<div className="col-sm-2 left-col">
						<aside>
							<div
								className={
									this.state.visible ? 'sidebar left device-menu fliph' : 'sidebar left device-menu'
								}
							>
								<div className="pull-left image">
									<img src="../../../images/logo-white-lg.png" />
								</div>
								<div className="float-right menu-close-icon">
									<a onClick={this.toggleMenu} href="#" className="button-left">
										<span className="fa fa-fw fa-bars " />
									</a>
								</div>
								<LeftSidebar />
							</div>
						</aside>
					</div>
					<div className="col-sm-5 col-md-8 col-lg-5 ">
						<MiddleBoard />
					</div>
					<br />
					<br />
					<br />
					<div className="col-sm-4 col-md-4 col-lg-4 right-section">
						<RightSidebar />
					</div>
				</div>
			</div>
		);
	}
}

MainPage.propTypes = {
	username: PropTypes.string
};
