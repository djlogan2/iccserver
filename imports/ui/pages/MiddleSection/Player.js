import React, { Component } from "react";
import Clock from "./ClockComponent";

export default class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: props.PlayerData.Timer,
      isActive: props.PlayerData.IsActive
    };
  }

  render() {
    const ph = this.props.side / 9;
    const pw = this.props.side / 9;

    let _user_side = Math.min(ph, pw);

    return (
      <div
        style={{
          width: this.props.side
        }}
      >
        <img
          style={this.props.cssmanager.userPicture(_user_side)}
          src={`images/${this.props.PlayerData.UserPicture}`}
          alt="user"
        />
        <div style={this.props.cssmanager.tagLine()}>
          <a href="#/" target="_blank" style={this.props.cssmanager.userName()}>
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <img
            style={this.props.cssmanager.userFlag(_user_side)}
            src={this.props.cssmanager.flags(this.props.PlayerData.Flag)}
            alt={this.props.PlayerData.Flag}
          />
        </div>
        <Clock
          cssmanager={this.props.cssmanager}
          ClockData={this.state}
          side={this.props.side}
        />
      </div>
    );
  }
}
