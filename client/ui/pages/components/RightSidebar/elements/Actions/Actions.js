import classNames from "classnames";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import { RESOURCE_EDITOR } from "../../../../../../constants/resourceConstants";
import { translate } from "../../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../../HOCs/withDynamicStyles";
import PrimaryButton from "../../../Button/PrimaryButton";

const Actions = compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.actionsCss"),
  translate("Common.rightBarTop"),
  withRouter
)(({ translate, playComputer, history, classes }) => (
  <div className={classes.main}>
    <PrimaryButton
      className={classNames(classes.link, classes.element)}
      type="primary"
      id="editor-button"
      onClick={() => history.push(RESOURCE_EDITOR)}
    >
      {translate("editor")}
    </PrimaryButton>
    <PrimaryButton
      id="play-computer-button"
      className={classes.element}
      type="primary"
      onClick={playComputer}
    >
      {translate("playComputer")}
    </PrimaryButton>
  </div>
));

export default Actions;
