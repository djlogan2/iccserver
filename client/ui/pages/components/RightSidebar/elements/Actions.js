import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";

import "../../../../../../imports/css/Actions.css";

import { translate } from "../../../../HOCs/translate";
import { RESOURCE_EDITOR } from "../../../../../constants/resourceConstants";
import PrimaryButton from "../../Button/PrimaryButton";

const Actions = compose(
  translate("Common.rightBarTop"),
  withRouter
)(({ translate, playComputer, history }) => (
  <div className="actions">
    <PrimaryButton
      className="link element"
      type="primary"
      onClick={() => history.push(RESOURCE_EDITOR)}
    >
      {translate("editor")}
    </PrimaryButton>
    <PrimaryButton className="element" type="primary" onClick={playComputer}>
      {translate("playComputer")}
    </PrimaryButton>
  </div>
));

export default Actions;
