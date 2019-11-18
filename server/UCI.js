import { Engine } from "node-uci";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { Random } from "meteor/random";
import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";

const log = new Logger("client/RightSidebar");
export const UCI = {};

const engines = {};

const _ready_engines = [];
const _busy_engines = [];
const waiting_for_an_engine = [];

UCI.getScoreForFen = function(fen) {
  const automatic_score_parameters = SystemConfiguration.automaticScoreParameters();
  return obtainEngine().then(engine_id => {
    engines[engine_id]
      .chain()
      .setoption("MultiPV", "4")
      .position(fen)
      .go(automatic_score_parameters)
      .then(result => {
        releaseEngine(engine_id);
        return result.info[0].score.value;
      });
  });
};

function obtainEngine() {
  return new Promise((resolve, reject) => {
    if (_ready_engines.length) {
      const engine_id = _ready_engines.shift();
      _busy_engines.push(engine_id);
      resolve(engine_id);
      return;
    }

    if (
      _ready_engines.length + _busy_engines.length <
      SystemConfiguration.maximumRunningEngines()
    ) {
      const new_id = Random.id();
      const new_engine = (engines[new_id] = new Engine(
        SystemConfiguration.enginePath()
      ));
      _busy_engines.push(new_id);
      new_engine
        .init()
        .then(() => resolve(new_id))
        .catch(error => reject(error));
      return;
    }

    waiting_for_an_engine.push(resolve);
  });
}

function releaseEngine(engine_id) {
  const idx = _busy_engines.indexOf(engine_id);
  if (idx === -1)
    throw new Meteor.Error("Unable to find engine id " + engine_id);

  if (waiting_for_an_engine.length) {
    const resolve = waiting_for_an_engine.shift();
    resolve(engine_id);
    return;
  }
  _busy_engines.splice(idx, 1);
  _ready_engines.push(engine_id);
}
