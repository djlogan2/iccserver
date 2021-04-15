import React from "react";
import { compose } from "redux";
import CssManager from "./components/Css/CssManager";
import AppWrapper from "./components/AppWrapper";
import Loading from "./components/Loading";
import { mongoCss } from "../../api/client/collections";
import { RESOURCE_PLAY } from "../../constants/resourceConstants";
import { withTracker } from "meteor/react-meteor-data";
import { translate } from "../HOCs/translate";

class Home extends React.Component {
  examineActionHandler = () => {
    const { history } = this.props;

    history.push(RESOURCE_PLAY);
  };

  render() {
    const { css, translate } = this.props;

    if (!css) {
      return <Loading isPure={true} />;
    }

    const width = window.innerWidth / 2;
    const height = window.innerHeight;

    const cssManager = new CssManager(css.systemCss);

    return (
      <AppWrapper>
        <div className="col-sm-10 col-md-10" style={cssManager.parentPopup(height, width)}>
          <div className="home-middle-section">
            <div className="home-slider">
              <img
                src={cssManager.buttonBackgroundImage("homeImage")}
                alt={translate("homeImage")}
              />
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
      css: mongoCss.findOne()
    };
  }),
  translate("Common.Home")
)(Home);
