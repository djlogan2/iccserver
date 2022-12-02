import { Logger } from "../../lib/server/Logger";
import AWS from "aws-sdk";
import { Meteor } from "meteor/meteor";
import { Game } from "./Game";

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

  boardChanged(id, fen) {
    this.analyzedGames[id].fen = fen;
    let update = this.getBookmove(fen);
    if (!update) update = this.getTablebaseMove(fen);
    if (update) {
      this.stopEngine(id);
      this.updateIncomingAnalysis(id, update);
    } else {
      this.startEngine(id, fen);
    }
  }

  startEngine(id, fen) {
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

  watchForAnalyzedGames() {
    const self = this;
    this.cursor = Game.GameCollection.find({
      $or: [
        { status: "playing" },
        { $and: [{ status: "examining" }, { analysis_multipv: { $gt: 0 } }] },
      ],
    });
    this.cursor.observeChanges({
      added(id, fields) {
        const game = Game.GameCollection.findOne({ _id: id });
        if (!game) return;
        self.boardChanged(id, game.fen);
      },
      changed(id, fields) {
        const game = Game.GameCollection.findOne({ _id: id });
        if (!game) {
          self.endAnalysisOnGame(id);
          return;
        }
        if (self.analyzedGames[id]?.fen !== game.fen) self.boardChanged(id, game.fen);
      },
      removed(id) {
        self.endAnalysisOnGame(id);
      },
    });
  }
}

if (!global.GameAnalysis) {
  global.GameAnalysis = new GameAnalysis();
}
