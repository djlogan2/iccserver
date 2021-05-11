import React from "react";
import { compose } from "redux";
import AppWrapper from "../components/AppWrapper";
import { mongoCss } from "../../../api/client/collections";
import { withTracker } from "meteor/react-meteor-data";
import { translate } from "../../HOCs/translate";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

class Home extends React.Component {
  render() {
    const { classes, translate } = this.props;

    return (
      <AppWrapper>
        <div>
          <img
            className={classes.image}
            src="images/home-page/home-top.jpg"
            alt={translate("homeImage")}
          />
        </div>
      </AppWrapper>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Common.Home")
)(Home);
