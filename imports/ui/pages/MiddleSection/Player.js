import React, { Component } from "react";
import Clock from "./ClockComponent";
import CssManager from "../../pages/components/Css/CssManager";

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
        <div style={CssManager.tagLine()}>
          <a href="#/" target="_blank" style={CssManager.userName()}>
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <i style={CssManager.flags(this.props.PlayerData.Flag)} />
        </div>
        <Clock ClockData={this.state} />
      </div>
    );
  }
}
