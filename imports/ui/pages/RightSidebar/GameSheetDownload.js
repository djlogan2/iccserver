import React, { Component } from "react";
import { get } from "lodash";
import { translate } from "../../HOCs/translate";
import { RESOURCE_EXPORT_PGN_GAME } from "../../../constants/resourceConstants";

class GameSheetDownload extends Component {
  render() {
    const { game, cssManager, translate } = this.props;
    const id = get(game, "_id");

    return (
      <button style={cssManager.buttonStyle()}>
        <a href={`${RESOURCE_EXPORT_PGN_GAME}${id}`}>
          <img
            src={cssManager.buttonBackgroundImage("gameDownload")}
            alt={translate("gameDownload")}
          />
        </a>
      </button>
    );
  }
}

export default translate("Common.rightBarTop")(GameSheetDownload);
