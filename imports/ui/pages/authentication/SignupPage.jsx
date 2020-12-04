import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import { Logger } from "../../../../lib/client/Logger";
import { resourceLogin } from "../../../constants/resourceConstants";
import { formSourceEmail, formSourcePassword, formSourceUsername } from "./authConstants";

const log = new Logger("client/SignUpPage_js");

export default class SignUpPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      email: null,
      username: null,
      password: null
    };
  }

  onChangeFormValue = value => event => {
    this.setState({ [value]: event.target.value });
  };

  signUp = e => {
    e.preventDefault();

    const { history } = this.props;
    const { email, username, password } = this.state;

    Accounts.createUser({ email, username, password }, err => {
      if (err) {
        log.error("Error occurs on Sign up: " + err);
        this.setState({ error: err.reason });
      } else {
        history.push(resourceLogin);
      }
    });
  };

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
    const { error } = this.state;
    const translator = i18n.createTranslator("Common.signupForm", this.getLang());

    return (
      <div className="modal show">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="text-center">{translator("signup")}</h1>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger fade in">{error}</div>}
              <form
                id="sign-up-form"
                className="form col-md-12 center-block"
                onSubmit={this.signUp}
              >
                <div className="form-group">
                  <input
                    type="text"
                    id="signup-name"
                    className="form-control input-lg"
                    placeholder={translator("name")}
                    onChange={this.onChangeFormValue(formSourceUsername)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="signup-email"
                    className="form-control input-lg"
                    placeholder={translator("email")}
                    onChange={this.onChangeFormValue(formSourceEmail)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="signup-password"
                    className="form-control input-lg"
                    placeholder={translator("password")}
                    onChange={this.onChangeFormValue(formSourcePassword)}
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
                    {translator("haveAccount")}
                    <Link to={resourceLogin}>{translator("loginHere")}</Link>
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
