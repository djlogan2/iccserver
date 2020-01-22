import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import CreateGame from "./CreateGameComponent";
import TournamentsList from "./TournamentsListComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightBarTop");

export default class RightBarTopActivetabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "others"
    };
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
    return (
      <Tabs cssmanager={this.props.cssmanager}>
        <div label={translator("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
            cssmanager={this.props.cssmanager}
            MoveHistory={this.props.RightBarTopData.MoveList}
            flip={this.props.flip}
            actionData={this.props.actionData}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
          />
        </div>
        <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame cssmanager={this.props.cssmanager} ref="create_game" />
        </div>
        <div label={translator("tournaments")} imgsrc="images/tournament-icon-gray.png">
          <TournamentsList
            cssmanager={this.props.cssmanager}
            TournamentsList={this.props.RightBarTopData.TournamentList.Tournaments}
          />
        </div>
      </Tabs>
    );
  }
}
