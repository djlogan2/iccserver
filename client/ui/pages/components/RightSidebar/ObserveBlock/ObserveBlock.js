import React from "react";
import { compose } from "redux";

import { translate } from "../../../../HOCs/translate";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const ObserveBlock = ({ translate, classes }) => (
  <div className={classes.container}>{translate("inProgress")}</div>
);

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Play.ObserveBlock")
)(ObserveBlock);
