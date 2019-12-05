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

const log = new Logger("client/RightBarTop");

export default class RightBarTop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "others"
    };
  }
  componentWillReceiveProps(prevProps) {
    if (prevProps.RightBarTopData1.status !== this.props.RightBarTopData1.status) {
      if (this.props.RightBarTopData1.status === "playing") this.setState({ status: "playing" });
    }
  }
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
    let tabitem1 = null;
    let tabitem2 = null;
    let tabitem3 = null;
    let status = false;
    if (!!this.props.RightBarTopData1.status && this.props.RightBarTopData1.status === "playing")
      status = true;

    if (status) {
      tabitem1 = (
        <div label={translator("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
            cssmanager={this.props.cssmanager}
            MoveHistory={this.props.RightBarTopData.MoveList.GameMove}
            flip={this.props.flip}
            performAction={this.props.performAction}
            actionData={this.props.actionData}
          />
        </div>
      );
      tabitem2 = (
        <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame cssmanager={this.props.cssmanager} ref="create_game" />
        </div>
      );
      tabitem3 = (
        <div label={translator("tournaments")} imgsrc="images/tournament-icon-gray.png">
          <TournamentsList
            cssmanager={this.props.cssmanager}
            TournamentsList={this.props.RightBarTopData.TournamentList.Tournaments}
          />
        </div>
      );
    } else {
      tabitem1 = (
        <div label={translator("quikpairing")}>
          <QuickPairing cssmanager={this.props.cssmanager} />
        </div>
      );
      tabitem2 = (
        <div label={translator("seekgame")}>
          <SeekGame cssmanager={this.props.cssmanager} />
        </div>
      );
      tabitem3 = (
        <div label={translator("matchuser")}>
          <MatchUser cssmanager={this.props.cssmanager} />
        </div>
      );
    }
    return (
      <Tabs cssmanager={this.props.cssmanager}>
        {/*   


      */}
        {tabitem1}
        {tabitem2}
        {tabitem3}
      </Tabs>
    );
  }
}
