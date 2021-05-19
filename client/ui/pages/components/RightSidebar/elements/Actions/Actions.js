import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import { translate } from "../../../../../HOCs/translate";
import { RESOURCE_EDITOR } from "../../../../../../constants/resourceConstants";
import PrimaryButton from "../../../Button/PrimaryButton";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import classNames from "classnames";

const Actions = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Common.rightBarTop"),
  withRouter
)(({ translate, playComputer, history, classes }) => (
  <div className={classes.main}>
    <PrimaryButton
      className={classNames(classes.link, classes.element)}
      type="primary"
      onClick={() => history.push(RESOURCE_EDITOR)}
    >
      {translate("editor")}
    </PrimaryButton>
    <PrimaryButton className={classes.element} type="primary" onClick={playComputer}>
      {translate("playComputer")}
    </PrimaryButton>
  </div>
));

export default Actions;
