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

    const ph = this.props.side / 10;
    const pw = this.props.side / 10;

    let _user_side = pw / 1.3;

    let userPicture = this.props.cssmanager.userPicture(this.props.side * 0.08);
    Object.assign(userPicture, { display: "inline-block", float: "left" });
    let tagline = this.props.cssmanager.tagLine();
    Object.assign(tagline, { marginTop: "5px", float: "left" });
    let userflag = this.props.cssmanager.userFlag(this.props.side * 0.07);
    Object.assign(userflag, {
      float: "left",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)"
    });

    return (
      <div
        style={{
          width: this.props.side * 0.8,
          display: "inline-block",
          marginTop: "5px",
          marginBottom: "5px",
          position: "relative"
        }}
      >
        <div
          style={{ width: this.props.side * 0.45, display: "inline-block", position: "relative" }}
        >
          <img
            style={userPicture}
            src={`images/${userpic}`}
            //src="images/player-img-top.png"
            alt="user"
          />
          <div style={tagline}>
            <div
              style={{
                display: "inline-block",
                maxWidth: this.props.side * 0.25,
                wordBreak: "break-word",
                verticalAlign: "middle",
                marginTop: "5px"
              }}
            >
              <a
                href="#/"
                target="_blank"
                style={{
                  color: "#fff",
                  fontSize: this.props.side * 0.022,
                  fontWeight: "600",
                  marginRight: "15px",
                  display: "block",
                  width: "100%"
                }}
              >
                {this.props.PlayerData.name}({this.props.PlayerData.rating})
              </a>
            </div>

            <div style={{ position: "absolute", bottom: "0" }}>
              <span
                style={{
                  color: this.props.turnColor,
                  fontSize: this.props.side * 0.019
                }}
              >
                {this.props.Playermsg}
              </span>
            </div>
          </div>
          <img style={userflag} src={this.props.cssmanager.flags("us")} alt="us" />
        </div>

        <div style={{ width: this.props.side * 0.35, display: "inline-block" }}>
          <FallenSoldier
            cssmanager={this.props.cssmanager}
            side={this.props.side * 0.35}
            color={this.props.color}
            FallenSoldiers={this.props.FallenSoldiers}
          />
        </div>
      </div>
    );
  }
}
