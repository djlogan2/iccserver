import { Game } from "./Game";
import Engine from "node-uci";
import { Logger } from "../lib/server/Logger";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import Chess from "chess.js";
import { Random } from "meteor/random";
import AWS from "aws-sdk";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");
const ANALYSIS_THREADS = 1;

// keys are game_ids, or "waiting" for running, but waiting, engines
const _engines = {
  analysis: [],
  position: [],
  waiting: []
};

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

const lambda = new AWS.Lambda();

async function start_engine(game_id, type, skill_level) {
  log.debug("start_engine " + game_id + ", " + type + "," + skill_level);

  skill_level = skill_level | 20;

  if (type === "analysis") skill_level = 20; // Force this to be sure

  if (!!_engines[type][game_id]) return _engines[type][game_id];

  let engine;
  if (_engines.waiting && _engines.waiting.length) engine = _engines.waiting.shift();
  else {
    log.debug("start_engine " + game_id + " Starting a new engine");
    engine = new Engine.Engine(SystemConfiguration.enginePath());
    engine.ourid = Random.id();
    log.debug("start_engine " + game_id + " Started engine with ourid=" + engine.ourid);
    // result.id.name = our engines name
    // Just keep everything in case we want it later
    _engines.result = await engine.init();
    await engine.isready();
  }

  log.debug("start_engine " + game_id + ", " + engine.ourid + ", " + type + "," + skill_level);
  await engine.setoption("Threads", type === "position" ? 1 : ANALYSIS_THREADS);
  await engine.isready();
  await engine.setoption("MultiPV", type === "position" ? 1 : 3);
  await engine.isready();
  await engine.setoption("Skill Level", skill_level);
  await engine.isready();

  await engine.ucinewgame();
  await engine.isready();
  _engines[type][game_id] = engine;
  return engine;
}

async function stop_engine(game_id, type) {
  log.debug("stop_engine for game " + game_id + ", " + type);
  const engine = _engines[type][game_id];
  if (!engine) return;
  try {
    log.debug("stop_engine for engine " + engine.ourid + ", game " + game_id + ", " + type);
    if (type !== "position") await engine.stop();
  } catch (e) {
    log.debug("stop_engine failed stopping for game_id " + game_id + ", error=" + e.toString());
    // skip any errors on trying to stop an engine
  }
  _engines.waiting.push(engine);
  delete _engines[type][game_id];
}

function awsDoIt(game) {
  return new Promise((resolve, reject) => {
    const params = {
      FunctionName: "icc-stockfish",
      Payload: JSON.stringify({
        options: { "Skill Level": game.skill_level },
        position: game.fen,
        gooptions: {
          wtime: game.clocks.white.current,
          btime: game.clocks.black.current,
          winc: game.clocks.white.inc_or_delay,
          binc: game.clocks.black.inc_or_delay
        }
      })
    };
    lambda.invoke(params, (err, data) => {
      if (err) reject(err);
      const payload = JSON.parse(data.Payload);
      const body = JSON.parse(payload.body);
      resolve(body.results);
    });
  });
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
  log.debug("playGameMove " + game_id + " starting engine");
  //----------
  /*
  start_engine(game_id, "position", game.skill_level)
    .then(_engine => {
      if (!_engine)
        throw new Meteor.Error(
          "Unable to start analysis",
          "We should have an engine for game id " + game_id + ", but we do not"
        );
      engine = _engine;
      log.debug(
        "playGameMove has engine " + engine.ourid + " for game " + game_id + ", setting position"
      );
      return engine.position(game.fen);
    })
    .then(() => {
      return engine.isready();
    })
    .then(() => {
      log.debug(
        "playGameMove " + game_id + ", " + engine.ourid + " starting analysis with move times"
      );
      return engine.go({
        wtime: game.clocks.white.current,
        btime: game.clocks.black.current,
        winc: game.clocks.white.inc_or_delay,
        binc: game.clocks.black.inc_or_delay
      });
    })
    .then(_result => {
      result = _result;
      log.debug(
        "playGameMove " +
          game_id +
          ", " +
          engine.ourid +
          " engine made move, stopping. move=" +
          _result.bestmove
      );
      return stop_engine(game_id, "position");
    })
   */
  //----------
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
  const engine = await start_engine(game_id, "analysis");
  if (!engine)
    throw new Meteor.Error(
      "Unable to start analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );

  log.debug("start_analysis for " + game_id + ", " + engine.ourid);
  await engine.position(game.fen);
  await engine.isready();
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
    $or: [{ "white.id": "computer" }, { "black.id": "computer" }]
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
    watchForComputerGames();
    //watchAllGamesForAnalysis();
});
