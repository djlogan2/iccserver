import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import { translate } from "../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../HOCs/withDynamicStyles";

const ObserveBlock = ({ translate, classes }) => (
  <div className={classes.container}>{translate("inProgress")}</div>
);

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.observeBlockCss"),
  translate("Play.ObserveBlock")
)(ObserveBlock);
