import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
// import Tabs from "./Tabs/Tabs";
import GameHistory from "./GameHistory";
import ExamineObserveTab from "./ExamineObserveTab";
import { ExamineGameControlBlock } from "./GameControlBlock";
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
          <Link style={{ marginLeft: "10px", marginBottom: "10px" }} to="/editor">
            <Button>Editor</Button>
          </Link>
          <GameHistory
            cssManager={this.props.cssManager}
            game={this.props.RightBarTopData.MoveList}
            flip={this.props.flip}
            actionData={this.props.actionData}
            startGameExamine={this.props.startGameExamine}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
          />
          <ExamineGameControlBlock game={this.props.game} flip={this.props.flip} />
        </TabPane>
        <TabPane tab="Observe" key="2">
          <ExamineObserveTab
            game={this.props.game}
            allUsers={this.props.allUsers}
            observeUser={this.props.observeUser}
            unObserveUser={this.props.unObserveUser}
          />
        </TabPane>
      </Tabs>
    );
  }
}
