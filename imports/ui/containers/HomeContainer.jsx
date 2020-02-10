import React from "react";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import i18n from "meteor/universe:i18n";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "../pages/components/Css/CssManager";
import LeftSidebar from "../pages/LeftSidebar/LeftSidebar";
import { mongoCss, GameRequestCollection } from "../../api/collections";

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
      subscription: {
        css: Meteor.subscribe("css"),
        gameRequests: Meteor.subscribe("game_requests")
      }
    };
    this.examineActionHandler = this.examineActionHandler.bind(this);
  }
  gameRequest = (title, param, css) => {
    return (
      <div style={css.outerPopupMain()}>
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#fff",
              fontSize: "17px"
            }}
          >
            {title}
          </h3>

          <button onClick={this.gameAccept.bind(this, param)} style={css.innerPopupMain()}>
            Accept
          </button>
          <button onClick={this.gameDecline.bind(this, param)} style={css.innerPopupMain()}>
            Decline
          </button>
        </div>
      </div>
    );
  };
  gameAccept = Id => {
    Meteor.call("gameRequestAccept", "gameAccept", Id);
    this.props.history.push("/play");
  };
  gameDecline = Id => {
    Meteor.call("gameRequestDecline", "gameDecline", Id);
  };
  renderGameRequest() {
    return GameRequestCollection.findOne(
      {
        $or: [
          {
            receiver_id: Meteor.userId()
          },
          { type: "seek" }
        ]
      },
      {
        sort: { create_date: -1 }
      }
    );
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
    this.state.subscription.gameRequests.stop();
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
  examineActionHandler(action) {
    window.location.href = "/play";
  }
  render() {
    const systemCSS = this._systemCSS();
    const gameRequest = this.renderGameRequest();
    let translator = i18n.createTranslator("Common.HomeContainer", this.getLang());
    if (systemCSS === undefined || systemCSS.length === 0) return <div>Loading...</div>;
    const css = new CssManager(this._systemCSS());
    let informativePopup = null;
    if (gameRequest !== undefined) {
      if (gameRequest.type === "match" && gameRequest.receiver_id === Meteor.userId())
        informativePopup = this.gameRequest(
          "Opponent has requested for a game",
          gameRequest._id,
          css
        );
    }
    let w = this.state.width;
    let h = this.state.height;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
    return (
      <div className="home">
        <div className="row1">
          <LeftSidebar
            cssmanager={css}
            LefSideBoarData={this.Main.LeftSection}
            history={this.props.history}
            examineAction={this.examineActionHandler}
          />
          <div className="col-sm-10 col-md-10" style={css.parentPopup(h, w)}>
            {informativePopup}
            <div className="home-middle-section">
              <div className="home-slider">
                <img src={css.buttonBackgroundImage("homeImage")} alt="Home" />
              </div>
              <div className="home-description">
                {/* {translator("mainContent")} */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                esse cillum dolore eu fugiat nulla pariatur.
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
