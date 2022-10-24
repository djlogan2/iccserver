import { Logger } from "../../lib/server/Logger";
import AWS from "aws-sdk";
import { Meteor } from "meteor/meteor";

const log = new Logger("server/GameAnalysis_js");

if (!process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "icc" });
  AWS.config.update({ region: "us-west-1" });
}

export class GameAnalysis {
  constructor() {
    this.analyzedGames = {};
    this.lambda = new AWS.Lambda();
    this.debug = Meteor.bindEnvironment((msg) => log.debug(msg));
    this.error = Meteor.bindEnvironment((msg) => log.error(msg));
  }

  startAnalysisOnGame(id, fen) {
    if (!!this.analyzedGames[id]) {
      log.error(`Starting analysis on an already analyzed game: ${id}`);
      return;
    }
    this.analyzedGames[id] = {};
    this.startEngine(id, fen);
  }

  endAnalysisOnGame(id) {
    if (!this.analyzedGames[id]) {
      log.error(`Stopping analysis on an already stopped game: ${id}`);
      return;
    }
    this.stopEngine(id);
    delete this.analyzedGames[id];
  }

  getBookmove(fen) {}

  getTablebaseMove(fen) {}

  startEngine(id, fen) {
    const book = this.getBookmove(fen);
    if (book) {
      this.updateIncomingAnalysis(id, book);
    } else {
      const tb = this.getTablebaseMove(fen);
      if (tb) {
        this.updateIncomingAnalysis(id, tb);
      } else {
        // start an actual engine
      }
    }
  }

  startActualEngine(id, fen) {
    this.analyzedGames[id].promise = new Promise((resolve, reject) => {
      const params = {
        FunctionName: "icc-stockfish",
        Payload: JSON.stringify({
          options: { UCI_LimitStrength: true, UCI_Elo: elo },
          position: fen,
          gooptions: {
            wtime: wtime,
            btime: btime,
            winc: game.clocks.white.inc_or_delay,
            binc: game.clocks.black.inc_or_delay,
          },
        }),
      };
      const start = new Date();
      this.lambda.invoke(params, (err, data) => {
        //debug("lambda invoke returns: err=" + JSON.stringify(err) + ", data=" + JSON.stringify(data));
        if (err || !data) {
          reject(err);
          return;
        }

        if (!data || !data.Payload) {
          this.error(
            "game=" + id + ":'data or its payload is null', payload=" + JSON.stringify(data)
          );
          reject("data or its Payload is null");
          return;
        }
        const payload = JSON.parse(data.Payload);
        if (!payload || !payload.body) {
          this.error(
            "game=" + id + ":'payload or its body is null', payload=" + JSON.stringify(data)
          );
          reject("payload or its body is null");
          return;
        }
        const body = JSON.parse(payload.body);
        if (!body) {
          this.error("game=" + id + ":'body is null', payload=" + JSON.stringify(data));
          reject("body is null");
          return;
        }
        resolve(body.results);
      });
    });
  }

  stopEngine(id) {}

  updateIncomingAnalysis(id, results) {}

  boardChanged(id) {}

  watchForAnalyzedGames() {}
}

if (!global.GameAnalysis) {
  global.GameAnalysis = new GameAnalysis();
}
