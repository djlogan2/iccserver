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
    return (
      <div className="board-player-top">
        <img
          className="user-pic"
          src={`images/${this.props.PlayerData.UserPicture}`}
          alt=""
          title=""
        />
        <div style={this.props.cssmanager.tagLine()}>
          <a href="#/" target="_blank" style={this.props.cssmanager.userName()}>
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <i style={this.props.cssmanager.flags(this.props.PlayerData.Flag)} />
        </div>
        <Clock cssmanager={this.props.cssmanager} ClockData={this.state} />
      </div>
    );
  }
}
