import React from "react";
import { Button } from "antd";
import { compose } from "redux";

import { translate } from "../../HOCs/translate";
import { RESOURCE_HOME } from "../../../constants/resourceConstants";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const NotFound = ({ translate, classes }) => (
  <div className={classes.container}>
    {translate("notFound")}
    <Button type="primary" href={RESOURCE_HOME}>
      {translate("mainPage")}
    </Button>
  </div>
);

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles),
  translate("Common.NotFound")
)(NotFound);
