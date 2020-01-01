import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import i18n from "meteor/universe:i18n";

export default class ObserversComponent extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.state = {
      subscription: {
        loggedOnUsers: Meteor.subscribe("loggedOnUsers")
      }
    };
  }
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }
  handelUserClick() {}
  getobserverName(id) {
    let user = Meteor.users.findOne({ _id: id });
    if (!!user) return user.username;
  }
  componentWillUnmount() {
    this.state.subscription.loggedOnUsers.stop();
  }
  render() {
    let gamelist = [];
    let observername = [];
    let games = this.props.examing;
    for (let i = 0; i < games.length; i++) {
      let observers = games[i].observers;
      for (let j = 0; j < observers.length; j++) {
        let username = this.getobserverName(observers[j]);
        observername.push(username);
      }
      gamelist.push({
        name: "3 minut arina",
        Result: "won",
        Players: observername[0] + "vs" + observername[1],
        status: games[i].status
      });
    }
    return (
      <div>
        <div style={this.props.cssmanager.tabSeparator()} />
        <div style={this.props.cssmanager.subTabHeader()}>
          {gamelist.map((game, index) => (
            <div key={index} className="userlist">
              <button
                onClick={this.handelUserClick.bind(this)}
                style={this.props.cssmanager.matchUserButton()}
              >
                {game.name}--
                {game.Players}--
                {game.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
