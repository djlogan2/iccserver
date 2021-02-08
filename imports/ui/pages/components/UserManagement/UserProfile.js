import React, { Component } from "react";

import AppWrapper from "../AppWrapper";
import ProfileDetailsCard from "./ProfileDetailsCard";
import SecurityTab from "./SecurityTab";

class UserProfile extends Component {
  render() {
    return (
      <AppWrapper>
        <ProfileDetailsCard />
        <SecurityTab />
      </AppWrapper>
    );
  }
}

export default UserProfile;
