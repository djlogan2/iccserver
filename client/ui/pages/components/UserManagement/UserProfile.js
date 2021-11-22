import React, { Component } from "react";

import ProfileDetailsCard from "./ProfileDetailsCard";
import SecurityTab from "./SecurityCard";

class UserProfile extends Component {
  render() {
    return (
      <>
        <ProfileDetailsCard />
        <SecurityTab />
      </>
    );
  }
}

export default UserProfile;
