import { Logger } from "../../lib/server/Logger";

const log = new Logger("server/GameAnalysis_js");

export class GameAnalysis {
  constructor() {
    this.analyzedGames = {};
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

  stopEngine(id) {}

  updateIncomingAnalysis(id, results) {}

  boardChanged(id) {}

  watchForAnalyzedGames() {}
}

if (!global.GameAnalysis) {
  global.GameAnalysis = new GameAnalysis();
}
