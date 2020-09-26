import { Game } from "./Game";
import { Logger } from "../lib/server/Logger";
import { Book } from "./Book";
import Chess from "chess.js";
import { Random } from "meteor/random";
import AWS from "aws-sdk";
import { AWSmanager } from "./awsmanager";
import { Meteor } from "meteor/meteor";
import { Singular } from "./singular";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");
const ANALYSIS_THREADS = 1;

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

const lambda = new AWS.Lambda();

async function start_engine(game_id) {
  log.debug("start_engine " + game_id);
  return AWSmanager.getEngine(game_id, { MultiPV: 3 });
}

async function stop_engine(game_id) {
  AWSmanager.releaseEngine(game_id);
}

const aws_debug = Meteor.bindEnvironment((message, data, userid) =>
  log.debug(message, data, userid)
);

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
      if (err) reject(err);
      const payload = JSON.parse(data.Payload);
      const body = JSON.parse(payload.body);
      const end = new Date();
      const server_time = end - start;
      const computer_start = Date.parse(body.timing.start);
      const computer_end = Date.parse(body.timing.end);
      const lambda_time = computer_end - computer_start;
      const time_diff = server_time - lambda_time;
      aws_debug(
        "Computer move, server_time=" +
          server_time +
          " lambda_time=" +
          lambda_time +
          " lag=" +
          time_diff
      );
      resolve(body.results);
    });
  });
}

function getMoveCount(game) {
  let cmi = game.variations.cmi;
  let movecount = 0;
  while (cmi !== 0) {
    movecount++;
    cmi = game.variations.movelist[cmi].prev;
  }
  return movecount;
}

const playGameMove = Meteor.bindEnvironment(game_id => {
  log.debug("playGameMove " + game_id);
  const game = Game.GameCollection.findOne({ _id: game_id });
  if (!game) return;
  log.debug(
    "game white.id=" +
      game.white.id +
      ", black.id=" +
      game.black.id +
      ", tomove=" +
      game.tomove +
      ", status=" +
      game.status
  );
  if (game.white.id === "computer" && game.tomove !== "white") return;
  if (game.black.id === "computer" && game.tomove !== "black") return;
  if (game.status !== "playing") return;
  const bookEntry = Book.findBook(game.fen);
  log.debug(
    "playGameMove " +
      game_id +
      " starting engine, fen=" +
      game.fen +
      ", book=" +
      (!!bookEntry ? bookEntry._id : "none")
  );
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
    log.debug("playGameMove " + game_id + ", calling internalSaveLocalMove with " + cmove.san);
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
    log.debug("playGameMove " + game_id + ", calling internalSaveLocalMove with " + cmove.san);
    Game.internalSaveLocalMove(
      { _id: "computer", username: "Computer" },
      "__computer__",
      game_id,
      cmove.san
    );
  });
});

const parseStockfishAnalysisResults = Meteor.bindEnvironment((game_id, data) => {
  const newgame = Game.GameCollection.findOne({ _id: game_id });
  if (!newgame) return;

  if (!newgame.computer_variations[newgame.variations.cmi]) newgame.computer_variations.push([]);

  if (!data.multipv) return;

  const mpv = data.multipv - 1;
  if (newgame.computer_variations[newgame.variations.cmi].length <= mpv) {
    for (let x = newgame.computer_variations[newgame.variations.cmi].length; x <= mpv; x++)
      newgame.computer_variations[newgame.variations.cmi].push({ ...data });
  } else newgame.computer_variations[newgame.variations.cmi][mpv] = { ...data };

  Game.GameCollection.update(
    { _id: game_id, status: newgame.status },
    { $set: { computer_variations: newgame.computer_variations } }
  );
});

async function start_analysis(game_id, game) {
  log.debug("start_analysis for " + game_id);
  const engine = start_engine(game_id, "analysis");
  if (!engine)
    throw new Meteor.Error(
      "Unable to start analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );

  log.debug("start_analysis for " + game_id + ", " + engine.ourid);
  engine.position(game.fen);
  engine.goInfinite().on("data", data => parseStockfishAnalysisResults(game_id, data));
}

async function end_analysis(game_id) {
  log.debug("end_analysis for " + game_id);
  const engine = _engines.analysis[game_id];
  if (!engine)
    throw new Meteor.Error(
      "Unable to stop analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );
  log.debug("end_analysis for " + game_id + ", " + engine.ourid);
  await engine.stop();
}

function watchForComputerGames() {
  Game.GameCollection.find({
    $and: [{ status: "playing" }, { $or: [{ "white.id": "computer" }, { "black.id": "computer" }] }]
  }).observeChanges({
    added(id, fields) {
      log.debug(
        "watchForComputerGames added id " + id + ", fields=" + Object.keys(fields).join(", ")
      );
      playGameMove(id);
    },
    changed(id, fields) {
      if (!fields.fen) return; // A move had to have been made
      log.debug(
        "watchForComputerGames changed id " + id + ", fields=" + Object.keys(fields).join(", ")
      );
      playGameMove(id);
    }
  });
}

function watchAllGamesForAnalysis() {
  Game.GameCollection.find({}).observeChanges({
    added(id, fields) {
      log.debug(
        "watchAllGamesForAnalysis added id " + id + ", fields=" + Object.keys(fields).join(", ")
      );
      start_analysis(id, fields);
    },
    changed(id, fields) {
      if (fields.fen) {
        log.debug(
          "watchAllGamesForAnalysis changed id " + id + ", fields=" + Object.keys(fields).join(", ")
        );
        end_analysis(id).then(() => start_analysis(id, fields));
      }
    },
    removed(id) {
      log.debug("watchAllGamesForAnalysis removed id " + id);
      stop_engine(id, "analysis");
    }
  });
}

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    Singular.addTask(watchForComputerGames);
    //watchAllGamesForAnalysis();
  }
});
