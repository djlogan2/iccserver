import React, { Component } from "react";
import { get } from "lodash";
import { translate } from "../../HOCs/translate";
import { resourceExportPgnGame } from "../../../constants/resourceConstants";

class GameSheetDownload extends Component {
  render() {
    const { game, cssManager, translate } = this.props;
    const id = get(game, "_id");

    return (
      <button style={cssManager.buttonStyle()}>
        <a href={`${resourceExportPgnGame}${id}`}>
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
