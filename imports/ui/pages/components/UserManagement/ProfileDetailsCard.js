import React, { Component } from "react";
import { Button, Card, Input } from "antd";

class ProfileDetailsCard extends Component {
  render() {
    console.log(Meteor.user())
    const currentUser = Meteor.user();
    return (
      <Card
        title="Profile details"
        style={{
          position: "relative",
          top: "2rem",
          left: "2rem",
          width: "calc(100% - 4rem)",
          height: "48%"
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <img
              src="images/avatar.png"
              alt="logo"
              style={{
                width: "min(20vh, 20vw)",
                height: "min(20vh, 20vw)",
                borderRadius: "50%",
                overflow: "hidden",
                background: "grey"
              }}
            />
            <Button type="primary">Upload new avatar</Button>
          </div>
          <div>
            <Input placeholder="Username" defaultValue={currentUser.username} />
            <Input placeholder="E-mail" defaultValue={currentUser.emails[0].address} />
          </div>
        </div>
      </Card>
    );
  }
}

export default ProfileDetailsCard;
