import React from "react";
import { Meteor } from "meteor/meteor";
import { translate } from "../../HOCs/translate";
import { GameHistoryCollection } from "../../../api/client/collections";
import ExportPgnButton from "../components/Button/ExportPgnButton";

class GameHistroyComponent extends React.Component {
  getGameHistory() {
    return GameHistoryCollection.find({
      $or: [{ "white.id": Meteor.userId() }, { "black.id": Meteor.userId() }],
    }).fetch();
  }

  setGameExaminMode(id) {
    Meteor.call("examineGame", "ExaminedGame", id);
  }

  render() {
    const { translate } = this.props;

    const gamelist = [];
    let result;

    const games = this.getGameHistory();

    games.forEach((game) => {
      if (
        (game.white.id === Meteor.userId() && game.result === "1-0") ||
        (game.black.id === Meteor.userId() && game.result === "0-1")
      ) {
        result = translate("won");
      } else {
        result = translate("loss");
      }

      gamelist.push({
        result,
        id: game._id,
        white: game.white.name,
        black: game.black.name,
        time: game.startTime.toDateString(),
      });
    });

    return (
      <div>
        {gamelist.length && (
          <table
            className="gamehistory"
            style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  {translate("players")}
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  {translate("result")}
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  {translate("date")}
                </th>
                <th style={{ textAlign: "center", background: "#f1f1f1", padding: "5px 5px" }}>
                  {translate("pgn")}
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
                    {translate("playersVs", { white: game.white, black: game.black })}
                  </td>
                  <td style={{ padding: "5px 5px" }}>{game.result}</td>
                  <td style={{ padding: "5px 5px" }}>{game.time}</td>
                  <td style={{ padding: "5px 5px" }}>
                    <ExportPgnButton
                      id={game.id}
                      src={this.props.cssManager.buttonBackgroundImage("pgnIcon")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default translate("Common.MainPage.")(GameHistroyComponent);
