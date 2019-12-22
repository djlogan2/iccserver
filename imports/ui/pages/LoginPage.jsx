import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../lib/client/Logger";
const log = new Logger("LoginPage/LoginPage_js");
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      isAuthenticated: Meteor.userId() !== null
    };
    this.DoLogin = this.DoLogin.bind(this);
  }
  componentDidMount() {
    if (this.state.isAuthenticated) {
      this.props.history.push("/home");
    }
  }
  DoLogin(e) {
    e.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;
    Meteor.loginWithPassword(email, password, err => {
      if (err) {
        log.error("Error occurs on Login: " + err);
        this.setState({
          error: "Email and Password not match"
        });
      } else {
        this.props.history.push("/home");
      }
    });
  }

  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    let translator = i18n.createTranslator("Common.loginForm", this.getLang());
    const error = this.state.error;
    return (
      <div className="modal show">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="text-center">
                <div>{translator("login")}</div>
              </h1>
            </div>
            <div className="modal-body">
              {error.length > 0 ? <div className="alert alert-danger fade in">{error}</div> : ""}
              <form id="login-form" className="form col-md-12 center-block" onSubmit={this.DoLogin}>
                <div className="form-group">
                  <input
                    type="email"
                    id="login-email"
                    className="form-control input-lg"
                    placeholder={translator("email")}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="login-password"
                    className="form-control input-lg"
                    placeholder={translator("password")}
                  />
                </div>
                <div className="form-group text-center">
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-primary btn-lg btn-block"
                    value={translator("submit")}
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
