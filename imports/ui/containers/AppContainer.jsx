import React, { Component } from 'react';
import { withHistory } from 'react-router-dom';
import MainPage from './../pages/MainPage';

export default class AppContainer extends Component {
	constructor(props) {
		super(props);
		this.state = this.getMeteorData();
		this.logout = this.logout.bind(this);
	}

	getMeteorData() {
		return { isAuthenticated: Meteor.userId() !== null };
	}

	componentWillMount() {
		if (!this.state.isAuthenticated) {
			this.props.history.push('/sign-up');
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!this.state.isAuthenticated) {
			this.props.history.push('/login');
		}
	}

	logout(e) {
		e.preventDefault();
		Meteor.logout(err => {
			if (err) {
				log.error(err.reason);
			} else {
				this.props.history.push('/login');
			}
		});
		this.props.history.push('/login');
	}

	render() {
		//let authnticate =this.state;
		if (this.state.isAuthenticated === true)
			return (
				<div>
					<MainPage />
				</div>
			);
		else
			return (
				<div>
					<nav className="navbar navbar-default navbar-static-top">
						<div className="container">
							<div className="navbar-header">
								<a className="navbar-brand" href="#">
									Chess App
								</a>
							</div>
							<div className="navbar-collapse">
								<ul className="nav navbar-nav navbar-right">
									<li>
										<a href="#" onClick={this.logout}>
											Logout
										</a>
									</li>
								</ul>
							</div>
						</div>
					</nav>
				</div>
			);
	}
}
