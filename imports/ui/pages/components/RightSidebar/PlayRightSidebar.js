import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tabs } from "antd";
import { get } from "lodash";
import KibitzChatApp from "./../Chat/KibitzChatApp";
import PersonalChatApp from "./../Chat/PersonalChatApp";
import { translate } from "../../../HOCs/translate";

import PlayBlock from "./PlayBlock";
import ObserveBlock from "./ObserveBlock";
const { TabPane } = Tabs;

class PlayRightSidebar extends Component {
  renderBottom = () => {
    const { game, translate } = this.props;

    const isPlaying = this.isPlaying();

    if (isPlaying) {
      const whiteId = get(game, "white.id");
      const blackId = get(game, "white.black");

      const isPlayersWhite = Meteor.userId() === whiteId;

      return (
        <Tabs className="play-right-sidebar__bottom" defaultActiveKey="1" size="small" type="card">
          <TabPane tab={translate("bottomTabs.chatTab")} key="chat">
            <PersonalChatApp opponentId={isPlayersWhite ? blackId : whiteId} />
          </TabPane>
          <TabPane tab={translate("bottomTabs.kibitzTab")} key="kibitz">
            <KibitzChatApp isKibitz={true} gameId={game._id} />
          </TabPane>
        </Tabs>
      );
    }
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
      usersToPlayWith,
      onChooseFriend,
      cssManager,
      RightSidebarData,
      flip,
      translate
    } = this.props;

    const topClasses = this.isPlaying()
      ? "play-right-sidebar__top play-right-sidebar__top--small"
      : "play-right-sidebar__top";

    return (
      <div className="play-right-sidebar">
        <Tabs className={topClasses} defaultActiveKey="1" size="small" type="card">
          <TabPane tab={translate("tabs.playTab")} key="play">
            <PlayBlock
              game={game}
              onBotPlay={onBotPlay}
              usersToPlayWith={usersToPlayWith}
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
        {game && this.renderBottom()}
      </div>
    );
  }
}

export default translate("Play.PlayRightSidebar")(PlayRightSidebar);
