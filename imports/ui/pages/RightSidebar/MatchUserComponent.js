import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import GameForm from "./GameForm";

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
      type: "standard",
      rated: true,
      is_adjourned: false,
      minute: 10,
      inc: 1,
      incOrdelayType: "inc",
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
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    });
  }
  handelUserClick = user => {
    this.setState({ user: user });
  };
  handleChangeMinute = minute => {
    this.setState({ minute: minute });
  };
  handleChangeSecond = inc => {
    this.setState({ inc: inc });
  };
  handleChangeGameType = type => {
    this.setState({ type: type });
  };
  handleIncOrDelayTypeChange = incOrDelay => {
    this.setState({ incOrdelayType: incOrDelay });
  };
  handleChangeColor = color => {
    this.setState({ color: color });
  };
  handleRatedChange = rate => {
    this.setState({ rated: rate });
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
      this.state.incOrdelayType,
      this.state.minute,
      this.state.inc,
      this.state.incOrdelayType,
      color
    );
    this.setState({
      user: null,
      wild_number: 0,
      type: "standard",
      rated: false,
      is_adjourned: false,
      minute: 10,
      inc: 1,
      incOrdelayType: "inc",
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
      matchForm = (
        <div style={this.props.cssmanager.subTabHeader()}>
          <div style={this.props.cssmanager.formMain()}>
            <div style={{ width: "75%", float: "left", paddingTop: "10px" }}>
              <label style={this.props.cssmanager.formLabelStyle()}>
                User Name : {this.state.user}
              </label>
            </div>
            <div style={{ width: "25%", float: "left", textAlign: "right", paddingTop: "10px" }}>
              <button
                style={this.props.cssmanager.buttonStyle()}
                onClick={this.removeUser.bind(this)}
              >
                <img src="images/delete-sign.png" />
              </button>
            </div>
          </div>

          <GameForm
            cssmanager={this.props.cssmanager}
            handleChangeMinute={this.handleChangeMinute}
            handleChangeSecond={this.handleChangeSecond}
            handleChangeGameType={this.handleChangeGameType}
            handleChangeColor={this.handleChangeColor}
            handleRatedChange={this.handleRatedChange}
            handleIncOrDelayTypeChange={this.handleIncOrDelayTypeChange}
            handleSubmit={this.handleMatchSubmit.bind(this)}
            type={this.state.type}
            rated={this.state.rated}
            minute={this.state.minute}
            inc={this.state.inc}
            incOrdelayType={this.state.incOrdelayType}
            color={this.state.color}
          />
        </div>
      );
    }

    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <div style={this.props.cssmanager.matchUserScroll()}>
          <div style={{ fontSize: "16px", padding: "15px 0px" }}>Option 1 - Choose a Member</div>
        

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
          {/*   <div
            style={{
              background: "#ccc",
              width: "100%",
              height: "2px",
              margin: "15px 0px"
            }}
          /> */}
          <div style={{ fontSize: "16px", padding: "15px 0px" }}>
            Option 2 - Send a link for anyone to play
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
            <div style={{ display: "inline-block", paddingLeft: "20px" }}>10 min</div>
          </div>
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
    console.log(this.props.children[0]);
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