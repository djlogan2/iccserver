import { Tabs } from "antd";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import { RESOURCE_PLAY } from "../../../../../../constants/resourceConstants";
import { translate } from "../../../../../HOCs/translate";
import { withDynamicStyles } from "../../../../../HOCs/withDynamicStyles";
import GameCommandsBlock from "../../../GameCommandsBlock/GameCommandsBlock";
import PlayChooseBot from "../../PlayChooseBot/PlayChooseBot";
import Actions from "../Actions/Actions";
import ExamineObserveTab from "../ExamineObserveTab/ExamineObserveTab";
import { ExamineGameControlBlock } from "../GameControlBlock/GameControlBlock";
import GameHistory from "../GameHistory/GameHistory";
import "./ExamineSidebarTop.css";

const { TabPane } = Tabs;

class ExamineSidebarTop extends Component {
  constructor(props) {
    super(props);

    this.state = {
      moveOrPlay: "move",
    };
  }

  playComputer = () => {
    this.setState({ moveOrPlay: "play", cmi: "none" });
  };

  playBotFromHere = (data) => {
    const { history, game } = this.props;

    const {
      challengerRatingType,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      skillLevel,
      color,
    } = data;

    Meteor.call(
      "startBotGame",
      "play_computer",
      0,
      challengerRatingType,
      challengerInitial,
      challengerIncrementOrDelay,
      challengerIncrementOrDelayType,
      receiverInitial,
      receiverIncrementOrDelay,
      receiverIncrementOrDelayType,
      skillLevel,
      color,
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
      <div style={{ height: "100%", overflow: "auto" }}>
        <PlayChooseBot
          onClose={() => this.setState({ moveOrPlay: "move" })}
          onPlay={(data) => this.playBotFromHere(data)}
        />
      </div>
    );
  };

  renderMove() {
    const {
      game,
      flip,
      classes,
      cssManager,
      moveList,
      actionData,
      startGameExamine,
      gameRequest,
      examineAction,
    } = this.props;

    return (
      <div className={classes.renderMoveWrapper} style={{ height: "100%" }}>
        <div className={classes.renderMove} style={{ height: "100%" }}>
          <Actions playComputer={this.playComputer} />
          <GameHistory
            cssManager={cssManager}
            game={moveList}
            actionData={actionData}
            startGameExamine={startGameExamine}
            gameRequest={gameRequest}
            examineAction={examineAction}
          />
          <GameCommandsBlock game={game} />
          <ExamineGameControlBlock game={game} flip={flip} />
        </div>
      </div>
    );
  }

  render() {
    const { translate, game, observeUser, unObserveUser, classes } = this.props;
    const { moveOrPlay } = this.state;

    return (
      <Tabs className={classes.main} defaultActiveKey="game" size="small" type="card">
        <TabPane tab={translate("game")} key="game" className={classes.tabPlane}>
          {moveOrPlay === "play" && this.renderPlay()}
          {moveOrPlay === "move" && this.renderMove()}
        </TabPane>
        <TabPane tab={translate("observe")} key="observe">
          <ExamineObserveTab game={game} observeUser={observeUser} unObserveUser={unObserveUser} />
        </TabPane>
      </Tabs>
    );
  }
}

export default compose(
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  withDynamicStyles("css.examineSidebarTopCss"),
  translate("Common.rightBarTop"),
  withRouter
)(ExamineSidebarTop);
