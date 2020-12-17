import React from "react";
import { gameExampleObject } from "../../../constants/gameExampleConstants";

class GameLibrary extends React.Component {
  render() {
    const gamelist = [];

    let whitename;
    let blackname;

    const games = [];
    games.push(gameExampleObject);

    for (let i = 0; i < games.length; i++) {
      let observers = games[i].observers;
      for (let j = 0; j < observers.length; j++) {
        if (observers[j].id === games[i].white.id) {
          whitename = observers[j].username;
        } else {
          blackname = observers[j].username;
        }
      }
      gamelist.push({
        name: "3 minut arina",

        result: games[i].result,
        white: whitename,
        black: blackname,
        status: games[i].status
      });
    }

    return (
      <div>
        {gamelist.length ? (
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
              <tr>
                <td style={{ padding: "5px 5px" }}>
                  {game.white}-vs-{game.black}
                </td>
                <td style={{ padding: "5px 5px" }}>{game.result}</td>
                <td style={{ padding: "5px 5px" }}>Oct 30 2019</td>

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

export default GameLibrary;
