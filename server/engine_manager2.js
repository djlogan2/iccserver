//import { Game } from "./Game";
import { Users } from "../imports/collections/users";
import { Logger } from "../lib/server/Logger";
import AWS from "aws-sdk";
//import { AWSmanager } from "./awsanalysis/awsmanager";
import { Meteor } from "meteor/meteor";
import { Singular } from "./singular";

// eslint-disable-next-line no-unused-vars
const log = new Logger("server/engine_manager_js");
let loggedon_users = 0;
let active_games = 0;
let instances = [];
let waiting_engines = [];
let busy_engines = {};

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

function adjustInstances() {}

async function addAnotherInstance() {}

async function start_engine(game_id) {
  if (waiting_engines.length) {
    busy_engines[game_id] = waiting_engines.shift();
    busy_engines[game_id].busy(true);
    adjustInstances();
    return Promise.resolve(busy_engines[game_id]);
  }
  log.error("We needed an engine and ran short!");
  return addAnotherInstance().then(() => {
    busy_engines[game_id] = waiting_engines.shift();
    busy_engines[game_id].busy(true);
    return busy_engines[game_id];
  });
}

function stop_engine(game_id) {
  const engine = busy_engines[game_id];
  delete busy_engines[game_id];
  waiting_engines.push(engine);
  engine.busy(false);
  // Always make sure the instance with the fewest number of free engines is first
  waiting_engines.sort((e1, e2) => e2.instance.busy - e1.instance.busy);
  // Set the number of instances
  adjustInstances();
}

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
  const engine = start_engine(game_id);
  if (!engine)
    throw new Meteor.Error(
      "Unable to start analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );

  engine.position(game.fen);
  engine.goInfinite().on("data", data => parseStockfishAnalysisResults(game_id, data));
}

async function end_analysis(game_id) {
  const engine = busy_engines.analysis[game_id];
  if (!engine)
    throw new Meteor.Error(
      "Unable to stop analysis",
      "We should have an engine for game id " + game_id + ", but we do not"
    );
  await engine.stop();
}

function watchAllGamesForAnalysis() {
  adjustInstances();
  Game.GameCollection.find({}).observeChanges({
    added(id, fields) {
      start_analysis(id, fields);
    },
    changed(id, fields) {
      if (fields.fen) {
        end_analysis(id).then(() => start_analysis(id, fields));
      }
    },
    removed(id) {
      stop_engine(id);
    }
  });
  // It has to be this one because we are updating for system-wide users,
  // not just users logged on to this instance!
  Meteor.users.find({ "status.online": true }).observeChanges({
    added(id, fields) {
      loggedon_users++;
      log.debug(
        "user added, incrementing loggedon_users user=" + id + ", loggedon_users=" + loggedon_users
      );
      adjustInstances();
    },
    deleted(id) {
      loggedon_users--;
      log.debug(
        "zuser deleted, updated loggedon_users, user=" + id + ", loggedon_users=" + loggedon_users
      );
      adjustInstances();
    }
  });

  Game.collection.find().observeChanges({
    added(id, fields) {
      active_games++;
      adjustInstances();
    },
    deleted(id) {
      active_games--;
      log.debug(
        "game deleted, updated active_games, game=" + id + ", active_games=" + active_games
      );
      adjustInstances();
    }
  });

  adjustInstances();
}

Meteor.startup(() => {
  if (!Meteor.isTest && !Meteor.isAppTest) {
    Singular.addTask(() => watchAllGamesForAnalysis());
  }
});
