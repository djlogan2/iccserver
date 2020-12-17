import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Examiner from "./ExaminerComponent";
import FollowCoach from "./FollowCoachComponent";
import GameLibrary from "./GameLibraryComponent";
import GameHistory from "./GameHistoryComponent";
import AdjournedGame from "./AdjournedGameComponent";
import PGN from "./PGNComponent";

import { translate } from "../../HOCs/translate";

import "./Tabs/BottomStyles";

class RightBarBottom extends Component {
  render() {
    const {
      translate,
      activeTabnumber,
      cssManager,
      clientMessage,
      Gamedata,
      uploadPgn
    } = this.props;
    return (
      <Tabs
        cssManager={cssManager}
        tabName="bottom"
        defultactive={activeTabnumber ? activeTabnumber : 0}
      >
        <div
          label={translate("examiner")}
          imgsrc="images/examiner.png"
          hoverSrc="images/examiner-active.png"
        >
          <Examiner cssManager={cssManager} clientMessage={clientMessage} />
        </div>
        <div
          label={translate("followCoach")}
          imgsrc="images/follow-coach.png"
          hoverSrc="images/follow-coach-active.png"
        >
          <FollowCoach cssManager={cssManager} clientMessage={clientMessage} />
        </div>
        <div
          label={translate("gameLibrary")}
          imgsrc="images/game-library.png"
          hoverSrc="images/game-library-active.png"
        >
          <GameLibrary cssManager={cssManager} clientMessage={clientMessage} />
        </div>
        <div
          label={translate("gameHistory")}
          imgsrc="images/history-icon-white.png"
          hoverSrc="images/history-icon-blue.png"
        >
          <GameHistory cssManager={cssManager} />
        </div>
        <div
          label={translate("adjournedGame")}
          imgsrc="images/adjourned-game.png"
          hoverSrc="images/adjourned-game-active.png"
        >
          <AdjournedGame />
        </div>
        <div
          label={translate("fen_pgn")}
          imgsrc="images/fen-pgn-white-icon.png"
          hoverSrc="images/fen-pgn-blue-icon.png"
        >
          <PGN cssManager={cssManager} Gamedata={Gamedata} uploadPgn={uploadPgn} />
        </div>
      </Tabs>
    );
  }
}

export default translate("Common.rightBarBottom")(RightBarBottom);
