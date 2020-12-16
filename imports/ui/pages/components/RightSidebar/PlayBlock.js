import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Button } from "antd";
import PlayFriendOptions from "./PlayFriendOptions";
import PlayWithFriend from "./PlayWithFriend";
import PlayChooseBot from "./PlayChooseBot";
import GameHistory from "./elements/GameHistory";
import { GameControlBlock } from "./elements/GameControlBlock";
import { translate } from "../../../HOCs/translate";

class PlayBlock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: "none"
    };
  }

  handlePlayWithFriend = () => {
    this.setState({ status: "play-friend-options" });
  };

  handlePlayFriendOptions = data => {
    this.setState({ status: "play-with-friend", options: data });
  };

  handleChooseFriend = friendId => {
    const { onChooseFriend } = this.props;
    const { options } = this.state;

    onChooseFriend({ friendId, options });
  };

  handlePlayComputer = () => {
    this.setState({ status: "choose-bot" });
  };

  hanldePlayWithBot = data => {
    const { onBotPlay } = this.props;
    const { ratingType, skillLevel, color, incrementOrDelayType, initial, incrementOrDelay } = data;

    onBotPlay(
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
    const {
      game,
      usersToPlayWith,
      flip,
      cssManager,
      RightSidebarData,
      actionData,
      startGameExamine,
      gameRequest,
      examineAction,
      currentGame,
      translate
    } = this.props;
    const { status } = this.state;

    const isPlaying =
      game &&
      game.status === "playing" &&
      (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id);

    if (!isPlaying && status === "none") {
      return (
        <div className="play-block">
          <div className="play-block__bottom">
            <Button className="play-block__btn-big" block>
              {translate("createGame")}
            </Button>
            <Button onClick={this.handlePlayWithFriend} className="play-block__btn-big" block>
              {translate("playWithFriend")}
            </Button>
            <Button onClick={this.handlePlayComputer} className="play-block__btn-big" block>
              {translate("playWithComputer")}
            </Button>
          </div>
        </div>
      );
    }

    if (!isPlaying && status === "play-friend-options") {
      return (
        <PlayFriendOptions
          onClose={() => {
            this.setState({ status: "none" });
          }}
          onPlay={this.handlePlayFriendOptions}
        />
      );
    }

    if (!isPlaying && status === "play-with-friend") {
      return (
        <PlayWithFriend
          onClose={() => {
            this.setState({ status: "none" });
          }}
          usersToPlayWith={usersToPlayWith}
          onChoose={this.handleChooseFriend}
        />
      );
    }

    if (!isPlaying && status === "choose-bot") {
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
            cssManager={cssManager}
            game={RightSidebarData.MoveList}
            actionData={actionData}
            startGameExamine={startGameExamine}
            gameRequest={gameRequest}
            examineAction={examineAction}
            currentGame={currentGame}
          />
          <GameControlBlock game={game} flip={flip} />
        </div>
      );
    }

    return null;
  }
}

export default translate("Play.PlayBlock")(PlayBlock);
