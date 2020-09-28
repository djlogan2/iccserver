import React, { Component } from "react";
import { AutoComplete, Button } from "antd";

const ExamineObserverTabBlock = ({ game, ...props }) => {
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
            props.unObserveUser(Meteor.userId());
          }}
        >
          Unobserve
        </Button>
      </div>
      <ul className="examine-observer-tab-block__list">
        {game.observers.map(observerItem => {
          if (game.owner === Meteor.userId()) {
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
  const handleAddExaminer = (game_id, id_to_add) => {
    // localAddExaminer: (message_identifier, game_id, id_to_add)
    // localRemoveExaminer: (message_identifier, game_id, id_to_remove)
    return () => {
      Meteor.call("localAddExaminer", "localAddExaminer", game_id, id_to_add, error => {
        if (error) {
          debugger;
        }
      });
    };
  };
  const handleRemoveExaminer = (game_id, id_to_remove) => {
    // localAddExaminer: (message_identifier, game_id, id_to_add)
    // localRemoveExaminer: (message_identifier, game_id, id_to_remove)
    return () => {
      Meteor.call("localRemoveExaminer", "localRemoveExaminer", game_id, id_to_remove, error => {
        if (error) {
          debugger;
        }
      });
    };
  };

  if (game.owner === Meteor.userId()) {
    return (
      <div className="examine-owner-tab-block">
        <div className="examine-owner-tab-block__head">
          <span className="examine-owner-tab-block__head-right">
            {game.observers.length - 1} people are observing your board
          </span>
        </div>
        <ul className="examine-owner-tab-block__list">
          {game.observers.map(observerItem => {
            if (game.owner === observerItem.id) {
              return null;
            }
            if (Meteor.userId() === observerItem.id) {
              return null;
            }
            let isExaminer =
              game.examiners.filter(examinerItem => examinerItem.id === observerItem.id).length > 0;
            return (
              <li key={observerItem.username} className="examine-owner-tab-block__list-item">
                {isExaminer ? (
                  <button
                    onClick={handleRemoveExaminer(game._id, observerItem.id)}
                    className="examine-observer-tab-block__list-item__move-pieces-btn examine-observer-tab-block__list-item__move-pieces-btn--active"
                  />
                ) : (
                  <button
                    onClick={handleAddExaminer(game._id, observerItem.id)}
                    className="examine-observer-tab-block__list-item__move-pieces-btn"
                  />
                )}
                {observerItem.username}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="examine-owner-tab-block">
      <div className="examine-owner-tab-block__head">
        <span className="examine-owner-tab-block__head-right">
          {game.observers.length - 1} people are observing this board
        </span>
      </div>
      <ul className="examine-owner-tab-block__list">
        {game.observers.map(observerItem => {
          if (game.owner === observerItem.id) {
            return null;
          }
          if (Meteor.userId() === observerItem.id) {
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
    super(props);
    this.state = {
      searchValue: "",
      observerId: null
    };
  }
  handleSelect = () => {};
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
  getList = () => {
    let { searchValue } = this.state;
    let that = this;
    let userList = this.props.allUsers
      .filter(item => item._id !== Meteor.userId())
      .map(item => item.username);
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
    let isObserving = Meteor.user().status.game === "observing";
    let isShowing =
      Meteor.user().status.game === "examining" && this.props.game.observers.length > 1;
    return (
      <div className="examine-observer-tab">
        {!isShowing && !isObserving && (
          <AutoComplete
            options={options}
            style={{ width: 200 }}
            onSelect={this.handleSelect}
            onSearch={this.handleSearch}
            placeholder="Find user to observe"
          />
        )}
        {isObserving && (
          <ExamineObserverTabBlock
            game={this.props.game}
            unObserveUser={this.props.unObserveUser}
          />
        )}
        {isShowing && <ExamineOwnerTabBlock game={this.props.game} />}
      </div>
    );
  }
}
