import React from "react";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";
import { withDynamicStyles } from "../../../HOCs/withDynamicStyles";

const BoardWrapper = ({ children, classes }) => <div className={classes.container}>{children}</div>;

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.boardWrapperCss")
)(BoardWrapper);
