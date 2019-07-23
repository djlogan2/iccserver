import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

export default class LoginPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: ''
		};
		this.DoLogin = this.DoLogin.bind(this);
	}

	DoLogin(e) {
		e.preventDefault();
		let email = document.getElementById('login-email').value;
		let password = document.getElementById('login-password').value;
		Meteor.loginWithPassword(email, password, err => {
			if (err) {
				this.setState({
					error: 'Email and Password not match'
				});
			} else {
				this.props.history.push('/');
			}
		});
	}

	render() {
		const error = this.state.error;
		return (
			<div className="modal show">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="text-center">Login</h1>
						</div>
						<div className="modal-body">
							{error.length > 0 ? <div className="alert alert-danger fade in">{error}</div> : ''}
							<form id="login-form" className="form col-md-12 center-block" onSubmit={this.DoLogin}>
								<div className="form-group">
									<input
										type="email"
										id="login-email"
										className="form-control input-lg"
										placeholder="email"
									/>
								</div>
								<div className="form-group">
									<input
										type="password"
										id="login-password"
										className="form-control input-lg"
										placeholder="password"
									/>
								</div>
								<div className="form-group text-center">
									<input
										type="submit"
										id="login-button"
										className="btn btn-primary btn-lg btn-block"
										value="Login"
									/>
								</div>
								<div className="form-group text-center">
									<p className="text-center">
										Don't have an account? Register <Link to="/sign-up">here</Link>
									</p>
								</div>
							</form>
						</div>
						<div className="modal-footer" style={{ borderTop: 0 }} />
					</div>
				</div>
			</div>
		);
	}
}
