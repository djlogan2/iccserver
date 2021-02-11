import React, { Component } from "react";
import { Button, Card, Input } from "antd";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import { translate } from "../../../HOCs/translate";
import { USERNAME_PROPERTY } from "../../../../constants/systemConstants";
import { RESOURCE_USERS } from "../../../../constants/resourceConstants";

class DetailsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      [USERNAME_PROPERTY]: ""
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

  handleChange = property => event => {
    this.setState({ [property]: event.target.value });
  };

  render() {
    const { currentUser, translate } = this.props;

    return (
      <Card
        style={{
          width: "calc(100% - 4rem)",
          height: "calc(50% - 4rem)",
          marginTop: "2rem",
          marginLeft: "2rem"
        }}
        bodyStyle={{ height: "100%" }}
        title={translate("cardTitle")}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around"
          }}
        >
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
  withRouter,
  translate("Users.edit.details")
)(DetailsCard);
