import React, { Component } from "react";
import { Button, Card, Input, notification } from "antd";

import { translate } from "../../../HOCs/translate";
import {
  CURRENT_PASSWORD_PROPERTY,
  CONFIRM_PASSWORD_PROPERTY,
  NEW_PASSWORD_PROPERTY
} from "../../../../constants/systemConstants";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import injectSheet from "react-jss";
import { dynamicUserProfileStyles } from "./dynamicUserProfileStyles";

class SecurityCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      [CURRENT_PASSWORD_PROPERTY]: "",
      [NEW_PASSWORD_PROPERTY]: "",
      [CONFIRM_PASSWORD_PROPERTY]: "",
      error: null,
      disabled: false
    };
  }

  handleInputChange = property => event => {
    this.setState({ [property]: event.target.value });
  };

  handleUpdatePassword = () => {
    const { translate } = this.props;
    const { currentPassword, newPassword, confirmPassword } = this.state;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.setState({ error: translate("validation.allValuesAreRequired") });
    }

    if (newPassword !== confirmPassword) {
      this.setState({ error: translate("validation.passwordsNotTheSame") });
    }

    if (currentPassword && newPassword && newPassword === confirmPassword) {
      this.setState({ disabled: true });

      Accounts.changePassword(currentPassword, newPassword, err => {
        this.setState({
          error: err ? err.reason : null,
          disabled: false
        });

        if (!err) {
          notification.open({
            message: translate("notifications.passwordChanged"),
            description: null,
            duration: 5
          });
        }
      });
    }
  };

  render() {
    const { translate, classes } = this.props;
    const { disabled, error } = this.state;

    return (
      <Card title={translate("cardTitle")} className={classes.card} bodyStyle={{ height: " 100%" }}>
        <div className={classes.mainDiv}>
          <div className={classes.changePasswordDiv}>
            {!!error && <p className={classes.errorTitle}>{error}</p>}
            <Input.Password
              disabled={disabled}
              placeholder={translate("currentPassword")}
              onChange={this.handleInputChange(CURRENT_PASSWORD_PROPERTY)}
            />
            <Input.Password
              disabled={disabled}
              placeholder={translate("newPassword")}
              onChange={this.handleInputChange(NEW_PASSWORD_PROPERTY)}
            />
            <Input.Password
              disabled={disabled}
              placeholder={translate("confirmPassword")}
              onChange={this.handleInputChange(CONFIRM_PASSWORD_PROPERTY)}
            />
            <Button disabled={disabled} type="primary" onClick={this.handleUpdatePassword}>
              {translate("updatePassword")}
            </Button>
          </div>
        </div>
      </Card>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne()
    };
  }),
  translate("Profile.SecurityTab"),
  injectSheet(dynamicUserProfileStyles)
)(SecurityCard);
