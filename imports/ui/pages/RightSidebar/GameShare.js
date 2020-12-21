import React, { Component } from "react";
import { translate } from "../../HOCs/translate";

class GameShare extends Component {
  render() {
    const { cssManager, translate } = this.props;

    return (
      <button style={cssManager.buttonStyle()}>
        <img src={cssManager.buttonBackgroundImage("gameShare")} alt={translate("gameShare")} />
      </button>
    );
  }
}

export default translate("Common.rightBarTop")(GameShare);
