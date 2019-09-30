import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import React from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
const realtime_messages = new Mongo.Collection("realtime_messages");

export default class CreateGameComponent extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      userList: null,
      trial: 0,
      subscription: {
        loggedOnUsers: Meteor.subscribe("loggedOnUsers"),
        realtime: Meteor.subscribe("realtime_messages")
      }
    };
  }
  componentWillUnmount() {
    this.state.subscription.loggedOnUsers.stop();
    this.state.subscription.realtime.stop();
  }
  _legacyMessages() {
    const records = realtime_messages
      .find({ nid: { $gt: this._rm_index } }, { sort: { nid: 1 } })
      .fetch();
    /*   console.log("Fetched " + records.length + " records from realtime_messages", {
      records: records
    }); */
    return records;
  }

  getRegisteredUsers() {
    //  setTimeout(() => {
    let users = Meteor.users
      .find(
        { _id: { $ne: Meteor.userId() }, "status.online": true },
        { sort: { "profile.firstname": 1 } },
        { username: 1 }
      )
      .fetch();
    return users;

    // }, 500);
  }

  gameStart(user) {
    Meteor.call("game.match", user.username, 5, 0, 5, 0, false, 0, "white");
  }

  render() {
    //console.log("Lagecy message", this._legacyMessages());
    let userdata;
    let messages;
    if (Meteor.userId() !== null) {
      userdata = this.getRegisteredUsers();
      messages = this._legacyMessages();
    }

    return (
      <div className="play-tab-content">
        <nav>
          <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
            <ul>
              <li>
                <span>Time</span>
                <a
                  className="nav-item nav-link active"
                  id="nav-home-tab"
                  data-toggle="tab"
                  href="#nav-time"
                  role="tab"
                  aria-controls="nav-home"
                  aria-selected="true"
                >
                  10 min <i className="fa fa-sort-down" aria-hidden="true" />
                </a>
              </li>
              <li>
                <span>Type</span>
                <a
                  className="nav-item nav-link"
                  id="nav-profile-tab"
                  data-toggle="tab"
                  href="#nav-type"
                  role="tab"
                  aria-controls="nav-profile"
                  aria-selected="false"
                >
                  <img src="images/type-icon.png" alt="" />{" "}
                  <i className="fa fa-sort-down" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div>
          {userdata
            ? userdata.map((user, index) => (
                <div style={{ margin: "5px" }} key={index}>
                  <div
                    style={{
                      backgroundColor: "#00BFFF",
                      width: "100px",
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
