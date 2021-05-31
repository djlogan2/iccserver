import React, { Component } from "react";
import { Progress } from "antd";
import { compose } from "redux";
import { get } from "lodash";

import { colorWhite } from "../../../../constants/gameConstants";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../imports/api/client/collections";

class Analysis extends Component {
  render() {
    const { orientation, css } = this.props;

    const strokeColor = get(css, "mugshotCss.strokeColor", "#FFFFFF");
    const trailColor = get(css, "mugshotCss.trailColor", "#000000");

    return (
      <Progress
        percent={50}
        style={{ transform: orientation === colorWhite ? "rotate(270deg)" : "rotate(90deg)" }}
        trailColor={trailColor}
        strokeColor={strokeColor}
        showInfo={false}
        status="normal"
      />
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  })
)(Analysis);
