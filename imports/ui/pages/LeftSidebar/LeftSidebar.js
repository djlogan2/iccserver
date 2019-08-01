import React, { Component } from "react";
import MenuLinks from "./MenuLinks";

class LeftSidebar extends Component {
  render() {
    let links = [
      {
        label: "play",
        link: "#home",
        src: "../../../images/play-icon-white.png",
        active: true
      },
      {
        label: "learn",
        link: "#learn",
        src: "../../../images/learning-icon-white.png"
      },
      {
        label: "connect",
        link: "#connect",
        src: "../../../images/connect-icon-white.png"
      },
      {
        label: "examine",
        link: "#examine",
        src: "../../../images/examine-icon-white.png"
      },
      {
        label: "topPlayers",
        link: "#top-players",
        src: "../../../images/top-player-icon-white.png"
      },
      {
        label: "logIn",
        link: "#log-in",
        src: "../../../images/login-icon-white.png"
      },
      {
        label: "singUp",
        link: "#sign-up",
        src: "../../../images/signup-icon-white.png"
      },
      {
        label: "help",
        link: "#help",
        src: "../../../images/help-icon-white.png"
      }
    ];

    return <MenuLinks links={links} CssManager={this.props.CssManager} />;
  }
}
export default LeftSidebar;
