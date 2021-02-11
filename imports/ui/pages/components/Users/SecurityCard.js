import React, { Component } from "react";
import { Button, Card, Input } from "antd";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";

import { NEW_PASSWORD_PROPERTY } from "../../../../constants/systemConstants";
import { translate } from "../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../api/client/collections";
import injectSheet from "react-jss";
import { dynamicUserManagementStyles } from "./dynamicUserManagementStyles";

class SecurityCard extends Component {
  constructor(props) {
    super(props);

    this.props = {
      [NEW_PASSWORD_PROPERTY]: ""
    };
  }

  handleChange = property => event => {
    this.setState({ [property]: event.target.value });
  };

  handleClick = () => {
    const { currentUser } = this.props;
    const { newPassword } = this.state;

    if (newPassword) {
      Meteor.call("setOtherPassword", "setOtherPassword", currentUser._id, newPassword);
    }
  };

  render() {
    const { translate, classes } = this.props;

    return (
      <Card
        className={classes.editCard}
        bodyStyle={{ height: "100%" }}
        title={translate("cardTitle")}
      >
        <div className={classes.editMainCardDiv}>
          <Input.Password
            onChange={this.handleChange(NEW_PASSWORD_PROPERTY)}
            placeholder={translate("newPassword")}
          />
          <Button type="primary" onClick={this.handleClick}>
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
      css: mongoCss.findOne()
    };
  }),
  translate("Users.edit.security"),
  injectSheet(dynamicUserManagementStyles)
)(SecurityCard);
