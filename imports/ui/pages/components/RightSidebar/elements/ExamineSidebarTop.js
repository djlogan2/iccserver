import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import GameHistory from "./GameHistory";
import ExamineObserveTab from "./ExamineObserveTab";
import { ExamineGameControlBlock } from "./GameControlBlock";
import { translate } from "../../../../HOCs/translate";
import { Tabs } from "antd";
import { PlayChooseBot } from "../PlayChooseBot";
import { Meteor } from "meteor/meteor";
import { resourceEditor, resourcePlay } from "../../../../../constants/resourceConstants";

const { TabPane } = Tabs;

class ExamineSidebarTop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: "others",
      moveOrPlay: "move"
    };
  }

  playComputer() {
    this.setState({ moveOrPlay: "play", cmi: "none" });
  }

  playBotFromHere(data) {
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

    history.push(resourcePlay);
  }

  componentDidUpdate(prevProps) {
    const { game } = this.props;
    const { moveOrPlay } = this.state;

    if (moveOrPlay === "move") return;

    const cmi1 = prevProps.game && prevProps.game.variations ? prevProps.game.variations.cmi : -1;
    const cmi2 = game && game.variations ? game.variations.cmi : -1;

    if (cmi1 === cmi2) return;
    this.setState({ moveOrPlay: "move" });
  }

  renderPlay() {
    return (
      <PlayChooseBot
        onClose={() => this.setState({ moveOrPlay: "move" })}
        onPlay={data => this.playBotFromHere(data)}
      />
    );
  }

  renderMove() {
    const {
      translate,
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
        <Link style={{ marginLeft: "10px", marginBottom: "10px" }} to={resourceEditor}>
          <Button>{translate("editor")}</Button>
        </Link>
        <Button onClick={() => this.playComputer()}>{translate("playComputer")}</Button>
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
        defaultActiveKey="1"
        size="small"
        type="card"
        style={{ marginBottom: 32 }}
      >
        <TabPane tab={translate("game")} key="1">
          {moveOrPlay === "play" && this.renderPlay()}
          {moveOrPlay === "move" && this.renderMove()}
        </TabPane>
        <TabPane tab={translate("observe")} key="2">
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

export default translate("Common.rightBarTop")(ExamineSidebarTop);
