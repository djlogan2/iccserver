import React, { Component } from "react";
import { Input, AutoComplete, Button } from "antd";
import { AudioOutlined } from "@ant-design/icons";
const NAMES = ["ihnat", "Ruy", "Dawid", "Lena"];
const { Search } = Input;

const ExamineObserverTabBlock = ({ game }) => {
  let ownerData = game.examiners.find(item => item.id === game.owner);
  return (
    <div className="examine-observer-tab-block">
      <Button onClick={this.handleUnobserve}>Unobserve</Button>
      <div className="examine-observer-tab-block__head">
        <div className="examine-observer-tab-block__name">
          <img src="" alt="" className="examine-observer-tab-block__name-img" />
          <h2 className="examine-observer-tab-block__name-title">{ownerData.username}</h2>
        </div>
        <span className="examine-observer-tab-block__head-right">
          {game.examiners.length} people are observing Mike’s board
        </span>
      </div>
      <ul className="examine-observer-tab-block__list">
        {game.examiners.map(examinerItem => {
          return (
            <li key={examinerItem.username} className="examine-observer-tab-block__list-item">
              {examinerItem.username}
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
    debugger;
  };
  handleSearch = e => {
    debugger;
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
    let userList = this.props.allUsers.map(item => item.username);
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
    return (
      <div className="examine-observer-tab">
        {this.state.observerId === null ? (
          <AutoComplete
            options={options}
            style={{ width: 200 }}
            onSelect={this.handleSelect}
            onSearch={this.handleSearch}
            placeholder="input here"
          />
        ) : (
          <ExamineObserverTabBlock game={this.props.game} />
        )}
      </div>
    );
  }
}
