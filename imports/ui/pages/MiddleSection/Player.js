import React, { Component } from "react";
export default class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: props.PlayerData.Timer,
      isActive: props.PlayerData.IsActive
    };
  }

  render() {
    const ph = this.props.side / 12;
    const pw = this.props.side / 12;

    let _user_side = Math.min(ph, pw);
    return (
      <div style={{ width: pw * 8, display: "inline-block" }}>
        <img
          style={this.props.cssmanager.userPicture(_user_side)}
          src={`images/${this.props.PlayerData.UserPicture}`}
          alt="user"
        />
        <div style={this.props.cssmanager.tagLine()}>
          <a
            href="#/"
            target="_blank"
            style={{
              color: "#fff",
              fontSize: pw / 3,
              fontWeight: "600",
              marginRight: "15px"
            }}
          >
            {this.props.PlayerData.Name}({this.props.PlayerData.Rating})
          </a>
          <img
            style={this.props.cssmanager.userFlag(_user_side)}
            src={this.props.cssmanager.flags(this.props.PlayerData.Flag)}
            alt={this.props.PlayerData.Flag}
          />
        </div>
      </div>
    );
  }
}
