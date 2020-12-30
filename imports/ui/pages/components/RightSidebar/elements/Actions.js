import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

import "../../../css/Actions.css";

import { translate } from "../../../../HOCs/translate";
import { RESOURCE_EDITOR } from "../../../../../constants/resourceConstants";

const Actions = translate("Common.rightBarTop")(({ translate, playComputer }) => (
  <div className="actions">
    <Link className="link element" to={RESOURCE_EDITOR}>
      <Button block type="primary">
        {translate("editor")}
      </Button>
    </Link>
    <Button className="element" type="primary" onClick={playComputer}>
      {translate("playComputer")}
    </Button>
  </div>
));

export default Actions;
