import React, { Component } from "react";
import FallenSoldier from "./FallenSoldier";
export default class Player extends Component {
  render() {
    /* 
    const ph = this.props.side / 9;
    const pw = this.props.side / 9; */
    let userpic;
    if (!!this.props.PlayerData.userPicture && this.props.PlayerData.userPicture !== undefined)
      userpic = this.props.PlayerData.userPicture;
    else userpic = "player-img-top.png";

    const ph = this.props.side / 8.7;
    const pw = this.props.side / 8.7;

    this._square_side = Math.min(ph, pw);

    let _user_side = pw / 1.4;
    return (
      <div
        style={{
          width: this.props.side * 0.75,
          display: "inline-block",
          marginTop: "5px",
          marginBottom: "5px",
          position: "relative"
        }}
      >
        <div style={{ width: pw * 3.7, display: "inline-block" }}>
          <img
            style={this.props.cssmanager.userPicture(_user_side)}
            src={`images/${userpic}`}
            //src="images/player-img-top.png"
            alt="user"
          />
          <div style={this.props.cssmanager.tagLine()}>
            <div>
              <a
                href="#/"
                target="_blank"
                style={{
                  color: "#fff",
                  fontSize: pw / 4,
                  fontWeight: "600",
                  marginRight: "15px"
                }}
              >
                {this.props.PlayerData.name}({this.props.PlayerData.rating})
              </a>
            </div>

            <div style={{ position: "absolute", bottom: "0" }}>
              <span
                style={{
                  color: this.props.turnColor,
                  fontSize: pw / 6
                }}
              >
                {this.props.Playermsg}
              </span>
            </div>
          </div>
          <img
            style={this.props.cssmanager.userFlag(_user_side)}
            src={this.props.cssmanager.flags("us")}
            alt="us"
          />
        </div>

        <div style={{ width: pw * 2, display: "inline-block" }}>
          <FallenSoldier
            cssmanager={this.props.cssmanager}
            side={pw}
            color={this.props.color}
            FallenSoldiers={this.props.FallenSoldiers}
          />
        </div>
      </div>
    );
  }
}
