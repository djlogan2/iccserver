import React, { Component } from "react";
import { AutoComplete, Button } from "antd";
import { get } from "lodash";
import { compose } from "redux";

import { translate } from "../../../../../HOCs/translate";
import ExamineObserverTabBlock from "../ExamineObserverTabBlock/ExamineObserverTabBlock";
import ExamineOwnerTabBlock from "../ExamineOwnerTabBlock/ExamineOwnerTabBlock";
import { withTracker } from "meteor/react-meteor-data";
import { mongoCss } from "../../../../../../../imports/api/client/collections";
import injectSheet from "react-jss";
import { dynamicStyles } from "./dynamicStyles";
import { Meteor } from "meteor/meteor";

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
    const { allUsers, translate, classes } = this.props;
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
          <div className={classes.observeSearch} key={`${name}-${i}`}>
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
    const { game, unObserveUser, translate, classes } = this.props;

    const options = this.getList();
    const isObserving = Meteor.user().status.game === "observing";
    const isShowing = Meteor.user().status.game === "examining" && game.observers.length;

    return (
      <div className={classes.container}>
        {(!isShowing && !isObserving) ||
          (isShowing && game.observers.length === 1 && (
            <AutoComplete
              id="find-users-input"
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

export default compose(
  translate("Examine.ExamineObserveTab"),
  withTracker(() => {
    return {
      css: mongoCss.findOne(),
      allUsers: Meteor.users.find().fetch(),
    };
  }),
  injectSheet(dynamicStyles)
)(ExamineObserveTab);
