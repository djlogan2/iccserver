import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tabs } from "antd";
import { get } from "lodash";
import KibitzChatApp from "../Chat/KibitzChatApp";
import PersonalChatApp from "../Chat/PersonalChatApp";
import { translate } from "../../../HOCs/translate";

import PlayBlock from "./PlayBlock";
import ObserveBlock from "./ObserveBlock";
import { gameComputerId } from "../../../../constants/gameConstants";

const { TabPane } = Tabs;

class PlayRightSidebar extends Component {
  renderBottom = () => {
    const { game, translate } = this.props;

    const isPlaying = this.isPlaying();

    if (isPlaying) {
      const whiteId = get(game, "white.id");
      const blackId = get(game, "black.id");

      const isBotPlay = this.isBotPlay();

      const isPlayersWhite = Meteor.userId() === whiteId;

      return (
        <Tabs className="play-right-sidebar__bottom" defaultActiveKey="1" size="small" type="card">
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
      game.status === "playing" &&
      (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id)
    );
  };

  render() {
    const {
      game,
      onBotPlay,
      onSeekPlay,
      usersToPlayWith,
      sentRequests,
      onChooseFriend,
      cssManager,
      RightSidebarData,
      flip,
      translate,
    } = this.props;

    return (
      <div className="play-right-sidebar">
        <div id="top-div" style={{ flex: 1 }}>
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
                RightSidebarData={RightSidebarData}
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

export default translate("Play.PlayRightSidebar")(PlayRightSidebar);
