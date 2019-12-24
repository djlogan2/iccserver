import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../lib/client/Logger";
const log = new Logger("SignUpPage/SignUpPage_js");
export default class SignUpPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    // this.setState({error: ""});
    Accounts.createUser({ email: email, username: name, password: password }, err => {
      if (err) {
        log.error("Error occurs on Sign up: " + err);
        this.setState({
          error: err.reason
        });
      } else {
        this.props.history.push("/login");
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
    let translator = i18n.createTranslator("Common.signupForm", this.getLang());
    const error = this.state.error;
    return (
      <div className="modal show">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="text-center">{translator("signup")}</h1>
            </div>
            <div className="modal-body">
              {error.length > 0 ? <div className="alert alert-danger fade in">{error}</div> : ""}
              <form
                id="login-form"
                className="form col-md-12 center-block"
                onSubmit={this.handleSubmit}
              >
                <div className="form-group">
                  <input
                    type="text"
                    id="signup-name"
                    className="form-control input-lg"
                    placeholder={translator("name")}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="signup-email"
                    className="form-control input-lg"
                    placeholder={translator("email")}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="signup-password"
                    className="form-control input-lg"
                    placeholder={translator("password")}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-lg btn-primary btn-block"
                    value={translator("submit")}
                  />
                </div>
                <div className="form-group">
                  <p className="text-center">
                    Already have an account? Login <Link to="/login">here</Link>
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
