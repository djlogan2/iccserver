import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import CreateGame from "./CreateGameComponent";
import TournamentsList from "./TournamentsListComponent";
import SeekGame from "./SeekGameComponent";
import QuickPairing from "./QuickPairingGameComponent";
import MatchUser from "./MatchUserComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";
import { Logger } from "../../../../lib/client/Logger";
import MiddleBoard from "../MiddleSection/MiddleBoard";

const log = new Logger("client/RightBarTop");

export default class RightBarTop extends Component {
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
    let translator = i18n.createTranslator("Common.rightBarTop", this.getLang());

    return (
      <Tabs cssmanager={this.props.cssmanager}>
        {/*   <div label={translator("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
            cssmanager={this.props.cssmanager}
            MoveHistory={this.props.RightBarTopData.MoveList.GameMove}
            flip={this.props.flip}
            performAction={this.props.performAction}
            actionData={this.props.actionData}
          />
        </div>

        <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame cssmanager={this.props.cssmanager} ref="create_game" />
        </div>

        <div
          label={translator("tournaments")}
          imgsrc="images/tournament-icon-gray.png"
        >
          <MatchUser cssmanager={this.props.cssmanager} />
        </div>
      */}
        <div label={translator("quikpairing")}>
          <QuickPairing cssmanager={this.props.cssmanager} />
        </div>

        <div label={translator("seekgame")}>
          <SeekGame cssmanager={this.props.cssmanager} />
        </div>
        <div label={translator("matchuser")}>
          <MatchUser cssmanager={this.props.cssmanager} />
        </div>
      </Tabs>
    );
  }
}
