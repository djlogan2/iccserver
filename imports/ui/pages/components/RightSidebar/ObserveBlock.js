import React from "react";
import { translate } from "../../../HOCs/translate";

const ObserveBlock = ({ translate }) => (
  <div className="observe-block">{translate("inProgress")}</div>
);

export default translate("Play.ObserveBlock")(ObserveBlock);
