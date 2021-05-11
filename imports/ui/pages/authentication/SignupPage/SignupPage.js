import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_LOGIN } from "../../../../constants/resourceConstants";
import { formSourceEmail, formSourcePassword, formSourceUsername } from "../authConstants";
import { translate } from "../../../HOCs/translate";

const log = new Logger("client/SignUpPage_js");

class SignupPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      email: null,
      username: null,
      password: null,
    };
  }

  onChangeFormValue = (value) => (event) => {
    this.setState({ [value]: event.target.value });
  };

  signUp = (e) => {
    e.preventDefault();

    const { history } = this.props;
    const { email, username, password } = this.state;

    Accounts.createUser({ email, username, password }, (err) => {
      if (err) {
        log.error("Error occurs on Sign up: " + err);
        this.setState({ error: err.reason });
      } else {
        history.push(RESOURCE_LOGIN);
      }
    });
  };

  render() {
    const { translate } = this.props;
    const { error } = this.state;

    return (
      <div className="modal show">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="text-center">{translate("signup")}</h1>
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
                    placeholder={translate("name")}
                    onChange={this.onChangeFormValue(formSourceUsername)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="signup-email"
                    className="form-control input-lg"
                    placeholder={translate("email")}
                    onChange={this.onChangeFormValue(formSourceEmail)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="signup-password"
                    className="form-control input-lg"
                    placeholder={translate("password")}
                    onChange={this.onChangeFormValue(formSourcePassword)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-lg btn-primary btn-block"
                    value={translate("submit")}
                  />
                </div>
                <div className="form-group">
                  <p className="text-center">
                    {translate("haveAccount")}
                    <Link to={RESOURCE_LOGIN}>{translate("loginHere")}</Link>
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

export default translate("Common.signupForm")(SignupPage);
