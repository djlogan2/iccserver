import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
import TrackerReact from "meteor/ultimatejs:tracker-react";
const legacyUsersC = new Mongo.Collection("legacyUsers");

export default class MatchUserComponent extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      trial: 0,
      subscription: {
        loggedOnUsers: Meteor.subscribe("loggedOnUsers"),
        legacyUsers: Meteor.subscribe("legacyUsers")
      }
    };
  }

  componentWillUnmount() {
    this.state.subscription.loggedOnUsers.stop();
    this.state.subscription.legacyUsers.stop();
  }
  gameStart(user) {
    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      user,
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );
  }
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    let translator = i18n.createTranslator(
      "Common.MatchUserSubTab",
      this.getLang()
    );
    if (Meteor.userId() == null) return;
    const localUsers = Meteor.users
      .find({ _id: { $ne: Meteor.userId() } })
      .fetch();
    const legacyUsers = legacyUsersC.find({}).fetch();
    const _userdata = localUsers.map(user => user.username);
    const userdata = _userdata.concat(
      legacyUsers.map(user => user.username + "(L)")
    );
    //  userdata.sort();
    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <div style={this.props.cssmanager.matchUserScroll()}>
          {/*           <div style={{ fontSize: "16px", paddingBottom: "15px" }}>
            option 1 - send a link for anyone to play
          </div>
          <div>
            <div style={{ display: "inline-block" }}>
              <button
                style={{
                  background: "#1565c0",
                  border: "0px",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "6px"
                }}
              >
                Create chellange Link
              </button>
            </div>
            <div style={{ display: "inline-block", paddingLeft: "20px" }}>
              10 min
            </div>
          </div>
          <div
            style={{
              background: "#ccc",
              width: "100%",
              height: "2px",
              margin: "15px 0px"
            }}
          />
          <div style={{ fontSize: "16px", paddingBottom: "15px" }}>
            option 2 - Choose a Member
          </div>
          <div style={{ marginBottom: "20px" }}>
            <input
              style={{
                borderRadius: "5px",
                border: "#ccc 1px solid",
                padding: "6px",
                width: "250px"
              }}
              type="text"
              name="search"
              placeholder="search"
            />
          </div> */}

          <SubTabs cssmanager={this.props.cssmanager}>
            <div label={translator("friends")}>
              <div style={this.props.cssmanager.subTabHeader()}>
                {userdata
                  ? userdata.map((user, index) => (
                      <div key={index}>
                        <button
                          onClick={this.gameStart.bind(this, user)}
                          style={this.props.cssmanager.matchUserButton()}
                        >
                          {user}
                        </button>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <div label={translator("recentOpponent")}>
              <div style={this.props.cssmanager.subTabHeader()}>
                <div>
                  <button style={this.props.cssmanager.matchUserButton()}>
                    User-1
                  </button>
                </div>
                <div>
                  <button style={this.props.cssmanager.matchUserButton()}>
                    User-2
                  </button>
                </div>
              </div>
            </div>
          </SubTabs>
        </div>
      </div>
    );
  }
}

class SubTabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
    cssmanager: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.children[0].props.label
    };
  }

  onClickTabItem = tab => {
    this.setState({ activeTab: tab });
  };

  render() {
    const {
      onClickTabItem,
      props: { children },
      state: { activeTab }
    } = this;

    return (
      <div className="tab">
        <ol className="tab-list">
          {children.map(child => {
            const { label } = child.props;

            return (
              <Tab
                activeTab={activeTab}
                key={label}
                label={label}
                onClick={onClickTabItem}
                cssmanager={this.props.cssmanager}
              />
            );
          })}
        </ol>
        <div className="tab-content">
          {children.map(child => {
            if (child.props.label !== activeTab) return undefined;
            return child.props.children;
          })}
        </div>
      </div>
    );
  }
}

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label }
    } = this;
    //TODO : Now we have working on.we will remove soon
    let tablistItem = {
      display: "inline-block",
      listStyle: "none",
      marginBottom: "-1px",
      padding: "1rem 1.75rem",
      borderRadius: "0px 30px 0px 0px",
      border: "#ccc 1px solid",
      cursor: "pointer"
    };

    if (activeTab === label)
      tablistItem = {
        background: "#1565c0",
        color: "white",
        display: "inline-block",
        listStyle: "none",
        marginBottom: "-1px",
        padding: "1rem 1.75rem",
        border: "#ccc 0px solid",
        borderRadius: "0px 20px 0px 0px",
        cursor: "pointer"
      };

    return (
      <li style={tablistItem} onClick={onClick}>
        {label}
      </li>
    );
  }
}
