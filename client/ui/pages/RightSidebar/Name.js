import React, { Component } from "react";
import GameShare from "./GameShare";
import GameSheetDownload from "./GameSheetDownload";
import GameAnalysis from "./GameAnalysis";

export default class Name extends Component {
  render() {
    const { cssManager, game } = this.props;
    return (
      <div style={cssManager.gameTopHeader()}>
        <div style={cssManager.pullRight()}>
          <GameShare cssManager={cssManager} />
          <GameSheetDownload cssManager={cssManager} game={game} />
          <GameAnalysis cssManager={cssManager} />
        </div>
      </div>
    );
  }
}
