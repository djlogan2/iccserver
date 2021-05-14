import React, { Component } from "react";
import { Button, Card, Input } from "antd";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import { translate } from "../../../HOCs/translate";
import { USERNAME_PROPERTY } from "../../../../constants/systemConstants";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicUserManagementStyles } from "./dynamicUserManagementStyles";

class DetailsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      [USERNAME_PROPERTY]: "",
    };
  }

  handleClick = () => {
    const { currentUser, history } = this.props;
    const { username } = this.state;

    if (username) {
      Meteor.call("setOtherUsername", "setOtherUsername", currentUser._id, username, () => {
        history.push(RESOURCE_USERS);
      });
    }
  };

  handleChange = (property) => (event) => {
    this.setState({ [property]: event.target.value });
  };

  render() {
    const { currentUser, translate, classes } = this.props;

    return (
      <Card
        className={classes.editCard}
        bodyStyle={{ height: "100%" }}
        title={translate("cardTitle")}
      >
        <div className={classes.editMainCardDiv}>
          <Input
            placeholder={translate("username")}
            onChange={this.handleChange(USERNAME_PROPERTY)}
            defaultValue={currentUser.username}
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
      css: mongoCss.findOne(),
    };
  }),
  withRouter,
  translate("Users.edit.details"),
  injectSheet(dynamicUserManagementStyles)
)(DetailsCard);
