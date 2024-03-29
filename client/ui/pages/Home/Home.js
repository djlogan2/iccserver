import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../imports/api/client/collections";
import { translate } from "../../HOCs/translate";
import { withDynamicStyles } from "../../HOCs/withDynamicStyles";

class Home extends React.Component {
  render() {
    const { classes, translate } = this.props;

    return (
      <>
        <div>
          <img
            className={classes.image}
            src="images/home-page/home-top.jpg"
            alt={translate("homeImage")}
          />
        </div>
      </>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.homeCss"),
  translate("Common.Home")
)(Home);
