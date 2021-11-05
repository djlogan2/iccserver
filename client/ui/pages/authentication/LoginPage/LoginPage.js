import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";
import { Link } from "react-router-dom";

import { Logger } from "../../../../../lib/client/Logger";
import { RESOURCE_SIGN_UP } from "../../../../constants/resourceConstants";
import { formSourceEmail, formSourcePassword } from "../authConstants";
import { translate } from "../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import classNames from "classnames";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

const log = new Logger("client/LoginPage_js");

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      email: "",
      password: "",
    };
  }

  onChangeFormValue = (value) => (event) => {
    this.setState({ [value]: event.target.value });
  };

  login = (e) => {
    e.preventDefault();

    const { translate } = this.props;
    const { email, password } = this.state;

    if (!email || !password) {
      this.setState({ error: translate("errors.empty_fields") });

      return;
    }

    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        log.error("Error occurs on Login: " + err);

        this.setState({
          error: err.reason,
        });
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
              <h1 className={classes.textCenter}>
                <div>{translate("login")}</div>
              </h1>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger fade in">{error}</div>}
              <form id="login-form" className="form col-md-12 center-block" onSubmit={this.login}>
                <div className={classes.formGroup}>
                  <input
                    type="email"
                    id="login-email"
                    className="form-control input-lg"
                    placeholder={translate("email")}
                    onChange={this.onChangeFormValue(formSourceEmail)}
                  />
                </div>
                <div className={classes.formGroup}>
                  <input
                    type="password"
                    id="login-password"
                    className="form-control input-lg"
                    placeholder={translate("password")}
                    onChange={this.onChangeFormValue(formSourcePassword)}
                  />
                </div>
                <div className={classNames(classes.formGroup, classes.textCenter)}>
                  <input
                    type="submit"
                    id="login-button"
                    className="btn btn-primary btn-lg btn-block"
                    value={translate("submit")}
                  />
                </div>
                <div className={classNames(classes.formGroup, classes.textCenter)}>
                  <p className={classes.textCenter}>
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

export default compose(
  translate("Common.loginForm"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.loginPageCss")
)(LoginPage);

export const LoginPage_Pure = LoginPage;
