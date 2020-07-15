import React, { Component } from "react";
import { Input, AutoComplete, Button } from "antd";
import { AudioOutlined } from "@ant-design/icons";
const NAMES = ["ihnat", "Ruy", "Dawid", "Lena"];
const { Search } = Input;

const ExamineObserverTabBlock = ({ game, userId, ...props }) => {
  let ownerData = !!game.observers ? game.observers.find(item => item.id === game.owner) : null;
  return (
    <div className="examine-observer-tab-block">
      <div className="examine-observer-tab-block__head">
        <div className="examine-observer-tab-block__name">
          <img src="" alt="" className="examine-observer-tab-block__name-img" />
          <h2 className="examine-observer-tab-block__name-title">{ownerData.username}</h2>
        </div>
        <span className="examine-observer-tab-block__head-right">
          {game.observers.length - 1} people are observing {ownerData.username}’s board
        </span>
      </div>
      <div className="examine-observer-tab-block__action-list">
        <Button
          onClick={() => {
            props.unObserveUser(userId);
          }}
        >
          Unobserve
        </Button>
      </div>
      <ul className="examine-observer-tab-block__list">
        {game.observers.map(observerItem => {
          if (game.owner === userId) {
            return (
              <li key={observerItem.username} className="examine-owner-tab-block__list-item">
                {observerItem.username}
              </li>
            );
          }
          return (
            <li key={observerItem.username} className="examine-observer-tab-block__list-item">
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ExamineOwnerTabBlock = ({ game }) => {
  return (
    <div className="examine-owner-tab-block">
      <div className="examine-owner-tab-block__head">
        {/* <div className="examine-owner-tab-block__name"> */}
        {/* <h2 className="examine-owner-tab-block__name-title">{ownerData.username}</h2> */}
        {/* </div> */}
        <span className="examine-owner-tab-block__head-right">{game.observers.length - 1} people are observing your board</span>
      </div>
      <ul className="examine-owner-tab-block__list">
        {game.observers.map(observerItem => {
          if (game.owner === observerItem.id) {
            return null;
          }
          return (
            <li key={observerItem.username} className="examine-owner-tab-block__list-item">
              {observerItem.username}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default class ExamineObserveTab extends Component {
  constructor(props) {
    super();
    this.state = {
      searchValue: "",
      observerId: null
    };
  }
  handleSelect = e => {

  };
  handleSearch = e => {

    this.setState({ searchValue: e });
  };
  handleObserve = e => {
    let observerUsername = e.target.value;
    let observer = this.props.allUsers.find(item => observerUsername === item.username);
    this.setState({
      observerId: observer._id
    });
    this.props.observeUser(observer._id);
  };
  handleUnobserve = e => {
    this.setState({ observerId: null });
  };
  getList = () => {
    let { searchValue } = this.state;
    let that = this;
    let userList = this.props.allUsers.filter(item => item._id !== this.props.userId).map(item => item.username);
    const list = userList.filter(item => item.toLowerCase().indexOf(searchValue) >= 0);
    return list.map((name, i) => {
      return {
        value: name,
        label: (
          <div className="observe-search__option" key={i}>
            {name}{" "}
            <Button value={name} onClick={that.handleObserve}>
              Observe
            </Button>
          </div>
        )
      };
    });
  };

  render() {
    let options = this.getList();
    let isObserving = this.props.userGameStatus === "observing";
    let isShowing = this.props.userGameStatus === "examining" && this.props.game.observers.length > 1;
    return (
      <div className="examine-observer-tab">
        {!isShowing && !isObserving && <AutoComplete options={options} style={{ width: 200 }} onSelect={this.handleSelect} onSearch={this.handleSearch} placeholder="input here" />}
        {isObserving && <ExamineObserverTabBlock game={this.props.game} userId={this.props.userId} unObserveUser={this.props.unObserveUser} />}
        {isShowing && <ExamineOwnerTabBlock game={this.props.game} />}
      </div>
    );
  }
}
