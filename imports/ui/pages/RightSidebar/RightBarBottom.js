import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import Examiner from "./ExaminerComponent";
import FollowCoach from "./FollowCoachComponent";
import GameLibrary from "./GameLibraryComponent";
import GameHistory from "./GameHistoryComponent";
import AdjournedGame from "./AdjournedGameComponent";
import PGN from "./PGNComponent";

import "./Tabs/BottomStyles";
import i18n from "meteor/universe:i18n";

class RightBarBottom extends Component {
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    let translator = i18n.createTranslator("Common.rightBarBottom", this.getLang());

    return (
      <Tabs cssmanager={this.props.cssmanager} tabName="bottom">
        <div label="Examiner" imgsrc="images/examiner.png" hoverSrc="images/examiner-active.png">
          <Examiner
            cssmanager={this.props.cssmanager}
            gameRequest={this.props.gameRequest}
            clientMessage={this.props.clientMessage}
          />
        </div>
        <div
          label="Follow Coach"
          imgsrc="images/follow-coach.png"
          hoverSrc="images/follow-coach-active.png"
        >
          <FollowCoach
            cssmanager={this.props.cssmanager}
            examing={this.props.examing}
            clientMessage={this.props.clientMessage}
          />
        </div>
        <div
          label="Game Library"
          imgsrc="images/game-library.png"
          hoverSrc="images/game-library-active.png"
        >
          <GameLibrary
            cssmanager={this.props.cssmanager}
            clientMessage={this.props.clientMessage}
          />
        </div>

        <div
          label="Game History"
          imgsrc="images/history-icon-white.png"
          hoverSrc="images/history-icon-blue.png"
        >
          <GameHistory />
        </div>
        <div
          label="Adjourned Game"
          imgsrc="images/adjourned-game.png"
          hoverSrc="images/adjourned-game-active.png"
        >
          <AdjournedGame />
        </div>

        <div
          label={translator("fen_pgn")}
          imgsrc="images/fen-pgn-white-icon.png"
          hoverSrc="images/fen-pgn-blue-icon.png"
        >
          <PGN />
        </div>
      </Tabs>
    );
  }
}
export default RightBarBottom;
