import React from "react";
import { Meteor } from "meteor/meteor";

import { translate } from "../../HOCs/translate";

class ObserversComponent extends React.Component {
  setGameExaminMode(id) {
    Meteor.call("examineGame", "ExaminedGame", id);
  }

  render() {
    const { translate, game } = this.props;

    const gamelist = [];

    let whitename;
    let blackname;
    const { observers } = game;

    observers.forEach(observer => {
      if (observer.id === game.white.id) {
        whitename = observer.username;
      } else {
        blackname = observer.username;
      }
    });

    gamelist.push({
      name: "3 minut arina",

      result: game.result,
      white: whitename,
      black: blackname,
      status: game.status,
      time: game.startTime.toDateString()
    });

    return (
      <div>
        {!!gamelist.length && (
          <table style={{ width: "100%", textAlign: "center", border: "1px solid #f1f1f1" }}>
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
                  {translate("status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {gamelist.map(game => (
                <tr onClick={this.setGameExaminMode.bind(this, game._id)}>
                  <td style={{ padding: "5px 5px" }}>
                    {translate("playersColumn", { white: game.white, black: game.black })}
                  </td>
                  <td style={{ padding: "5px 5px" }}>{game.result}</td>
                  <td style={{ padding: "5px 5px" }}>{game.time}</td>
                  <td style={{ padding: "5px 5px" }}>{game.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default translate("Common.rightBarBottom.Observers")(ObserversComponent);
