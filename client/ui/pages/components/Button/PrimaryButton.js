import React from "react";
import { Button } from "antd";
import { compose } from "redux";
import { withTracker } from "meteor/react-meteor-data";

import { mongoCss } from "../../../../../imports/api/client/collections";

import { get } from "lodash";

const PrimaryButton = ({ css, ...rest }) => (
  <Button style={get(css, "primaryButtonCss.button", {})} {...rest} />
);

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  })
)(PrimaryButton);
