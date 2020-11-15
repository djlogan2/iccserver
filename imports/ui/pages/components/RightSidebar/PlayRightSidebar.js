import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Button, Form, InputNumber, Radio, Tabs } from "antd";
import KibitzChatApp from "./../Chat/KibitzChatApp";
import PersonalChatApp from "./../Chat/PersonalChatApp";
import GameHistory from "./elements/GameHistory";
import { GameControlBlock } from "./elements/GameControlBlock";

import i18n from "meteor/universe:i18n";
import { Logger } from "../../../../../lib/client/Logger";
import { PlayChooseBot } from "./PlayChooseBot";
import { findRatingObject } from "../../../../../lib/ratinghelpers";
import { DynamicRatingsCollection } from "../../../../api/client/collections";

const log = new Logger("client/PlayRightSidebar");

const getLang = () => {
  return (
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage ||
    "en-US"
  );
};

const { TabPane } = Tabs;

const PlayWithFriend = ({ onClose, onChoose, usersToPlayWith }) => {
  let translator = i18n.createTranslator("Play.PlayWithFriend", getLang());
  return (
    <div className="play-friend">
      <div className="play-friend__head">
        <h2 className="play-friend__name-title">{translator("PLAY_WITH_FRIEND")}</h2>
        <Button onClick={onClose}>{translator("BACK")}</Button>
      </div>
      <h3 className="play-friend__header">{translator("FRIENDS")}</h3>
      <ul className="play-friend__list">
        {usersToPlayWith.map(userItem => {
          return (
            <li key={userItem.username} className="play-friend__list-item">
              {userItem.username}{" "}
              <Button
                onClick={() => {
                  onChoose(userItem._id);
                }}
              >
                {translator("CHOOSE")}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

class PlayFriendOptions extends Component {
  constructor(props) {
    super(props);
    log.trace("PlayFriendOptions constructor", props);
    this.state = {
      color: "random",
      incrementOrDelayType: "inc",
      initial: 7,
      incrementOrDelay: 0,
      ratingType: "none"
    };
  }
  componentDidMount() {
    this.updateRating();
  }
  handleChangeDifficulty = e => {
    this.setState({
      difficulty: e.target.value
    });
  };
  handleChangeColor = e => {
    this.setState({
      color: e.target.value
    });
  };
  handleChangeIncrementOrDelayType = e => {
    this.setState({
      incrementOrDelayType: e.target.value
    });
  };

  handleChange = inputName => {
    return number => {
      let newState = {};
      let that = this;
      newState[inputName] = number;
      this.setState(newState, () => {
        that.updateRating();
      });
    };
  };

  updateRating = () => {
    const rating_object = findRatingObject(
      0,
      "white", // Right now white and black always match, so just hard code
      this.state.initial,
      this.state.incrementOrDelay,
      this.state.incrementOrDelayType,
      DynamicRatingsCollection.find().fetch()
    );
    this.setState({ ratingType: rating_object.rating_type });
  };

  handlePlay = () => {
    let color = this.state.color;
    let ratingType = this.state.ratingType;

    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    this.props.onPlay({
      ratingType: ratingType,
      // skillLevel: this.state.difficulty,
      color: color,
      incrementOrDelayType: this.state.incrementOrDelayType,
      initial: this.state.initial,
      incrementOrDelay: this.state.incrementOrDelay
    });
  };

  render() {
    log.trace("PlayFriendOptions render", this.props);
    let { onClose } = this.props;
    return (
      <div className="play-friend">
        <div className="play-friend__head">
          <h2 className="play-friend__name-title">Create game</h2>
          <Button onClick={onClose}>Back</Button>
        </div>
        <Form
          className="play-bot__form"
          layout="vertical"
          initialValues={{
            initial: this.state.initial,
            incrementOrDelay: this.state.incrementOrDelay,
            color: "random"
          }}
        >
          <Form.Item label="Time control" name="time-control">
            <Radio.Group
              onChange={this.handleChangeIncrementOrDelayType}
              // defaultValue={this.state.incrementOrDelayType}
              value={this.state.incrementOrDelayType}
            >
              <Radio.Button value={"inc"}>inc</Radio.Button>
              <Radio.Button value={"none"}>none</Radio.Button>
              <Radio.Button value={"us"}>us</Radio.Button>
              <Radio.Button value={"bronstein"}>bronstein</Radio.Button>
            </Radio.Group>
            <div className="play-right-sidebar__inc-deley-wrap">
              <Form.Item label="Initial" name="initial">
                <InputNumber
                  min={0}
                  disabled={this.state.incrementOrDelayType === "none"}
                  value={this.state.initial}
                  onChange={this.handleChange("initial")}
                />
              </Form.Item>
              <Form.Item label="increment or delay" name="incrementOrDelay">
                <InputNumber
                  min={0}
                  disabled={this.state.incrementOrDelayType === "none"}
                  value={this.state.incrementOrDelay}
                  onChange={this.handleChange("incrementOrDelay")}
                />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="rating type" name="ratingType">
            <p>{this.state.ratingType}</p>
          </Form.Item>
          <Form.Item label="Color" name="color">
            <Radio.Group onChange={this.handleChangeColor} value={this.state.color}>
              <Radio.Button value={"random"}>Random</Radio.Button>
              <Radio.Button value={"white"}>White</Radio.Button>
              <Radio.Button value={"black"}>Black</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" onClick={this.handlePlay}>
            Select opponent
          </Button>
        </Form>
      </div>
    );
  }
}

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
