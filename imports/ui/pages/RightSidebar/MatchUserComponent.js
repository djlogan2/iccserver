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
      },
      user: null,
      wild_number: 0,
      //DOUBT: what is wild_number and wher come from ?
      // ANSWER: Wild is a type of chess in the legacy server. Currently v2 supports only wild 0,
      //         but eventually we will write rules engines for the rest, and perhaps even support
      //         playing them from v2 <-> v1 as well.
      //         See this for more info: https://www.chessclub.com/help/wild
      type: "standard",
      rated: true,
      is_adjourned: false,
      minute: 10,
      inc: 0,
      receiver_time: 10,
      receiver_inc: 0,
      color: "random"
    };
  }

  componentWillUnmount() {
    this.state.subscription.loggedOnUsers.stop();
    this.state.subscription.legacyUsers.stop();
  }

  removeUser() {
    this.setState({
      user: null,
      wild_number: 0,
      type: "standard",
      rated: false,
      is_adjourned: false,
      minute: 10,
      inc: 0,
      color: "random"
    });
  }
  handelUserClick(user) {
    this.setState({ user: user });
  }
  handleChangeMinute = event => {
    this.setState({ minute: parseInt(event.target.value) });
  };
  handleChangeSecond = event => {
    this.setState({ inc: parseInt(event.target.value) });
  };
  handleChangeGameType = event => {
    this.setState({ type: event.target.value });
  };
  handleChangeColor = event => {
    this.setState({ color: event.target.value });
  };
  handleRatedChange = event => {
    this.setState({ rated: event.target.checked });
  };
  handleMatchSubmit() {

    let color = this.state.color === "random" ? null : this.state.color;

    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      this.state.user,
      this.state.wild_number,
      this.state.type,
      this.state.rated,
      this.state.is_adjourned,
      this.state.minute,
      this.state.inc,
      this.state.minute,
      this.state.inc,
      color
    );
    this.setState({
      user: null,
      wild_number: 0,
      type: "standard",
      rated: false,
      is_adjourned: false,
      minute: 10,
      inc: 0,
      color: "random"
    });
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
    let translator = i18n.createTranslator("Common.MatchUserSubTab", this.getLang());
    if (Meteor.userId() == null) return;
    const localUsers = Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
    const legacyUsers = legacyUsersC.find({}).fetch();
    const _userdata = localUsers.map(user => user.username);
    const userdata = _userdata.concat(legacyUsers.map(user => user.username + "(L)"));
    //  userdata.sort();
    let matchForm = null;
    if (this.state.user === null) {
      //DOUBT: This code remove soon
      matchForm = (
        <div style={this.props.cssmanager.subTabHeader()}>
          {userdata.map((user, index) => (
            <div key={index}>
              <button
                onClick={this.handelUserClick.bind(this, user)}
                style={this.props.cssmanager.matchUserButton()}
              >
                {user}
              </button>
            </div>
          ))}
        </div>
      );
    } else {
      //TODO: We will make this component and add cssmanager, i18n
      matchForm = (
        <div style={{ marginBottom: "20px" }}>
          <button style={this.props.cssmanager.buttonStyle()} onClick={this.removeUser.bind(this)}>
            <img src="images/delete-sign.png" />
          </button>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "50%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Time Controll</label>
              <span style={{ paddingRight: "10px" }}>
                <select onChange={this.handleChangeMinute} value={this.state.minute}>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
              </span>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Minute</label>
            </div>
            <div style={{ width: "50%", float: "left" }}>
              <span style={{ paddingRight: "10px" }}>
                <select onChange={this.handleChangeSecond} value={this.state.inc}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </span>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Seconds per move</label>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "50%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Type of Game</label>
              <span style={{ paddingRight: "10px" }}>
                <select onChange={this.handleChangeGameType} value={this.state.type}>
                  <option value="standard">Standard</option>
                  <option value="chess">Chess</option>
                </select>
              </span>
            </div>
            <div style={{ width: "50%", float: "left" }}>
              <span style={{ paddingRight: "10px" }}>
                <input
                  type="checkbox"
                  checked={this.state.rated}
                  onChange={this.handleRatedChange}
                />
                <label style={{ fontWeight: "300", paddingRight: "10px" }}>Rated</label>
              </span>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ width: "100%", float: "left" }}>
              <label style={{ fontWeight: "300", paddingRight: "10px" }}>Pick a color</label>
              <input
                type="radio"
                value="white"
                checked={this.state.color === "white"}
                onChange={this.handleChangeColor}
              />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                white
              </label>
              <input
                type="radio"
                value="black"
                checked={this.state.color === "black"}
                onChange={this.handleChangeColor}
              />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                Black
              </label>
              <input
                type="radio"
                value="random"
                checked={this.state.color === "random"}
                onChange={this.handleChangeColor}
              />
              <label
                style={{
                  fontWeight: "300",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  verticalAlign: "top"
                }}
              >
                Random
              </label>
            </div>
          </div>
          <div style={{ width: "100%", marginBottom: "15px", float: "left" }}>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={this.handleMatchSubmit.bind(this)}
                style={{
                  backgroundColor: "#1565c0",
                  textAlign: "center",
                  padding: "10px 20px",
                  border: "none",
                  color: "#FFF",
                  borderRadius: "5px"
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      );
    }

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
            <div label={translator("friends")}>{matchForm}</div>

            <div label={translator("recentOpponent")}>
              <div style={this.props.cssmanager.subTabHeader()}>
                <div>
                  <button style={this.props.cssmanager.matchUserButton()}>User-1</button>
                </div>
                <div>
                  <button style={this.props.cssmanager.matchUserButton()}>User-2</button>
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
