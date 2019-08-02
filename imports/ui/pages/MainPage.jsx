import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import RightSidebar from "./RightSidebar/RightSidebar";
import "./css/ChessBoard";
import "./css/leftsidebar";
import "./css/RightSidebar";
import MiddleBoard from "./MiddleSection/MiddleBoard";
import RealTime from "../../../lib/client/RealTime";
import CssManager from "../pages/components/Css/CssManager";
const css = new CssManager("developmentcss");

export default class MainPage extends TrackerReact(Component) {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      visible: false,
      subscription: {
        tasks: Meteor.subscribe("userData")
      }
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.Main = {
      LeftSection: {
        MenuLinks: links
      },
      MiddleSection: {
        TopPlayer: {
          Rating: "2250",
          Name: "Mac",
          Flag: "us"
        },
        BottomPlayer: {
          Rating: "1525",
          Name: "Max",
          Flag: "us"
        },
        Clock: {
          Timer: 1500
        }
      },
      RightSection: {
        MoveList: {
          GameMove:
            "1. e4 d5 2. exd5 b5 3. c3 c6 4. dxc6 b4 5. ce2 a6 6. d4 a77. c3 b7 8. cxb7 xb7 9. f4 xd4 10. xd4 e5 11. xe512...bxa3 13.Qxa3 Qb814. Rfd1 Ra7 15. b3 Rb716. Rab1 Nd4 17. Nxd4"
        }
      }
    };
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    return (
      <div className="main">
        <div className="row">
          <div className="col-sm-2 left-col">
            <aside>
              <div
                className={
                  this.state.visible
                    ? "sidebar left device-menu fliph"
                    : "sidebar left device-menu"
                }
              >
                <div className="pull-left image">
                  <img src="../../../images/logo-white-lg.png" alt="" />
                </div>
                <div className="float-right menu-close-icon">
                  <button onClick={this.toggleMenu} className="button-left">
                    <span className="fa fa-fw fa-bars " />
                  </button>
                </div>
                <LeftSidebar
                  CssManager={css}
                  LeftProp={this.Main.LeftSection}
                />
              </div>
            </aside>
          </div>
          <div className="col-sm-5 col-md-8 col-lg-5 ">
            <MiddleBoard
              CssManager={css}
              MiddleProp={this.Main.MiddleSection}
            />
          </div>
          <br />
          <br />
          <br />
          <div className="col-sm-4 col-md-4 col-lg-4 right-section">
            <RightSidebar CssManager={css} RightProp={this.Main.RightSection} />
          </div>
        </div>
      </div>
    );
  }
}

MainPage.propTypes = {
  username: PropTypes.string
};

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
