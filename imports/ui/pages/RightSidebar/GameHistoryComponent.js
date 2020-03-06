import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { GameHistoryCollection } from "../../../api/collections";
import TrackerReact from "meteor/ultimatejs:tracker-react";

export default class GameHistroyComponent extends TrackerReact(React.Component) {
  constructor(props) {
    super(props);

    this.state = {
      subscription: {
        gameHistory: Meteor.subscribe("game_history")
      }
    };
  }
  componentWillUnmount() {
    this.state.subscription.gameHistory.stop();
  }
  getGameHistory() {
    const GameHistory = GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }]
    }).fetch();

    return GameHistory;
  }
  setGameExaminMode(id) {
    Meteor.call("examineGame", "ExaminedGame", id);
  }

  render() {
    let gamelist = [];
    let games = [];
    let result = null;
    let title;
    games = this.getGameHistory();
    for (let i = 0; i < games.length; i++) {
      if (
        (games[i].white.id === Meteor.userId() && games[i].result === "1-0") ||
        (games[i].black.id === Meteor.userId() && games[i].result === "0-1")
      ) {
        result = "Won";
      } else {
        result = "Loss";
      }
      gamelist.push({
        id: games[i]._id,
        name: "3 minut arina",
        white: games[i].white.name,
        black: games[i].black.name,
        result: result,
        time: games[i].startTime.toDateString()
      });
    }

    return (
      <div>
        {gamelist.length > 0 ? (
          <table
            className="gamehistory"
            style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
          >
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
                  PGN
                </th>
              </tr>
            </thead>
            <tbody>
              {gamelist.map((game, index) => (
                <tr
                  key={index}
                  style={{ cursor: "pointer" }}
                  onClick={this.setGameExaminMode.bind(this, game.id)}
                >
                  <td style={{ padding: "5px 5px" }}>
                    {game.white}-vs-{game.black}
                  </td>
                  <td style={{ padding: "5px 5px" }}>{game.result}</td>
                  <td style={{ padding: "5px 5px" }}>{game.time}</td>
                  <td style={{ padding: "5px 5px" }}>
                    <a href={"export/pgn/history/" + game.id}>
                      <img
                        src={this.props.cssmanager.buttonBackgroundImage("pgnIcon")}
                        style={{ width: "25px", height: "25px" }}
                        alt="PgnDownload"
                      />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  }
}
