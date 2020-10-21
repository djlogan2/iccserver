import React from "react";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "./components/Css/CssManager";
import AppWrapper from "./components/AppWrapper";
import Loading from "./components/Loading";
import { mongoCss } from "../../api/client/collections";

export default class HomeContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.Main = {};
    this.state = {
      isAuthenticated: Meteor.userId() !== null,
      subscription: {
        css: Meteor.subscribe("css"),
        gameRequests: Meteor.subscribe("game_requests")
      }
    };
    this.examineActionHandler = this.examineActionHandler.bind(this);
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

  componentWillUnmount() {
    this.state.subscription.css.stop();
    this.state.subscription.gameRequests.stop();
  }

  examineActionHandler(action) {
    window.location.href = "/play";
  }

  render() {
    const systemCSS = this._systemCSS();
    if (systemCSS === undefined || systemCSS.length === 0) {
      return <Loading isPure={true} />;
    }
    const css = new CssManager(this._systemCSS());
    let w = this.state.width;
    let h = this.state.height;
    if (!w) w = window.innerWidth;
    if (!h) h = window.innerHeight;
    w /= 2;
    return (
      <AppWrapper cssManager={css}>
        <div className="col-sm-10 col-md-10" style={css.parentPopup(h, w)}>
          <div className="home-middle-section">
            <div className="home-slider">
              <img src={css.buttonBackgroundImage("homeImage")} alt="Home" />
            </div>
            <div className="home-description">
              {/* {translator("mainContent")} */}
              {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
              veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur. */}
            </div>
          </div>
        </div>
      </AppWrapper>
    );
  }
}
