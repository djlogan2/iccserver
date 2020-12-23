import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Logger } from "../../../../lib/client/Logger";
import { RESOURCE_HOME, RESOURCE_SIGN_UP } from "../../../constants/resourceConstants";
import { formSourceEmail, formSourcePassword } from "./authConstants";
import { translate } from "../../HOCs/translate";

const log = new Logger("client/LoginPage_js");

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      isAuthenticated: Meteor.userId() !== null,
      email: null,
      password: null
    };
  }

  componentDidMount() {
    const { isAuthenticated } = this.state;

    if (isAuthenticated) {
      const { history } = this.props;

      history.push(RESOURCE_HOME);
    }
  }

  onChangeFormValue = value => event => {
    this.setState({ [value]: event.target.value });
  };

  login = e => {
    e.preventDefault();

    const { history } = this.props;
    const { email, password } = this.state;

    Meteor.loginWithPassword(email, password, err => {
      if (err) {
        log.error("Error occurs on Login: " + err);

        this.setState({
          error: err.reason //"Email and Password not match"
        });
      } else {
        history.push(RESOURCE_HOME);
      }
    });
  };

  render() {
    const { error } = this.state;
    const { translate } = this.props;

    return (
      <div className="modal show">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="text-center">
                <div>{translate("login")}</div>
              </h1>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger fade in">{error}</div>}
              <form id="login-form" className="form col-md-12 center-block" onSubmit={this.login}>
                <div className="form-group">
                  <input
                    type="email"
                    id="login-email"
                    className="form-control input-lg"
                    placeholder={translate("email")}
                    onChange={this.onChangeFormValue(formSourceEmail)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="login-password"
                    className="form-control input-lg"
                    placeholder={translate("password")}
                    onChange={this.onChangeFormValue(formSourcePassword)}
                  />
                </div>
                <div className="form-group text-center">
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-primary btn-lg btn-block"
                    value={translate("submit")}
                  />
                </div>
                <div className="form-group text-center">
                  <p className="text-center">
                    {translate("haveNoAccount")}
                    <Link to={RESOURCE_SIGN_UP}>{translate("registerHere")}</Link>
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

export default translate("Common.loginForm")(LoginPage);
