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
        <div style={this.props.CssManager.tagLine()}>
          <a href="#/" target="_blank" style={this.props.CssManager.userName()}>
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <i style={this.props.CssManager.flags(this.props.PlayerData.Flag)} />
        </div>
        <Clock CssManager={this.props.CssManager} ClockData={this.state} />
      </div>
    );
  }
}
