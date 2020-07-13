import { Game } from "./Game";
import Engine from "node-uci";
import { Logger } from "../lib/server/Logger";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import Chess from "chess.js";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");

// keys are game_ids, or "waiting" for running, but waiting, engines
const engines = {
  waiting: []
};

async function start_engine(game_id, skill_level) {
  if (engines.waiting && engines.waiting.length) {
    const engine = engines.waiting.shift();
    if (skill_level !== undefined) {
      await engine.setoption("Threads", 1);
      await engine.isready();
      await engine.setoption("MultiPV", 1);
      await engine.isready();
      await engine.setoption("Skill Level", skill_level);
      await engine.isready();
    }
    await engine.ucinewgame();
    await engine.isready();
    engines[game_id] = engine;
    return engine;
  }
  const engine = new Engine.Engine(SystemConfiguration.enginePath());
  engines.result = await engine.init();
  // result.id.name = our engines name
  // Just keep everything in case we want it later
  await engine.isready();
  await engine.setoption("Threads", skill_level === undefined ? 4 : 1);
  await engine.isready();

  if (skill_level === undefined) {
    await engine.setoption("MultiPV", 3);
    await engine.isready();
  }
  engines[game_id] = engine;
  return engine;
}

async function stop_engine(game_id) {
  const engine = engines[game_id];
  if (!engine) return;
  await engine.stop();
  engines.waiting.push(engine);
}

const playGameove = Meteor.bindEnvironment(game_id => {
  const game = Game.GameCollection.findOne({ _id: game_id });
  let engine;
  let result;
  if (!game) return;
  start_engine(game_id, game.skill_level)
    .then((_engine => {
      if (!_engine)
        throw new Meteor.Error(
          "Unable to start analysis",
          "We should have an engine for game id " + id + ", but we do not"
        );
      engine = _engine;
      return engine.position(game.fen());
    }))
    .then(() => {
      return engine.isready();
    })
    .then(() => {
      return engine.go({
        wtime: game.clocks.white.current,
        btime: game.clocks.black.current,
        winc: game.clocks.white.inc_or_delay,
        binc: game.clocks.black.inc_or_delay
      });
    })
    .then(_result => {
      result = _result;
      return stop_engine(game_id);
    })
    .then(() => {
      const chess = new Chess.Chess(game.fen());
      const cmove = chess.move(result, { sloppy: true });
      Game.saveLocalMove("__computer__", game_id, cmove.san);
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
  let engine = engines[game_id];
  if (!engine) {
    engine = await start_engine(game_id);
    if (!engine)
      throw new Meteor.Error(
        "Unable to start analysis",
        "We should have an engine for game id " + game._id + ", but we do not"
      );
  }
  await engine.position(game.fen);
  await engine.isready();
  engine.goInfinite().on("data", data => parseStockfishAnalysisResults(game_id, data));
}

async function end_analysis(game_id) {
  const engine = engines[game_id];
  if (!engine)
    throw new Meteor.Error(
      "Unable to start analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );
  await engine.stop();
}

function watchForComputerGames() {
  Game.GameCollection.find({
    $or: [{ "white.id": "computer" }, { "black.id": "computer" }]
  }).observeChanges({
    added(id, fields) {
      if (fields.white.id === "computer") playGameove(id);
    },
    changed(id, fields) {
      if (fields.tomove === "white") {
        if (fields.white.id !== "computer") return;
      } else if (fields.tomove === "black") {
        if (fields.black.id !== "computer") return;
      } else return;
      playGameove(id);
    }
  });
}

function watchAllGamesForAnalysis() {
  Game.GameCollection.find({}).observeChanges({
    added(id, fields) {
      start_analysis(id, fields);
    },
    changed(id, fields) {
      if (fields.variations) {
        end_analysis(id).then(() => start_analysis(id, fields));
      }
    },
    removed(id) {
      stop_engine(id);
    }
  });
}

Meteor.startup(() => {
  if (!!SystemConfiguration.enginePath()) {
    watchForComputerGames();
    watchAllGamesForAnalysis();
  }
});
