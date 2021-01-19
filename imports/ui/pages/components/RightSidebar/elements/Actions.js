import React from "react";
import { Link } from "react-router-dom";

import "../../../css/Actions.css";

import { translate } from "../../../../HOCs/translate";
import { RESOURCE_EDITOR } from "../../../../../constants/resourceConstants";
import PrimaryButton from "../../Button/PrimaryButton";

const Actions = translate("Common.rightBarTop")(({ translate, playComputer }) => (
  <div className="actions">
    <Link className="link element" to={RESOURCE_EDITOR}>
      <PrimaryButton block type="primary">
        {translate("editor")}
      </PrimaryButton>
    </Link>
    <PrimaryButton className="element" type="primary" onClick={playComputer}>
      {translate("playComputer")}
    </PrimaryButton>
  </div>
));

export default Actions;
