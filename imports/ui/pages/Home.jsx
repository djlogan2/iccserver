import React from "react";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import CssManager from "./components/Css/CssManager";
import AppWrapper from "./components/AppWrapper";
import Loading from "./components/Loading";
import { mongoCss } from "../../api/client/collections";
import { resourceLogin, resourcePlay } from "../../constants/resourceConstants";

export default class HomeContainer extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: Meteor.userId() !== null,
      subscription: {
        gameRequests: Meteor.subscribe("game_requests")
      }
    };
  }

  _systemCSS() {
    return mongoCss.findOne({ type: "system" });
  }

  componentDidMount() {
    const { isAuthenticated } = this.state;

    if (!isAuthenticated) {
      const { history } = this.props;

      history.push(resourceLogin);
    }
  }

  componentDidUpdate() {
    const { isAuthenticated } = this.state;

    if (!isAuthenticated) {
      const { history } = this.props;
      history.push(resourceLogin);
    }
  }

  componentWillUnmount() {
    const { subscription } = this.state;

    subscription.gameRequests.stop();
  }

  examineActionHandler = () => {
    const { history } = this.props;

    history.push(resourcePlay);
  };

  render() {
    let { width: w, height: h } = this.state;
    const systemCSS = this._systemCSS();

    if (!systemCSS || !systemCSS.length) {
      return <Loading isPure={true} />;
    }

    const css = new CssManager(this._systemCSS());

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
            <div className="home-description" />
          </div>
        </div>
      </AppWrapper>
    );
  }
}
