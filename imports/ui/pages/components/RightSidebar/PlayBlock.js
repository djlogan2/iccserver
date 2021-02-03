import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PlayFriendOptions from "./PlayFriendOptions";
import PlayWithFriend from "./PlayWithFriend";
import PlayChooseBot from "./PlayChooseBot";
import GameHistory from "./elements/GameHistory";
import { GameControlBlock } from "./elements/GameControlBlock";
import {
  PLAY_STATUS_NONE,
  PLAY_STATUS_FRIEND_OPTIONS,
  PLAY_STATUS_WITH_FRIEND,
  PLAY_STATUS_CHOOSE_BOT
} from "../../../../constants/playStatusConstants";
import PlayOptionButtons from "./PlayOptionButtons";

class PlayBlock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: PLAY_STATUS_NONE
    };
  }

  handlePlayWithFriend = () => {
    this.setState({ status: PLAY_STATUS_FRIEND_OPTIONS });
  };

  handlePlayFriendOptions = options => {
    this.setState({ options, status: PLAY_STATUS_WITH_FRIEND });
  };

  handleChooseFriend = friendId => {
    const { onChooseFriend } = this.props;
    const { options } = this.state;

    onChooseFriend({ friendId, options });
  };

  handlePlayComputer = () => {
    this.setState({ status: PLAY_STATUS_CHOOSE_BOT });
  };

  hanldePlayWithBot = data => {
    const { onBotPlay } = this.props;
    const { ratingType, skillLevel, color, incrementOrDelayType, initial, incrementOrDelay } = data;

    onBotPlay({
      color,
      ratingType,
      skillLevel,
      wildNumber: 0,
      whiteInitial: initial,
      whiteIncrementOrDelay: incrementOrDelay,
      whiteIncrementOrDelayType: incrementOrDelayType,
      blackInitial: initial,
      blackIncrementOrDelay: incrementOrDelay,
      blackIncrementOrDelayType: incrementOrDelayType
    });
  };

  handlePlaySeek = data => {
    const { onSeekPlay } = this.props;
    const { ratingType, skillLevel, color, incrementOrDelayType, initial, incrementOrDelay } = data;

    onSeekPlay({
      color,
      initial,
      ratingType,
      skillLevel,
      incrementOrDelay,
      incrementOrDelayType,
      wildNumber: 0
    });
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
      currentGame
    } = this.props;
    const { status } = this.state;

    const isPlaying =
      game &&
      game.status === "playing" &&
      (Meteor.userId() === game.white.id || Meteor.userId() === game.black.id);

    if (!isPlaying && status === PLAY_STATUS_NONE) {
      return (
        <PlayOptionButtons
          handlePlayWithFriend={this.handlePlayWithFriend}
          handlePlayComputer={this.handlePlayComputer}
          handlePlaySeek={this.handlePlaySeek}
        />
      );
    }

    if (!isPlaying && status === PLAY_STATUS_FRIEND_OPTIONS) {
      return (
        <PlayFriendOptions
          onClose={() => {
            this.setState({ status: "none" });
          }}
          onPlay={this.handlePlayFriendOptions}
        />
      );
    }

    if (!isPlaying && status === PLAY_STATUS_WITH_FRIEND) {
      return (
        <PlayWithFriend
          onClose={() => {
            this.setState({ status: PLAY_STATUS_NONE });
          }}
          usersToPlayWith={usersToPlayWith}
          onChoose={this.handleChooseFriend}
        />
      );
    }

    if (!isPlaying && status === PLAY_STATUS_CHOOSE_BOT) {
      return (
        <PlayChooseBot
          onClose={() => {
            this.setState({ status: PLAY_STATUS_NONE });
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

export default PlayBlock;
