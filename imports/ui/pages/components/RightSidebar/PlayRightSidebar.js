import React, { Component } from "react";
import { Tabs, Button } from "antd";
import ChatApp from "./elements/ChatApp";
import GameHistory from "./elements/GameHistory";
import { Meteor } from "meteor/meteor";
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
      this.props.userGameStatus !== "playing"
    ) {
      this.setState({ status: "none" });
    }
  }

  handlePlayWithFriend = () => {
    this.setState({ status: "play-with-friend" });
  };

  handlePlayComputer = () => {
    Meteor.call("startBotGame", "play_computer", 0, "standard", true, 15, 0, "none", 15, 0, "none");
    this.setState({ status: "playing" });
  };

  handleChoose = userId => {
    debugger;
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
    if (this.state.status === "playing") {
      return (
        <div className="playing">
          <GameHistory
            cssmanager={this.props.cssManager}
            game={this.props.RightSidebarData.MoveList}
            flip={this.props.flip}
            actionData={this.props.actionData}
            startGameExamine={this.props.startGameExamine}
            gameRequest={this.props.gameRequest}
            examineAction={this.props.examineAction}
            currentGame={this.props.currentGame}
          />
        </div>
      );
    }
  }
}

export default class PlayRightSidebar extends Component {
  constructor(props) {
    super();
  }

  renderBottom = () => {
    if (this.props.user.status.game === "playing") {
      return (
        <Tabs className="play-right-sidebar__bottom" defaultActiveKey="1" size="small" type="card">
          <TabPane tab={"Chat"} key="chat">
            <ChatApp isKibitz={false} gameId={this.props.gameId} />
          </TabPane>
          <TabPane tab={"Kibitz"} key="kibitz">
            <ChatApp isKibitz={true} gameId={this.props.gameId} />
          </TabPane>
        </Tabs>
      );
    }
  };

  render() {
    let isPlaying = this.props.user ? this.props.user.status.game === "playing" : false;
    let topClasses = isPlaying
      ? "play-right-sidebar__top play-right-sidebar__top--small"
      : "play-right-sidebar__top";
    return (
      <div className="play-right-sidebar">
        <Tabs className={topClasses} defaultActiveKey="1" size="small" type="card">
          <TabPane tab={"Play"} key="play">
            <PlayBlock
              userGameStatus={this.props.user && this.props.user.status.game}
              usersToPlayWith={this.props.usersToPlayWith}
              onChooseFriend={this.props.onChooseFriend}
              cssManager={this.props.cssManager}
              RightSidebarData={this.props.RightSidebarData}
              flip={this._flipboard}
            />
          </TabPane>

          <TabPane tab="observe" key="observe">
            observe
          </TabPane>
        </Tabs>

        {this.renderBottom()}
      </div>
    );
  }
}
