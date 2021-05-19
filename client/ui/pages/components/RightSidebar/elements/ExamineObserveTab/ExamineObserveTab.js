import React, { Component } from "react";
import { AutoComplete, Button } from "antd";
import { get } from "lodash";
import { translate } from "../../../../../HOCs/translate";
import ExamineObserverTabBlock from "../ExamineObserverTabBlock/ExamineObserverTabBlock";
import ExamineOwnerTabBlock from "../ExamineOwnerTabBlock/ExamineOwnerTabBlock";

class ExamineObserveTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: "",
      observerId: null,
    };
  }

  handleSearch = (searchValue) => {
    this.setState({ searchValue });
  };

  handleObserve = (e) => {
    const { allUsers, observeUser } = this.props;
    const observerUsername = get(e, "target.value");

    const observer = allUsers.find((item) => observerUsername === item.username);

    this.setState({
      observerId: observer._id,
    });

    observeUser(observer._id);
  };

  getList = () => {
    const { allUsers, translate } = this.props;
    const { searchValue } = this.state;

    const userList = allUsers
      .filter(
        (item) =>
          item._id !== Meteor.userId() &&
          !!item.status &&
          (item.status.game === "examining" || item.status.game === "playing") &&
          item.username.toLowerCase().includes(searchValue)
      )
      .map((item) => item.username);

    return userList.map((name, i) => {
      return {
        value: name,
        label: (
          <div className="observe-search__option" key={`${name}-${i}`}>
            {name}
            <Button value={name} onClick={this.handleObserve}>
              {translate("observe")}
            </Button>
          </div>
        ),
      };
    });
  };

  render() {
    const { game, unObserveUser, translate } = this.props;

    const options = this.getList();
    const isObserving = Meteor.user().status.game === "observing";
    const isShowing = Meteor.user().status.game === "examining" && game.observers.length;

    return (
      <div className="examine-observer-tab">
        {(!isShowing && !isObserving) ||
          (isShowing && game.observers.length === 1 && (
            <AutoComplete
              options={options}
              style={{ width: "100%" }}
              onSearch={this.handleSearch}
              placeholder={translate("findUsers")}
            />
          ))}
        {isObserving && <ExamineObserverTabBlock game={game} unObserveUser={unObserveUser} />}
        {isShowing && <ExamineOwnerTabBlock game={game} />}
      </div>
    );
  }
}

export default translate("Examine.ExamineObserveTab")(ExamineObserveTab);
