import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
export default class ChatComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      userList: null,
      trial: 0
    };
  }

  getRegisteredUsers() {
    setTimeout(() => {
      let users = Meteor.users
        .find(
          { _id: { $ne: Meteor.userId() }, "status.online": true },
          { sort: { "profile.firstname": 1 } },
          { username: 1 }
        )
        .fetch();
      this.setState({ userList: users });
      var trial = this.state.trial + 1;
      this.setState({ trial: trial });
    }, 500);
  }
  gameStart(user) {
    Meteor.call("game-messages.insert", "Game started", user.username);
    //  Meteor.call("game-messages.setPrivate", true);
  }

  render() {
    if (
      this.state.trial <= 3 &&
      (this.state.userList === null || this.state.userList.length === 0)
    ) {
      this.getRegisteredUsers();
      return <div>loading...</div>;
    }

    return (
      <div>
        <div>
          {this.state.userList
            ? this.state.userList.map((user, index) => (
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
