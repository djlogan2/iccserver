import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tabs } from "antd";
import { get } from "lodash";
import { compose } from "redux";

import KibitzChatApp from "../../Chat/KibitzChatApp";
import PersonalChatApp from "../../Chat/PersonalChatApp";
import { translate } from "../../../../HOCs/translate";

import PlayBlock from "../PlayBlock";
import ObserveBlock from "../ObserveBlock/ObserveBlock";
import { gameComputerId, gameStatusPlaying } from "../../../../../constants/gameConstants";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";

const { TabPane } = Tabs;

class PlayRightSidebar extends Component {
  renderBottom = () => {
    const { game, translate, classes } = this.props;

    const isPlaying = this.isPlaying();

    if (isPlaying) {
      const whiteId = get(game, "white.id");
      const blackId = get(game, "black.id");

      const isBotPlay = this.isBotPlay();

      const isPlayersWhite = Meteor.userId() === whiteId;

      return (
        <Tabs className={classes.bottom} defaultActiveKey="1" size="small" type="card">
          <TabPane tab={translate("bottomTabs.chatTab")} key="chat">
            <PersonalChatApp disabled={isBotPlay} opponentId={isPlayersWhite ? blackId : whiteId} />
          </TabPane>
          <TabPane tab={translate("bottomTabs.kibitzTab")} key="kibitz">
            <KibitzChatApp disabled={isBotPlay} isKibitz={true} gameId={game._id} />
          </TabPane>
        </Tabs>
      );
    }
  };

  isBotPlay = () => {
    const { game } = this.props;

    const whiteId = get(game, "white.id");
    const blackId = get(game, "black.id");

    return whiteId === gameComputerId || blackId === gameComputerId;
  };

  isPlaying = () => {
    const { game } = this.props;

    return (
      game &&
      game.status === gameStatusPlaying &&
      (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id)
    );
  };

  render() {
    const {
      game,
      classes,
      onBotPlay,
      onSeekPlay,
      usersToPlayWith,
      sentRequests,
      onChooseFriend,
      cssManager,
      moveList,
      flip,
      translate,
    } = this.props;

    return (
      <div className={classes.main}>
        <div className={classes.flexDiv}>
          <Tabs defaultActiveKey="play" size="small" type="card">
            <TabPane tab={translate("tabs.playTab")} key="play">
              <PlayBlock
                game={game}
                onBotPlay={onBotPlay}
                onSeekPlay={onSeekPlay}
                usersToPlayWith={usersToPlayWith}
                sentRequests={sentRequests}
                onChooseFriend={onChooseFriend}
                cssManager={cssManager}
                moveList={moveList}
                flip={flip}
              />
            </TabPane>
            <TabPane tab={translate("tabs.observeTab")} key="observe">
              <ObserveBlock />
            </TabPane>
          </Tabs>
        </div>
        {game && this.renderBottom()}
      </div>
    );
  }
}

export default compose(
  translate("Play.PlayRightSidebar"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
    };
  }),
  injectSheet(dynamicStyles)
)(PlayRightSidebar);
