import { Meteor } from "meteor/meteor";
import React from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("CreateGameComponent_js");

export default class CreateGameComponent extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      userList: null,
      legacyUsers: [],
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

  _usersFromMessages() {
    const legacymessages = this._legacyMessages();
    let usercopy;
    let changed = false;
    let idx;
    if (legacymessages.length)
      this._rm_index = legacymessages[legacymessages.length - 1].nid;
    legacymessages.forEach(rec => {
      log.debug("realtime_record", rec);
      this._rm_index = rec.nid;
      switch (rec.type) {
        case "user_loggedon":
          if (!usercopy) usercopy = this.state.legacyUsers.splice(0);
          idx = usercopy.indexOf(rec.message);
          if (idx === -1) {
            usercopy.concat(rec.message);
            changed = true;
          }
          break;
        case "user_loggedoff":
          if (!usercopy) usercopy = this.state.legacyUsers.splice(0);
          idx = usercopy.indexOf(rec.message);
          if (idx !== -1) {
            usercopy.splice(idx, 1);
            changed = true;
          }
          break;
      }
    });

    if (changed) {
      usercopy.sort();
      this.setState({ legacyUsers: usercopy });
    }
  }

  _legacyMessages() {
    const records = realtime_messages
      .find({ nid: { $gt: this._rm_index } }, { sort: { nid: 1 } })
      .fetch();

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

    if (Meteor.userId() !== null) {
      const _userdata = this.getRegisteredUsers();
      this._usersFromMessages();
      userdata = _userdata.map(function(user) {
        return user.username;
      });
      userdata.concat(this.state.legacyUsers);
      userdata.sort();
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
