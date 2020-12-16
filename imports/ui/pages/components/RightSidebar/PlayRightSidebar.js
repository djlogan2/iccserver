import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Button, Tabs } from "antd";
import KibitzChatApp from "./../Chat/KibitzChatApp";
import PersonalChatApp from "./../Chat/PersonalChatApp";
import GameHistory from "./elements/GameHistory";
import { GameControlBlock } from "./elements/GameControlBlock";

import { Logger } from "../../../../../lib/client/Logger";
import PlayChooseBot from "./PlayChooseBot";
import PlayWithFriend from "./PlayWithFriend";
import PlayFriendOptions from "./PlayFriendOptions";
import PlayBlock from "./PlayBlock";

const log = new Logger("client/PlayRightSidebar");

const { TabPane } = Tabs;

const ObserveBlock = () => {
  return <div className="observe-block">work in progress</div>;
};
export default class PlayRightSidebar extends Component {
  renderBottom = () => {
    const isPlaying =
      this.props.game &&
      this.props.game.status === "playing" &&
      (Meteor.userId() === this.props.game.white.id ||
        Meteor.userId() === this.props.game.black.id);

    if (isPlaying) {
      const whiteId = this.props.game.white.id;
      const blackId = this.props.game.black.id;
      let isPlayersWhite = Meteor.userId() === whiteId;
      return (
        <Tabs className="play-right-sidebar__bottom" defaultActiveKey="1" size="small" type="card">
          <TabPane tab={"Chat"} key="chat">
            <PersonalChatApp opponentId={isPlayersWhite ? blackId : whiteId}/>
          </TabPane>
          <TabPane tab={"Kibitz"} key="kibitz">
            <KibitzChatApp isKibitz={true} gameId={this.props.game._id}/>
          </TabPane>
        </Tabs>
      );
    }
  };

  render() {
    log.trace("PlayRightSidebar render", this.props);
    const isPlaying =
      this.props.game &&
      this.props.game.status === "playing" &&
      (Meteor.userId() === this.props.game.white.id ||
        Meteor.userId() === this.props.game.black.id);
    let topClasses = isPlaying
      ? "play-right-sidebar__top play-right-sidebar__top--small"
      : "play-right-sidebar__top";

    return (
      <div className="play-right-sidebar">
        <Tabs className={topClasses} defaultActiveKey="1" size="small" type="card">
          <TabPane tab="Play" key="play">
            <PlayBlock
              game={this.props.game}
              onBotPlay={this.props.onBotPlay}
              usersToPlayWith={this.props.usersToPlayWith}
              onChooseFriend={this.props.onChooseFriend}
              cssManager={this.props.cssManager}
              RightSidebarData={this.props.RightSidebarData}
              flip={this.props.flip}
            />
          </TabPane>

          <TabPane tab="Observe" key="observe">
            <ObserveBlock />
          </TabPane>
        </Tabs>
        {this.props.game && this.renderBottom()}
      </div>
    );
  }
}
