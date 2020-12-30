import React, { Component } from "react";
import { Tabs } from "antd";
import GameHistory from "./GameHistory";
import ExamineObserveTab from "./ExamineObserveTab";
import { ExamineGameControlBlock } from "./GameControlBlock";
import { translate } from "../../../../HOCs/translate";
import PlayChooseBot from "../PlayChooseBot";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { RESOURCE_PLAY } from "../../../../../constants/resourceConstants";
import Actions from "./Actions";

const { TabPane } = Tabs;

class ExamineSidebarTop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      moveOrPlay: "move"
    };
  }

  playComputer = () => {
    this.setState({ moveOrPlay: "play", cmi: "none" });
  };

  playBotFromHere = data => {
    const { history, game } = this.props;

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
      game._id
    );

    history.push(RESOURCE_PLAY);
  };

  componentDidUpdate(prevProps) {
    const { game } = this.props;
    const { moveOrPlay } = this.state;

    if (moveOrPlay === "move") return;

    const cmi1 = prevProps.game && prevProps.game.variations ? prevProps.game.variations.cmi : -1;
    const cmi2 = game && game.variations ? game.variations.cmi : -1;

    if (cmi1 === cmi2) return;
    this.setState({ moveOrPlay: "move" });
  }

  renderPlay = () => {
    return (
      <PlayChooseBot
        onClose={() => this.setState({ moveOrPlay: "move" })}
        onPlay={data => this.playBotFromHere(data)}
      />
    );
  };

  renderMove() {
    const {
      cssManager,
      RightBarTopData,
      flip,
      actionData,
      startGameExamine,
      gameRequest,
      examineAction,
      game
    } = this.props;

    return (
      <div>
        <Actions playComputer={this.playComputer} />
        <GameHistory
          cssManager={cssManager}
          game={RightBarTopData.MoveList}
          flip={flip}
          actionData={actionData}
          startGameExamine={startGameExamine}
          gameRequest={gameRequest}
          examineAction={examineAction}
        />
        <ExamineGameControlBlock game={game} flip={flip} />
      </div>
    );
  }

  render() {
    const { translate, game, allUsers, observeUser, unObserveUser } = this.props;
    const { moveOrPlay } = this.state;

    return (
      <Tabs
        className="examine-sidebar-top"
        defaultActiveKey="game"
        size="small"
        type="card"
        style={{ marginBottom: 32 }}
      >
        <TabPane tab={translate("game")} key="game">
          {moveOrPlay === "play" && this.renderPlay()}
          {moveOrPlay === "move" && this.renderMove()}
        </TabPane>
        <TabPane tab={translate("observe")} key="observe">
          <ExamineObserveTab
            game={game}
            allUsers={allUsers}
            observeUser={observeUser}
            unObserveUser={unObserveUser}
          />
        </TabPane>
      </Tabs>
    );
  }
}

export default compose(
  translate("Common.rightBarTop"),
  withRouter
)(ExamineSidebarTop);
