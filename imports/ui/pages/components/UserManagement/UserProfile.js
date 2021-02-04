import React, { Component } from "react";
import { Card, Button } from "antd";

import AppWrapper from "../AppWrapper";
import ProfileDetailsCard from "./ProfileDetailsCard";

class UserProfile extends Component {
  render() {
    return (
      <AppWrapper>
        <ProfileDetailsCard />
        <Card
          title="Security"
          style={{
            position: "relative",
            top: "2rem",
            left: "2rem",
            width: "calc(100% - 4rem)",
            height: "48%"
          }}
        >
          Security
        </Card>
      </AppWrapper>
    );
  }
}

export default UserProfile;
