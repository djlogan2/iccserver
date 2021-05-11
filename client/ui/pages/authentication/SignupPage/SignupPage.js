import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import { compose } from "redux";
import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_LOGIN } from "../../../../constants/resourceConstants";
import { formSourceEmail, formSourcePassword, formSourceUsername } from "../authConstants";
import { translate } from "../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

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
    const { translate, classes } = this.props;
    const { error } = this.state;

    return (
      <div className={classes.modalShow}>
        <div className="modal-dialog">
          <div className={classes.modalContent}>
            <div className={classes.modalHeader}>
              <h1 className={classes.textCenter}>{translate("signup")}</h1>
            </div>
            <div className={classes.modalBody}>
              {error && <div className="alert alert-danger fade in">{error}</div>}
              <form
                id="sign-up-form"
                className="form col-md-12 center-block"
                onSubmit={this.signUp}
              >
                <div className={classes.formGroup}>
                  <input
                    type="text"
                    id="signup-name"
                    className="form-control input-lg"
                    placeholder={translate("name")}
                    onChange={this.onChangeFormValue(formSourceUsername)}
                  />
                </div>
                <div className={classes.formGroup}>
                  <input
                    type="email"
                    id="signup-email"
                    className="form-control input-lg"
                    placeholder={translate("email")}
                    onChange={this.onChangeFormValue(formSourceEmail)}
                  />
                </div>
                <div className={classes.formGroup}>
                  <input
                    type="password"
                    id="signup-password"
                    className="form-control input-lg"
                    placeholder={translate("password")}
                    onChange={this.onChangeFormValue(formSourcePassword)}
                  />
                </div>
                <div className={classes.formGroup}>
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-lg btn-primary btn-block"
                    value={translate("submit")}
                  />
                </div>
                <div className={classes.formGroup}>
                  <p className={classes.textCenter}>
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

export default compose(
  translate("Common.signupForm"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(SignupPage);
