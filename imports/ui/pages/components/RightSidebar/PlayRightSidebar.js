import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Form, Tabs, Button, Radio } from "antd";
import KibitzChatApp from "./../Chat/KibitzChatApp";
import PersonalChatApp from "./../Chat/PersonalChatApp";
import GameHistory from "./elements/GameHistory";
import { GameControlBlock } from "./elements/GameControlBlock";

const { TabPane } = Tabs;

const PlayWithFriend = ({ onClose, onChoose, usersToPlayWith }) => {
  return (
    <div className="play-friend">
      <div className="play-friend__head">
        <h2 className="play-friend__name-title">Play with friend</h2>
        <Button onClick={onClose}>Back</Button>
      </div>
      <h3 className="play-friend__header">Friends</h3>
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
                Choose
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

class PlayChooseBot extends Component {
  constructor() {
    super();
    this.state = {
      difficulty: 5,
      color: "random"
    };
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
  handlePlay = () => {
    let color = this.state.color;

    if (color === "random") {
      color = Math.random() < 0.5 ? "white" : "black";
    }
    this.props.onPlay({
      skillLevel: this.state.difficulty,
      color: color
    });
  };
  render() {
    let { onClose } = this.props;
    return (
      <div className="play-friend">
        <div className="play-friend__head">
          <h2 className="play-friend__name-title">Play with computer</h2>
          <Button onClick={onClose}>Back</Button>
        </div>
        <Form className="play-bot__form" layout="vertical">
          <Form.Item label="Difficulty" name="difficulty">
            <Radio.Group onChange={this.handleChangeDifficulty} defaultValue={this.state.difficulty} value={this.state.difficulty}>
              <Radio.Button value={0}>0</Radio.Button>
              <Radio.Button value={1}>1</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={4}>4</Radio.Button>
              <Radio.Button value={5}>5</Radio.Button>
              <Radio.Button value={6}>6</Radio.Button>
              <Radio.Button value={7}>7</Radio.Button>
              <Radio.Button value={8}>8</Radio.Button>
              <Radio.Button value={9}>9</Radio.Button>
              <Radio.Button value={10}>10</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Color" name="color">
            <Radio.Group onChange={this.handleChangeColor} defaultValue={this.state.color} value={this.state.color}>
              <Radio.Button value={"random"}>Random</Radio.Button>
              <Radio.Button value={"white"}>White</Radio.Button>
              <Radio.Button value={"black"}>Black</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Button type="primary" onClick={this.handlePlay}>
            Start the game
          </Button>
        </Form>
      </div>
    );
  }
}

class PlayBlock extends Component {
  constructor(props) {
    super(props);
    let status = this.props.userGameStatus === "playing" ? "playing" : "none";
    this.state = {
      status: status // 'none', 'play-with-friend', 'playing'
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.userGameStatus !== this.props.userGameStatus &&
      nextProps.userGameStatus === "playing"
    ) {
      this.setState({ status: "playing" });
    } else if (
      nextProps.userGameStatus !== this.props.userGameStatus &&
      nextProps.userGameStatus !== "playing"
    ) {
      this.setState({ status: "none" });
    }
  }

  handlePlayWithFriend = () => {
    this.setState({ status: "play-with-friend" });
  };

  handlePlayComputer = () => {
    this.setState({ status: "choose-bot" });
    // Meteor.call("startBotGame", "play_computer", 0, "blitz", 5, 0, "none", 5, 0, "none", 3);
    // this.setState({ status: "playing" });
  };

  hanldePlayWithBot = data => {
    const { skillLevel, color } = data;
    // wild_number,
    //   rating_type,
    //   white_initial,
    //   white_increment_or_delay,
    //   white_increment_or_delay_type,
    //   black_initial,
    //   black_increment_or_delay,
    //   black_increment_or_delay_type,
    //   color,
    //   skill_level
    Meteor.call(
      "startBotGame",
      "play_computer",
      0,
      "blitz",
      5,
      0,
      "none",
      5,
      0,
      "none",
      skillLevel,
      color,
      err => {
        if (err) {
          debugger;
        }
      }
    );
    this.setState({ status: "playing" });
  };

  render() {
    if (this.state.status === "none") {
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
    if (this.state.status === "play-with-friend") {
      return (
        <PlayWithFriend
          onClose={() => {
            this.setState({ status: "none" });
          }}
          usersToPlayWith={this.props.usersToPlayWith}
          onChoose={this.props.onChooseFriend}
        />
      );
    }
    if (this.state.status === "choose-bot") {
      return (
        <PlayChooseBot
          onClose={() => {
            this.setState({ status: "none" });
          }}
          onPlay={this.hanldePlayWithBot}
        />
      );
    }
    if (this.state.status === "playing" && this.props.game) {
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
          <GameControlBlock
            gameId={this.props.game._id}
            game={this.props.game}
            flip={this.props.flip}
          />
        </div>
      );
    }
    return null;
  }
}

export default class PlayRightSidebar extends Component {
  constructor(props) {
    super();
  }

  renderBottom = () => {
    if (this.props.user.status && this.props.user.status.game === "playing") {
      const whiteId = this.props.game.white.id;
      const blackId = this.props.game.black.id;
      let isPlayersWhite = Meteor.userId() === whiteId;
      return (
        <Tabs className="play-right-sidebar__bottom" defaultActiveKey="1" size="small" type="card">
          <TabPane tab={"Chat"} key="chat">
            <PersonalChatApp opponentId={isPlayersWhite ? blackId : whiteId} />
          </TabPane>
          <TabPane tab={"Kibitz"} key="kibitz">
            <KibitzChatApp isKibitz={true} gameId={this.props.gameId} />
          </TabPane>
        </Tabs>
      );
    }
  };

  render() {
    let isPlaying =
      this.props.user && this.props.user.status ? this.props.user.status.game === "playing" : false;
    let topClasses = isPlaying
      ? "play-right-sidebar__top play-right-sidebar__top--small"
      : "play-right-sidebar__top";
    return (
      <div className="play-right-sidebar">
        <Tabs className={topClasses} defaultActiveKey="1" size="small" type="card">
          <TabPane tab={"Play"} key="play">
            <PlayBlock
              game={this.props.game}
              userGameStatus={
                this.props.user && this.props.user.status && this.props.user.status.game
              }
              usersToPlayWith={this.props.usersToPlayWith}
              onChooseFriend={this.props.onChooseFriend}
              cssManager={this.props.cssManager}
              RightSidebarData={this.props.RightSidebarData}
              flip={this.props.flip}
            />
          </TabPane>

          <TabPane tab="observe" key="observe">
            observe
          </TabPane>
        </Tabs>
        {this.props.user && this.props.game && this.renderBottom()}
      </div>
    );
  }
}
