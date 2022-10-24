//import { Game } from "./Game";
import { Logger } from "../../lib/server/Logger";
import { Book } from "./Book";
import Chess from "../../node_modules/chess.js/chess";
import { Random } from "meteor/random";
import AWS from "aws-sdk";
import { Meteor } from "meteor/meteor";
import { Singular } from "./singular";
import { ClientMessages } from "../collections/ClientMessages";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

const lambda = new AWS.Lambda();
const debug = Meteor.bindEnvironment((msg) => log.debug(msg));
const error = Meteor.bindEnvironment((msg) => log.error(msg));

function awsDoIt(game) {
  return new Promise((resolve, reject) => {
    log.debug("awsDoIt promise 1");
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
          binc: game.clocks.black.inc_or_delay,
        },
      }),
    };
    const start = new Date();
    debug("awsDoIt promise 2");
    lambda.invoke(params, (err, data) => {
      //debug("lambda invoke returns: err=" + JSON.stringify(err) + ", data=" + JSON.stringify(data));
      if (err || !data) {
        reject(err);
        return;
      }

      debug("awsDoIt promise 3");
      if (!data || !data.Payload) {
        error(
          "game=" + game._id + ":'data or its payload is null', payload=" + JSON.stringify(data)
        );
        reject("data or its Payload is null");
        return;
      }
      debug("awsDoIt promise 4");
      const payload = JSON.parse(data.Payload);
      debug("awsDoIt promise 5");
      if (!payload || !payload.body) {
        error(
          "game=" + game._id + ":'payload or its body is null', payload=" + JSON.stringify(data)
        );
        reject("payload or its body is null");
        return;
      }
      debug("awsDoIt promise 6");
      const body = JSON.parse(payload.body);
      debug("awsDoIt promise 7");
      if (!body) {
        error("game=" + game._id + ":'body is null', payload=" + JSON.stringify(data));
        reject("body is null");
        return;
      }
      const end = new Date();
      const server_time = end - start;
      // const computer_start = Date.parse(body.timing.start);
      // const computer_end = Date.parse(body.timing.end);
      // const lambda_time = computer_end - computer_start;
      //
      // You can use time_diff/2 for lag if you wish
      //const time_diff = server_time - lambda_time;
      debug("awsDoIt promise 8");
      resolve(body.results);
    });
  });
}

const playGameMove = Meteor.bindEnvironment((game_id) => {
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

  awsDoIt(game)
    .then((result) => {
      log.debug("awsDoIt then 1");
      const chess = new Chess.Chess(game.fen);
      log.debug("awsDoIt then 2");
      const cmove = chess.move(result.bestmove, { sloppy: true });
      log.debug("awsDoIt then 3");
      Game.internalSaveLocalMove(
        { _id: "computer", username: "Computer" },
        "__computer__",
        game_id,
        cmove.san
      );
      log.debug("awsDoIt then 4");
    })
    .catch((e) => {
      log.error(
        "Error returned from the engine. Resigning this game with a client message: " +
          JSON.stringify(e)
      );
      ClientMessages.sendMessageToClient(
        game[game.tomove].id,
        "__computer__",
        "COMPUTER_RETURNED_ERROR"
      );
      Game._resignLocalGame("__computer__", game, "computer", 0);
    });
});

// function watchForComputerGames() {
//   Game.GameCollection.find({
//     $and: [
//       { status: "playing" },
//       { $or: [{ "white.id": "computer" }, { "black.id": "computer" }] },
//     ],
//   }).observeChanges({
//     added(id, fields) {
//       playGameMove(id);
//     },
//     changed(id, fields) {
//       if (!fields.fen) return; // A move had to have been made
//       playGameMove(id);
//     },
//   });
// }

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    Singular.addTask(watchForComputerGames);
  }
});
