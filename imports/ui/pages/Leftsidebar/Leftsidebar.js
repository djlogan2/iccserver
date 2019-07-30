/* eslint-disable no-useless-constructor */
import React, { Component } from "react";
import MenuLinks from "./MenuLinks";
class LeftSidebar extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let links = [
      {
        label: "Play",
        link: "#home",
        src: "../../../images/play-icon-white.png",
        active: true
      },
      {
        label: "Learn",
        link: "#learn",
        src: "../../../images/learning-icon-white.png"
      },
      {
        label: "Connect",
        link: "#connect",
        src: "../../../images/connect-icon-white.png"
      },
      {
        label: "Examine",
        link: "#examine",
        src: "../../../images/examine-icon-white.png"
      },
      {
        label: "Top Players",
        link: "#top-players",
        src: "../../../images/top-player-icon-white.png"
      },
      {
        label: "Log in",
        link: "#log-in",
        src: "../../../images/login-icon-white.png"
      },
      {
        label: "Sign up",
        link: "#sign-up",
        src: "../../../images/signup-icon-white.png"
      },
      {
        label: "Help",
        link: "#help",
        src: "../../../images/help-icon-white.png"
      }
    ];

    return <MenuLinks links={links} />;
  }
}
export default LeftSidebar;
