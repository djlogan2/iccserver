import React, { Component } from "react";
// import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameHistory";
// import CreateGame from "./CreateGameComponent";
// import TournamentsList from "./TournamentsListComponent";
import i18n from "meteor/universe:i18n";

import { Tabs } from "antd";
const { TabPane } = Tabs;

export default class ExamineSidebarTop extends Component {
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
      <Tabs
        className="examine-sidebar-top"
        defaultActiveKey="1"
        size="small"
        type="card"
        style={{ marginBottom: 32 }}
      >
        <TabPane tab={translator("game")} key="1">
          <GameHistory
            cssmanager={this.props.cssmanager}
            game={this.props.RightBarTopData.MoveList}
            flip={this.props.flip}
            actionData={this.props.actionData}
            startGameExamine={this.props.startGameExamine}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
            currentGame={this.props.currentGame}
          />
        </TabPane>
        <TabPane tab="Observe" key="2">
          Content of tab 2
        </TabPane>
      </Tabs>
      // <Tabs cssmanager={this.props.cssmanager}>
      //   <div label={translator("game")} imgsrc="images/game-icon-gray.png">
      //     <GameHistory
      //       cssmanager={this.props.cssmanager}
      //       game={this.props.RightBarTopData.MoveList}
      //       flip={this.props.flip}
      //       actionData={this.props.actionData}
      //       startGameExamine={this.props.startGameExamine}
      //       gameRequest={this.props.gameRequest}
      //       examineAction={this.props.examineAction}
      //       currentGame={this.props.currentGame}
      //     />
      //   </div>
      //   <div label="test">test </div>
      // </Tabs>
    );
  }
}
