import React, { Component } from "react";
import { translate } from "../../HOCs/translate";

/**
 *
 *
 Now this display html code so we created simple component this component will be feature enhancement

 */
class Friends extends Component {
  render() {
    const { translate } = this.props;
    return (
      <div>
        <h3>{translate("friends")}</h3>
        <p />
      </div>
    );
  }
}

export default translate("Common.rightBarTop")(Friends);
