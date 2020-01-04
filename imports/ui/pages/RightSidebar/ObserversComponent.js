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
  setGameExaminMode(id, white, black) {
    Meteor.call("startLocalExaminedGame", "ExaminedGame", white, black, 0);
    //this.props.openObserverGame(id);
  }
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
    let whitename;
    let blackname;
    let games = this.props.examing;
    for (let i = 0; i < games.length; i++) {
      let observers = games[i].observers;
      for (let j = 0; j < observers.length; j++) {
        if (observers[j] === games[i].white.id) {
          whitename = this.getobserverName(observers[j]);
        } else {
          blackname = this.getobserverName(observers[j]);
        }
      }
      gamelist.push({
        id: games[i]._id,
        name: "3 minut arina",
        Result: games[i].result,
        white: whitename,
        black: blackname,
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
                onClick={this.setGameExaminMode.bind(this, game.id, game.white, game.black)}
                style={this.props.cssmanager.matchUserButton()}
              >
                {game.white}-vs-{game.black}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
