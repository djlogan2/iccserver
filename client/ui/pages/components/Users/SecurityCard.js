import { Button, Card, Input } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../imports/api/client/collections";
import {
  CONFIRM_PASSWORD_PROPERTY,
  ISOLATION_GROUP_PROPERTY,
  NEW_PASSWORD_PROPERTY,
} from "../../../../constants/systemConstants";
import { translate } from "../../../HOCs/translate";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

class SecurityCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      [NEW_PASSWORD_PROPERTY]: "",
      [CONFIRM_PASSWORD_PROPERTY]: "",
      [ISOLATION_GROUP_PROPERTY]: "",
    };
  }

  componentDidMount() {
    const { currentUser } = this.props;

    if (currentUser.isolation_group) {
      this.setState({ [ISOLATION_GROUP_PROPERTY]: currentUser.isolation_group });
    }
  }

  handleChange = (property) => (event) => {
    this.setState({ [property]: event.target.value });
  };

  handleAutocompleteChange = (property) => (value) => {
    this.setState({ [property]: value });
  };

  handleClick = () => {
    const { currentUser, translate } = this.props;
    const { newPassword, confirmPassword, isolationGroup } = this.state;

    if ((!newPassword || !confirmPassword) && !isolationGroup) {
      this.setState({ error: translate("errors.allValuesAreRequired") });
      return;
    }

    if (isolationGroup) {
      Meteor.call(
        "setOtherIsolationGroup",
        "setOtherIsolationGroup",
        currentUser._id,
        isolationGroup,
        (err) => {
          if (err) {
            this.setState({ error: err.reason });
          } else {
            this.setState({ error: null });
          }
        }
      );
    }

    if (newPassword !== confirmPassword) {
      this.setState({ error: translate("errors.passwordsNotTheSame") });
      return;
    }

    if (newPassword && confirmPassword) {
      Meteor.call("setOtherPassword", "setOtherPassword", currentUser._id, newPassword, (err) => {
        if (err) {
          this.setState({ error: err.reason });
        } else {
          this.setState({ error: null });
        }
      });
    }
  };

  render() {
    const { translate, classes, isolationGroups, currentUser } = this.props;
    const { error } = this.state;

    return (
      <Card
        className={classes.editCard}
        bodyStyle={{ height: "100%" }}
        title={translate("cardTitle")}
      >
        <div className={classes.editMainCardDiv}>
          {!!error && <p className={classes.errorTitle}>{error}</p>}
          <Input.Password
            id="new-password-input"
            onChange={this.handleChange(NEW_PASSWORD_PROPERTY)}
            placeholder={translate("newPassword")}
          />
          <Input.Password
            id="confirm-password-input"
            onChange={this.handleChange(CONFIRM_PASSWORD_PROPERTY)}
            placeholder={translate("confirmPassword")}
          />
          <Button id="update-password" type="primary" onClick={this.handleClick}>
            {translate("update")}
          </Button>
        </div>
      </Card>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  translate("Users.edit.security"),
  withDynamicStyles("css.userManagementCss")
)(SecurityCard);
