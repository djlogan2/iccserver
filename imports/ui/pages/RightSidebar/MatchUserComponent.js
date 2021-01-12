import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import GameForm from "./GameForm";
import SubTabs from "./SubTabs";
import { DynamicRatingsCollection } from "../../../api/client/collections";

import { translate } from "../../HOCs/translate";

const legacyUsersC = new Mongo.Collection("legacyUsers");

class MatchUserComponent extends TrackerReact(Component) {
  constructor(props) {
    super(props);
    this.state = {
      subscription: {
        loggedOnUsers: Meteor.subscribe("loggedOnUsers")
      },
      user: null,
      userId: null,
      wildNumber: 0,
      ratingType: "standard",
      rated: true,
      isAdjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    };
  }

  componentWillUnmount() {
    this.state.subscription.loggedOnUsers.stop();
  }

  removeUser = () => {
    this.setState({
      user: null,
      wildNumber: 0,
      ratingType: "standard",
      rated: false,
      isAdjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    });
  };

  handelUserClick = (user, userId) => {
    this.setState({ user, userId });
  };

  handleChangeMinute = time => {
    this.setState({ time });
  };

  handleChangeSecond = inc => {
    this.setState({ inc });
  };

  handleChangeGameType = ratingType => {
    this.setState({ ratingType });
  };

  handleIncOrDelayTypeChange = incOrdelayType => {
    this.setState({ incOrdelayType });
  };

  handleChangeColor = color => {
    this.setState({ color });
  };

  handleRatedChange = rated => {
    this.setState({ rated });
  };

  handleMatchSubmit = () => {
    const {
      userId,
      wildNumber,
      ratingType,
      rated,
      isAdjourned,
      time,
      inc,
      incOrdelayType,
      color: stateColor
    } = this.state;

    const color = stateColor === "random" ? null : stateColor;
    Meteor.call(
      "addLocalMatchRequest",
      "matchRequest",
      userId,
      wildNumber,
      ratingType,
      rated,
      isAdjourned,
      time,
      inc,
      incOrdelayType,
      time,
      inc,
      incOrdelayType,
      color
    );

    this.setState({
      userId: null,
      user: null,
      wildNumber: 0,
      ratingType: "standard",
      rated: false,
      isAdjourned: false,
      time: 14,
      inc: 1,
      incOrdelayType: "inc",
      color: "random"
    });
  };

  toggleHover() {
    this.setState(prevState => {
      return { hover: !prevState.hover };
    });
  }

  getDynamicRatings() {
    return DynamicRatingsCollection.find({}).fetch();
  }

  render() {
    const { translate, cssManager } = this.props;
    const { user, ratingType, rated, time, inc, incOrdelayType, color } = this.state;

    if (!Meteor.userId()) {
      return;
    }

    const localUsers = Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch();
    const legacyUsers = legacyUsersC.find({}).fetch();
    //  const _userdata = localUsers.map(user => user.username);
    let userdata = localUsers.concat(legacyUsers.map(user => user.username + "(L)"));
    const userdata2 = ["User-1", "User-2", "User-3", "User-4"];
    //  userdata.sort();
    // this.rating=this.getDynamicRatings();
    let tabHading = cssManager.formMain();
    Object.assign(tabHading, { backgroundColor: "#eee", padding: "8px 5px", marginTop: "10px" });

    let matchForm;

    if (!user) {
      matchForm = (
        <div style={cssManager.subTabHeader()}>
          {userdata.map((user, index) => (
            <div key={index} className="userlist">
              <button
                onClick={() => this.handelUserClick(user.username, user._id)}
                style={cssManager.matchUserButton()}
              >
                {user.username}
              </button>
            </div>
          ))}
        </div>
      );
    } else {
      matchForm = (
        <div style={cssManager.subTabHeader()}>
          <div style={tabHading}>
            <div style={{ width: "75%", float: "left" }}>
              <label style={cssManager.formLabelStyle()}>User Name :</label>
              <span style={{ color: "#1565c0" }}>{user}</span>
            </div>
            <div style={{ width: "25%", float: "left", textAlign: "right" }}>
              <button style={cssManager.buttonStyle()} onClick={this.removeUser}>
                <img
                  src={cssManager.buttonBackgroundImage("deleteSign")}
                  alt={translate("deleteSign")}
                />
              </button>
            </div>
          </div>

          <GameForm
            cssManager={cssManager}
            handleChangeMinute={this.handleChangeMinute}
            handleChangeSecond={this.handleChangeSecond}
            handleChangeGameType={this.handleChangeGameType}
            handleChangeColor={this.handleChangeColor}
            handleRatedChange={this.handleRatedChange}
            handleIncOrDelayTypeChange={this.handleIncOrDelayTypeChange}
            handleSubmit={this.handleMatchSubmit}
            type={ratingType}
            rated={rated}
            minute={time}
            inc={inc}
            incOrdelayType={incOrdelayType}
            color={color}
          />
        </div>
      );
    }

    return (
      <div>
        <div style={cssManager.tabSeparator()} />
        <div style={cssManager.matchUserScroll()}>
          <div style={{ fontSize: "16px", padding: "0px 0px 15px 0px" }}>
            {translate("chooseMember")}
          </div>
          <SubTabs cssManager={cssManager}>
            <div label={translate("friends")}>{matchForm}</div>

            <div label={translate("recentOpponent")}>
              <div style={cssManager.subTabHeader()}>
                {userdata2.map((user, index) => (
                  <div key={index} className="userlist">
                    <button
                      onClick={() => this.handelUserClick(user)}
                      style={cssManager.matchUserButton()}
                    >
                      {user}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </SubTabs>
          <div style={{ fontSize: "16px", padding: "15px 0px" }}>
            {translate("sendLinkToAnyone")}
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
                {translate("createChallangeLink")}
              </button>
            </div>
            <div style={{ display: "inline-block", paddingLeft: "20px" }}>
              {translate("tenMin")}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default translate("Common.MatchUserSubTab")(MatchUserComponent);
