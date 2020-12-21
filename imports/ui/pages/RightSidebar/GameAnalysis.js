import React, { Component } from "react";
import { translate } from "../../HOCs/translate";

class GameAnalysis extends Component {
  render() {
    const { cssManager, translate } = this.props;

    return (
      <button style={cssManager.buttonStyle()}>
        <img
          src={cssManager.buttonBackgroundImage("gameAnalysis")}
          alt={translate("gameAnalysis")}
        />
      </button>
    );
  }
}

export default translate("Common.rightBarTop")(GameAnalysis);
