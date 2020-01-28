import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import i18n from "meteor/universe:i18n";

export default class GameLibraryComponent extends React.Component {
  getLang() {
    return (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      "en-US"
    );
  }

  render() {
    let gamelist = [];

    let whitename;
    let blackname;

    let game1 = {
      _id: "YiaXtYD4eQKigz9SS",
      result: "1-0",
      fen: "rnbqkbnr/pp1ppppp/2p5/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      tomove: "white",
      white: {
        id: "sBAs6EKd49Z6yNT7Z",
        name: "amit",
        rating: 1600
      },
      black: {
        id: "zzrqD3toyyg9zDsnC",
        name: "kalpesh",
        rating: 1600
      },
      wild: 0,
      rating_type: "standard",
      rated: true,
      clocks: {
        white: {
          initial: 14,
          inc_or_delay: 1,
          delaytype: "inc",
          current: 838525,
          starttime: 1579876933173
        },
        black: {
          initial: 14,
          inc_or_delay: 1,
          delaytype: "inc",
          current: 838674,
          starttime: 1579876930786
        }
      },
      status: "examining",
      actions: [
        {
          type: "move",
          issuer: "sBAs6EKd49Z6yNT7Z",
          parameter: {
            move: "e3",
            lag: 12,
            ping: 61,
            gamelag: 75,
            gameping: 93
          },
          time: "2020-01-24T14:42:10.788Z"
        },
        {
          type: "move",
          issuer: "zzrqD3toyyg9zDsnC",
          parameter: {
            move: "c6",
            lag: 1,
            ping: 2,
            gamelag: 12,
            gameping: 101
          },
          time: "2020-01-24T14:42:13.175Z"
        },
        {
          type: "resign",
          issuer: "zzrqD3toyyg9zDsnC",
          time: "2020-01-24T14:42:14.624Z"
        }
      ],
      observers: [
        {
          id: "sBAs6EKd49Z6yNT7Z",
          username: "amit"
        },
        {
          id: "zzrqD3toyyg9zDsnC",
          username: "kalpesh"
        }
      ],
      variations: {
        hmtb: 0,
        cmi: 2,
        movelist: [
          {
            variations: [1]
          },
          {
            move: "e3",
            prev: 0,
            current: 840000,
            variations: [2]
          },
          {
            move: "c6",
            prev: 1,
            current: 840073
          }
        ]
      },
      lag: {
        white: {
          active: [],
          pings: [57, 93, 51, 45, 30, 37]
        },
        black: {
          active: [],
          pings: [143, 203, 124, 101, 77, 81]
        }
      },
      startTime: "2020-01-24T14:42:14.624Z",
      examiners: [
        {
          id: "sBAs6EKd49Z6yNT7Z",
          username: "amit"
        },
        {
          id: "zzrqD3toyyg9zDsnC",
          username: "kalpesh"
        }
      ]
    };
    let games = [];
    games[0] = game1;
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
