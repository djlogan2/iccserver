import path from "path";
import fs from "fs";
import { Meteor } from "meteor/meteor";
import { Book } from "./Book";
import { Random } from "meteor/random";
import Chess from "chess.js";
import { Logger } from "../../lib/server/Logger";
import { Singular } from "./singular";
import { ClientMessages } from "../collections/ClientMessages";
import { Engine } from "node-uci";

const log = new Logger("server/engine_manager_js");

const available = [];

function engineError(game, error) {
  console.log("engineError " + error.message);
}

function engineExit(game, code) {
  console.log("engineExit " + code);
}

function engineMessage(game, value) {
  console.log("engineMessage " + value);
}

function engineMessageError(game, error) {
  console.log("engineMessageError " + error.message);
}

function engineOnline(game) {
  console.log("engineOnline");
}

async function set(engine, name, value) {
  await engine.setoption(name, value);
  await engine.isready();
}

async function runLocalStockfishJs(game) {
  let engineObject = available.pop();
  if (!engineObject) {
    const cwd = process.cwd();
    const stockfishpath = path.join(cwd, "/assets/app/stockfishjs/run.sh");
    fs.chmodSync(stockfishpath, "755");
    const engine = new Engine(stockfishpath);
    engineObject = { engine, game };
    engineObject.init = await engineObject.engine.init();
    await set(engineObject.engine, "Skill Level", "0");
    await set(engineObject.engine, "Skill Level Maximum Error", "900");
    await set(engineObject.engine, "Skill Level Probability Value", "10");
  }

  await engineObject.engine.ucinewgame();
  await engineObject.engine.isready();
  await engineObject.engine.position(game.fen);
  const result = await engineObject.engine.go({ movetime: 300 });
  available.push(engineObject);
  return result;
}

const playGameMove = Meteor.bindEnvironment((game_id) => {
  const game = global.Game.GameCollection.findOne({ _id: game_id });
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
    global.Game.internalSaveLocalMove(
      { _id: "computer", username: "Computer" },
      "__computer__",
      game_id,
      cmove.san
    );
    return;
  }

  runLocalStockfishJs(game)
    .then((result) => {
      const chess = new Chess.Chess(game.fen);
      const cmove = chess.move(result.bestmove, { sloppy: true });
      global.Game.internalSaveLocalMove(
        { _id: "computer", username: "Computer" },
        "__computer__",
        game_id,
        cmove.san
      );
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
      global.Game._resignLocalGame("__computer__", game, "computer", 0);
    });
});

function watchForComputerGames() {
  global.Game.GameCollection.find({
    $and: [
      { status: "playing" },
      { $or: [{ "white.id": "computer" }, { "black.id": "computer" }] }
    ]
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
