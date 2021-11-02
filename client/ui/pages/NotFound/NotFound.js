import { Button } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import React from "react";
import { compose } from "redux";
import { mongoCss } from "../../../../imports/api/client/collections";
import { RESOURCE_HOME } from "../../../constants/resourceConstants";
import { translate } from "../../HOCs/translate";
import { withDynamicStyles } from "../../HOCs/withDynamicStyles";

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
  withDynamicStyles("css.notFoundCss"),
  translate("Common.NotFound")
)(NotFound);
