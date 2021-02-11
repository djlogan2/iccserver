import React, { Component } from "react";
import { Button, Card, Input } from "antd";
import { Meteor } from "meteor/meteor";

import { NEW_PASSWORD_PROPERTY } from "../../../../constants/systemConstants";

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
    return (
      <Card
        style={{
          width: "calc(100% - 4rem)",
          height: "calc(50% - 4rem)",
          marginTop: "2rem",
          marginLeft: "2rem"
        }}
        bodyStyle={{ height: "100%" }}
        title="Security"
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
          <Input.Password
            onChange={this.handleChange(NEW_PASSWORD_PROPERTY)}
            placeholder="New password"
          />
          <Button type="primary" onClick={this.handleClick}>
            Update password
          </Button>
        </div>
      </Card>
    );
  }
}

export default SecurityCard;
