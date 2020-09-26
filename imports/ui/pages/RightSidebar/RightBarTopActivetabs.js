import React, { Component } from "react";
import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameComponent";
import i18n from "meteor/universe:i18n";
import "./Tabs/styles";
import { Logger } from "../../../../lib/client/Logger";

const log = new Logger("client/RightBarActivetabs");

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
      <Tabs  cssManager={this.props. cssManager}>
        <div label={translator("game")} imgsrc="images/game-icon-gray.png">
          <GameHistory
             cssManager={this.props. cssManager}
            game={this.props.RightBarTopData.MoveList}
            flip={this.props.flip}
            actionData={this.props.actionData}
            startGameExamine={this.props.startGameExamine}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
            currentGame={this.props.currentGame}
          />
        </div>
        <div label="test">test </div>
        {/* <div label={translator("play")} imgsrc="images/play-icon-gray.png">
          <CreateGame  cssManager={this.props. cssManager} ref="create_game" />
        </div>
        <div label={translator("tournaments")} imgsrc="images/tournament-icon-gray.png">
          <TournamentsList
             cssManager={this.props. cssManager}
            TournamentsList={this.props.RightBarTopData.TournamentList.Tournaments}
          />
        </div> */}
      </Tabs>
    );
  }
}
