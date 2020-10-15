import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import GameHistory from "./GameHistory";
import ExamineObserveTab from "./ExamineObserveTab";
import { ExamineGameControlBlock } from "./GameControlBlock";
import i18n from "meteor/universe:i18n";

import { Tabs } from "antd";
import { PlayChooseBot } from "../PlayChooseBot";
import { Logger } from "../../../../../../lib/client/Logger";
import { Meteor } from "meteor/meteor";
const { TabPane } = Tabs;

const log = new Logger("client/ExamineSidebarTop_js");

export default class ExamineSidebarTop extends Component {
  constructor(props) {
    super(props);
    log.trace("ExamineSidebarTop constructor", props);
    this.state = {
      status: "others",
      move_or_play: "move"
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

  playComputer() {
    this.setState({ move_or_play: "play", cmi: "none" });
  }

  playBotFromHere(data) {
    Meteor.call(
      "startBotGame",
      "play_computer",
      0,
      data.ratingType,
      data.initial,
      data.incrementOrDelay,
      data.incrementOrDelayType,
      data.initial,
      data.incrementOrDelay,
      data.incrementOrDelayType,
      data.skillLevel,
      data.color,
      this.props.game._id
    );
    this.props.history.push("/play");
  }

  componentDidUpdate(prevProps) {
    if (this.state.move_or_play === "move") return;
    const cmi1 = prevProps.game && prevProps.game.variations ? prevProps.game.variations.cmi : -1;
    const cmi2 =
      this.props.game && this.props.game.variations ? this.props.game.variations.cmi : -1;
    if (cmi1 === cmi2) return;
    this.setState({ move_or_play: "move" });
  }

  renderPlay() {
    log.trace("ExamineSidebarTop::renderPlay", this.props);
    return (
      <PlayChooseBot
        onClose={() => this.setState({ move_or_play: "move" })}
        onPlay={data => this.playBotFromHere(data)}
      />
    );
  }

  renderMove() {
    log.trace("ExamineSidebarTop::renderMove", this.props);
    return (
      <div>
        <Link style={{ marginLeft: "10px", marginBottom: "10px" }} to="/editor">
          <Button>Editor</Button>
        </Link>
        <Button onClick={() => this.playComputer()}>Play computer from here</Button>
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
      </div>
    );
  }

  render() {
    log.trace("ExamineSidebarTop render", this.props);
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
          {this.state.move_or_play === "play" && this.renderPlay()}
          {this.state.move_or_play === "move" && this.renderMove()}
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
