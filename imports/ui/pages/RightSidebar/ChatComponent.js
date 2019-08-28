import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class ChatComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  getRegisteredUsers() {
    //this.setState({ error: null });
    return Meteor.users
      .find(
        { _id: { $ne: Meteor.userId() } },
        { sort: { "profile.firstname": 1 } }
      )
      .fetch();
  }
  gameStart(user) {
    Meteor.call("game-messages.insert", "Game started", user.username);
    //  Meteor.call("game-messages.setPrivate", true);
  }

  render() {
    const userList = this.getRegisteredUsers();

    return (
      <div>
        <div>
          {userList
            ? userList.map((user, index) => (
                <div style={{ margin: "5px" }} key={index}>
                  <div
                    style={{
                      backgroundColor: "#00BFFF",
                      width: "50px",
                      display: "inline-block",
                      height: "auto",
                      margin: "5px",
                      borderRadius: "2px",
                      color: "white",
                      textAlign: "center"
                    }}
                  >
                    {user.username}
                  </div>
                  <div style={{ width: "48%", display: "inline-block" }}>
                    <button
                      onClick={this.gameStart.bind(this, user)}
                      style={{
                        backgroundColor: "#1565c0",
                        border: "none",
                        color: "white",
                        padding: "5px 10px",
                        textAign: "center",
                        textDecoration: "none",
                        display: "inline-block",
                        fontSize: "12px",
                        borderRadius: "5px"
                      }}
                    >
                      Start Game
                    </button>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    );
  }
}
