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

const log = new Logger("client/PlayRightSidebar");

const { TabPane } = Tabs;

class PlayBlock extends Component {
  constructor(props) {
    super(props);
    log.trace("PlayBlock constructor", props);
    this.state = { status: "none" };
  }
  handlePlayWithFriend = () => {
    this.setState({ status: "play-friend-options" });
  };

  handlePlayFriendOptions = data => {
    this.setState({ status: "play-with-friend", options: data });
  };

  handleChooseFriend = friendId => {
    this.props.onChooseFriend({
      friendId: friendId,
      options: this.state.options
    });
  };

  handlePlayComputer = () => {
    this.setState({ status: "choose-bot" });
  };

  hanldePlayWithBot = data => {
    const { ratingType, skillLevel, color, incrementOrDelayType, initial, incrementOrDelay } = data;

    this.props.onBotPlay(
      0,
      ratingType,
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      initial,
      incrementOrDelay,
      incrementOrDelayType,
      skillLevel,
      color
    );
  };

  render() {
    log.trace("PlayBlock render", this.props);
    const isPlaying =
      this.props.game &&
      this.props.game.status === "playing" &&
      (Meteor.userId() === this.props.game.white.id ||
        Meteor.userId() === this.props.game.black.id);
    if (!isPlaying && this.state.status === "none") {
      return (
        <div className="play-block">
          <div className="play-block__top">
            <Button type="primary">3 min</Button>
            <Button type="primary">5 min</Button>
            <Button type="primary">10 min</Button>
            <Button type="primary">3 min</Button>
            <Button type="primary">5 min</Button>
            <Button type="primary">10 min</Button>
          </div>
          <div className="play-block__bottom">
            <Button className="play-block__btn-big" block>
              Create a game
            </Button>
            <Button onClick={this.handlePlayWithFriend} className="play-block__btn-big" block>
              Play with a friend
            </Button>
            <Button onClick={this.handlePlayComputer} className="play-block__btn-big" block>
              Play with the computer
            </Button>
          </div>
        </div>
      );
    }
    if (!isPlaying && this.state.status === "play-friend-options") {
      return (
        <PlayFriendOptions
          onClose={() => {
            this.setState({ status: "none" });
          }}
          onPlay={this.handlePlayFriendOptions}
        />
      );
    }
    if (!isPlaying && this.state.status === "play-with-friend") {
      return (
        <PlayWithFriend
          onClose={() => {
            this.setState({ status: "none" });
          }}
          usersToPlayWith={this.props.usersToPlayWith}
          onChoose={this.handleChooseFriend}
        />
      );
    }
    if (!isPlaying && this.state.status === "choose-bot") {
      return (
        <PlayChooseBot
          onClose={() => {
            this.setState({ status: "none" });
          }}
          onPlay={this.hanldePlayWithBot}
        />
      );
    }
    if (isPlaying) {
      return (
        <div className="playing">
          <GameHistory
            cssManager={this.props.cssManager}
            game={this.props.RightSidebarData.MoveList}
            actionData={this.props.actionData}
            startGameExamine={this.props.startGameExamine}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
            currentGame={this.props.currentGame}
          />
          <GameControlBlock game={this.props.game} flip={this.props.flip} />
        </div>
      );
    }
    return null;
  }
}

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
            <PersonalChatApp opponentId={isPlayersWhite ? blackId : whiteId} />
          </TabPane>
          <TabPane tab={"Kibitz"} key="kibitz">
            <KibitzChatApp isKibitz={true} gameId={this.props.game._id} />
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
          <TabPane tab={"Play"} key="play">
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
