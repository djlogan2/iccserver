import React, { Component } from "react";
import { Tabs } from "antd";
import GameHistory from "../GameHistory/GameHistory";
import ExamineObserveTab from "../ExamineObserveTab/ExamineObserveTab";
import { ExamineGameControlBlock } from "../GameControlBlock/GameControlBlock";
import { translate } from "../../../../../HOCs/translate";
import PlayChooseBot from "../../PlayChooseBot/PlayChooseBot";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { RESOURCE_PLAY } from "../../../../../../constants/resourceConstants";
import Actions from "../Actions/Actions";
import GameCommandsBlock from "../../../GameCommandsBlock/GameCommandsBlock";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

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
        onPlay={(data) => this.playBotFromHere(data)}
      />
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
      <div className={classes.renderMoveWrapper}>
        <div className={classes.renderMove}>
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
          <ExamineObserveTab
            game={game}
            observeUser={observeUser}
            unObserveUser={unObserveUser}
          />
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
  injectSheet(dynamicStyles),
  translate("Common.rightBarTop"),
  withRouter
)(ExamineSidebarTop);
