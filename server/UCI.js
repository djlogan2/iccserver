import { Engine } from "node-uci";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { Random } from "meteor/random";
import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";

const log = new Logger("server/UCI");
export const UCI = {};

const engines = {};

const ready_engines = [];
const busy_engines = [];
const waiting_for_an_engine = [];

const _statistics = {
  started: {
    min: null,
    max: null,
    current: null,
    total_time: null,
    total_count: null
  },
  busy: {
    min: null,
    max: null,
    current: null,
    total_time: null,
    total_count: null
  },
  waiting: {
    min: null,
    max: null,
    current: null
  },
  users_waiting: {
    min: null,
    max: null,
    current: null,
    total_time: null,
    total_count: null
  },
  recovered_engines: 0
};

function xxx(addremove, ms) {
  if (this.current === null) this.current = 0;
  this.current += addremove === "add" ? 1 : -1;
  if (this.min === null || this.min > this.current) this.min = this.current;
  if (this.max === null || this.max < this.current) this.max = this.current;

  if (addremove === "add" && this.total_count !== undefined) this.total_count++;
  if (ms !== undefined && ms !== null) {
    if (this.total_time === null) this.total_time = 0;
    this.total_time += ms;
  }
}

function updateStat(which, addremove, ms) {
  xxx.call(_statistics[which], addremove, ms);
}

UCI.getScoreForFen = async function(fen) {
  log.debug("getScoreForFen fen=" + fen);
  return obtainEngine().then(async function(engine_id) {
    log.debug("game has an engine for fen " + fen);
    return new Promise(async function(resolve, reject) {
      const seconds = SystemConfiguration.uciSecondsToPonderPerMoveScore();
      const threads = SystemConfiguration.uciThreadsPerEngine();
      let score = 0;

      await engines[engine_id].ucinewgame();
      await engines[engine_id].setoption("MultiPV", 4);
      await engines[engine_id].setoption("Threads", threads);
      await engines[engine_id].position(fen);
      engines[engine_id].goInfinite();

      setTimeout(async () => {
        try {
          const bestmove = await engines[engine_id].stop();
          score = bestmove.info[bestmove.info.length - 1].score.value;
          log.debug("Have score " + score + " for fen " + fen);
          releaseEngine(engine_id);
          resolve(score);
        } catch (e) {
          reject(new Error(e));
        }
      }, seconds * 1000);
    });
  });
};

async function obtainEngine() {
  log.debug("obtainEngine");
  return new Promise((resolve, reject) => {
    try {
      if (ready_engines.length) {
        const engine_id = ready_engines.shift();
        log.debug("obtainEngine returning a ready engine, id=" + engine_id);
        busy_engines.push({ engine: engine_id, start: new Date().getTime() });
        updateStat("waiting", "remove");
        updateStat("busy", "add");
        resolve(engine_id);
        return;
      }

      if (ready_engines.length + busy_engines.length < SystemConfiguration.maximumRunningEngines()) {
        const new_id = Random.id();
        const new_engine = (engines[new_id] = new Engine(SystemConfiguration.enginePath()));
        log.debug("obtainEngine starting a new engine, new engine id=" + new_id);
        busy_engines.push({ engine: new_id, start: new Date().getTime() });
        updateStat("started", "add");
        updateStat("busy", "add");
        new_engine
          .init()
          .then(() => resolve(new_id))
          .catch(error => reject(error));
        return;
      }

      log.debug("obtainEngine waiting for a free engine");
      updateStat("users_waiting", "add");
      waiting_for_an_engine.push({
        resolve: resolve,
        start: new Date().getTime()
      });
    } catch (e) {
      log.error("Error in UCI", e);
      reject(new Error(e));
    }
  });
}

function findBusyEngine(engine_id) {
  for (let x = 0; x < busy_engines.length; x++) if (busy_engines[x].engine === engine_id) return x;
  return -1;
}

function releaseEngine(engine_id) {
  log.debug("releaseEngine releasing " + engine_id);
  const idx = findBusyEngine(engine_id);
  if (idx === -1) throw new Meteor.Error("Unable to find engine id " + engine_id);

  const engine_object = busy_engines[idx];

  const runtime = new Date().getTime() - engine_object.start;
  updateStat("busy", "remove", runtime);

  if (waiting_for_an_engine.length) {
    log.debug("Giving released engine " + engine_id + " to waiting task");
    const obj = waiting_for_an_engine.shift();
    const waittime = new Date().getTime() - obj.start;
    updateStat("users_waiting", "remove", waittime);
    updateStat("busy", "add");
    busy_engines[idx].start = new Date().getTime();
    obj.resolve(engine_id);
  } else {
    log.debug("Putting released engine " + engine_id + " on the ready engines list");
    updateStat("waiting", "add");
    ready_engines.push(engine_id);
    busy_engines.splice(idx, 1);
  }
}

let recovery_time;
Meteor.setInterval(async () => {
  if (!recovery_time) {
    recovery_time = new Date();
    return;
  }

  for (let x = 0; x < busy_engines; x++) {
    if (busy_engines[x].start < recovery_time) {
      const new_id = Random.id();
      log.error("We are recovering a lost engine! id=" + busy_engines[x].engine + ", new id=" + new_id);
      engines[new_id] = engines[busy_engines[x].engine];
      delete engines[busy_engines[x].engine];
      busy_engines.split(x, 1);
      _statistics.recovered_engines++;
      try {
        await engines[new_id].stop();
      } catch (e) {
        // Just force a stop in case we need one
      }
    }
  }
  recovery_time = new Date();
}, 60 * 5 * 1000); // Every 5 minutes
