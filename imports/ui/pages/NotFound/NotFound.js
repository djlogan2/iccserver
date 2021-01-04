import React from "react";
import { Button } from "antd";
import "./NotFound.css";

import { translate } from "../../HOCs/translate";
import { RESOURCE_HOME } from "../../../constants/resourceConstants";

const NotFound = ({ translate }) => (
  <div className="container">
    {translate("notFound")}
    <Button type="primary" href={RESOURCE_HOME}>
      {translate("mainPage")}
    </Button>
  </div>
);

export default translate("Common.NotFound")(NotFound);
