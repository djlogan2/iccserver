import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

export default class ObserversComponent extends React.Component {
  constructor(props) {
    super(props);
    
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
  setGameExaminMode(id) {
    Meteor.call("examineGame", "ExaminedGame", id);
  }

  
  render() {
    let gamelist = [];

    let games = this.props.examing;
    for (let i = 0; i < games.length; i++) {
      let observer = games[i].observers[i].username;
      gamelist.push({
        id: games[i]._id,
        name: "3 minut arina",
        player: observer,
        result: games[i].result,
        status: games[i].status,
        time: games[i].startTime.toDateString()
      });
    }

    return (
      <div>
        {gamelist.length > 0 ? (
          <table style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  Players
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  Result
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  Date
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {gamelist.map((game, index) => (
                <tr onClick={this.setGameExaminMode.bind(this, game.id)}>
                  <td style={{ padding: "5px 5px" }}>{game.player}</td>
                  <td style={{ padding: "5px 5px" }}>{game.result}</td>
                  <td style={{ padding: "5px 5px" }}>{game.time}</td>
                  <td style={{ padding: "5px 5px" }}>{game.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  }
}
