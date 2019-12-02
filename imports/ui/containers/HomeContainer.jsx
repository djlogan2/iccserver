import React from "react";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import LeftSidebar from "../pages/LeftSidebar/LeftSidebar";
import { mongoCss } from "../../api/collections";

export default class HomeContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.Main = {
      LeftSection: {
        MenuLinks: links
      }
    };
    this.state = {
      isAuthenticated: Meteor.userId() !== null,
      visible: false,
      subscription: {
        css: Meteor.subscribe("css")
      }
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ visible: !this.state.visible });
  }
  _systemCSS() {
    return mongoCss.findOne({ type: "system" });
  }

  componentWillMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  componentDidMount() {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/login");
    }
  }
  /*
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isAuthenticated) {
      this.props.history.push("/home");
    }
  } */
  componentWillUnmount() {
    this.state.subscription.css.stop();
  }
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  render() {
    const systemCSS = this._systemCSS();
    let translator = i18n.createTranslator(
      "Common.HomeContainer",
      this.getLang()
    );
    if (systemCSS === undefined || systemCSS.length === 0)
      return <div>Loading...</div>;
    const css = new CssManager(this._systemCSS());
    let buttonStyle;
    if (this.state.visible === true) {
      buttonStyle = "toggleClose";
    } else {
      buttonStyle = "toggleOpen";
    }
    let w = this.state.width;
    let h = this.state.height;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
    return (
      <div className="home">
        <div className="row1">
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
                  <img src="images/logo-white-lg.png" alt="" />
                </div>
                <button
                  style={css.buttonStyle(buttonStyle)}
                  onClick={this.toggleMenu}
                >
                  <img
                    src={css.buttonBackgroundImage("toggleMenu")}
                    style={css.toggleMenuHeight()}
                    alt="toggle menu"
                  />
                </button>
                <LeftSidebar
                  cssmanager={css}
                  LefSideBoarData={this.Main.LeftSection}
                  history={this.props.history}
                />
              </div>
            </aside>
          </div>

          <div className="col-sm-10 col-md-10" style={css.parentPopup(h, w)}>
            <div className="home-middle-section">
              <div className="home-slider">
                <img src="images/home-page/home-top.jpg" alt="toggle menu" />
              </div>
              <div className="home-description">
                {/* {translator("mainContent")} */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est
                laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
                aute irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

let links = [
  {
    label: "play",
    link: "play",
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
    label: "logout",
    link: "#",
    src: "../../../images/login-icon-white.png"
  },
  {
    label: "help",
    link: "#help",
    src: "../../../images/help-icon-white.png"
  }
];
