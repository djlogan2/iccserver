import React from "react";
import { Meteor } from "meteor/meteor";
import { compose } from "redux";
import CssManager from "./components/Css/CssManager";
import AppWrapper from "./components/AppWrapper";
import Loading from "./components/Loading";
import { mongoCss } from "../../api/client/collections";
import { RESOURCE_PLAY } from "../../constants/resourceConstants";
import { withTracker } from "meteor/react-meteor-data";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: Meteor.userId() !== null
    };
  }

  examineActionHandler = () => {
    const { history } = this.props;

    history.push(RESOURCE_PLAY);
  };

  render() {
    const { css } = this.props;
    let { width: w, height: h } = this.state;

    if (!css) {
      return <Loading isPure={true} />;
    }

    const cssManager = new CssManager(css);

    return (
      <AppWrapper>
        <div className="col-sm-10 col-md-10" style={cssManager.parentPopup(h, w)}>
          <div className="home-middle-section">
            <div className="home-slider">
              <img src={cssManager.buttonBackgroundImage("homeImage")} alt="Home" />
            </div>
            <div className="home-description" />
          </div>
        </div>
      </AppWrapper>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne({ type: "system" })
    };
  })
)(Home);
