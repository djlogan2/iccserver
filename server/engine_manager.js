import { Game } from "./Game";
import { Logger } from "../lib/server/Logger";
import { Book } from "./Book";
import Chess from "chess.js";
import { Random } from "meteor/random";
import AWS from "aws-sdk";
import { Meteor } from "meteor/meteor";
import { Singular } from "./singular";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

const lambda = new AWS.Lambda();

function awsDoIt(game) {
  return new Promise((resolve, reject) => {
    let wtime = parseInt(game.clocks.white.current / 4);
    let btime = parseInt(game.clocks.black.current / 4);
    if (wtime === 0) wtime = 250;
    if (btime === 0) wtime = 250;

    //const elo = ((2850 - 1350) * game.skill_level) / 10 + 1350;
    const levels = [1350, 1450, 1550, 1650, 1700, 1750, 1850, 1900, 1950, 2100, 2300];
    const elo = levels[game.skill_level];
    const params = {
      FunctionName: "icc-stockfish",
      Payload: JSON.stringify({
        options: { UCI_LimitStrength: true, UCI_Elo: elo },
        position: game.fen,
        gooptions: {
          wtime: wtime,
          btime: btime,
          winc: game.clocks.white.inc_or_delay,
          binc: game.clocks.black.inc_or_delay
        }
      })
    };
    const start = new Date();
    lambda.invoke(params, (err, data) => {
      if (err || !data) {
        reject(err);
        return;
      }
      const payload = JSON.parse(data.Payload);
      const body = JSON.parse(payload.body);
      const end = new Date();
      const server_time = end - start;
      const computer_start = Date.parse(body.timing.start);
      const computer_end = Date.parse(body.timing.end);
      const lambda_time = computer_end - computer_start;
      // You can use time_diff/2 for lag if you wish
      //const time_diff = server_time - lambda_time;
      resolve(body.results);
    });
  });
}

const playGameMove = Meteor.bindEnvironment(game_id => {
  const game = Game.GameCollection.findOne({ _id: game_id });
  if (!game) return;
  if (game.white.id === "computer" && game.tomove !== "white") return;
  if (game.black.id === "computer" && game.tomove !== "black") return;
  if (game.status !== "playing") return;
  const bookEntry = Book.findBook(game.fen);
  if (!!bookEntry) {
    let wt = bookEntry.entries.length;
    const sum = (bookEntry.entries.length * (bookEntry.entries.length + 1)) / 2; // n(n+1)/2
    const rnd = Random.fraction();
    let start = 0.0;
    let move;
    for (let x = 0; x < bookEntry.entries.length && !move; x++) {
      start += wt / sum;
      wt--;
      if (rnd <= start) {
        move = bookEntry.entries[x];
      }
    }
    if (!move) move = bookEntry.entries[bookEntry.entries.length - 1];
    const chess = new Chess.Chess(game.fen);
    const cmove = chess.move(move.smith, { sloppy: true });
    Game.internalSaveLocalMove(
      { _id: "computer", username: "Computer" },
      "__computer__",
      game_id,
      cmove.san
    );
    return;
  }

  awsDoIt(game).then(result => {
    const chess = new Chess.Chess(game.fen);
    const cmove = chess.move(result.bestmove, { sloppy: true });
    Game.internalSaveLocalMove(
      { _id: "computer", username: "Computer" },
      "__computer__",
      game_id,
      cmove.san
    );
  });
});

function watchForComputerGames() {
  Game.GameCollection.find({
    $and: [{ status: "playing" }, { $or: [{ "white.id": "computer" }, { "black.id": "computer" }] }]
  }).observeChanges({
    added(id, fields) {
      playGameMove(id);
    },
    changed(id, fields) {
      if (!fields.fen) return; // A move had to have been made
      playGameMove(id);
    }
  });
}

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    Singular.addTask(watchForComputerGames);
  }
});
