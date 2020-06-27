import chai from "chai";
import { Parser } from "./pgnsigh";
import { Game } from "../Game";
import { TestHelpers } from "../../imports/server/TestHelpers";

describe("PGN exports", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  // [Event]
  // [Site]
  // [Date] startTime and [Time]
  // [Round]
  // [White] white.name
  // [Black] black.name
  // [Result] result
  // [WhiteElo] white.rating
  // [BlackElo] black.rating
  // [TimeControl] time control
  // [misc tags]
  //

  it("should ...", function() {
    self.loggedonuser = TestHelpers.createUser();
    const imported_pgn = '[Event "?"]\n' + '[Site "?"]\n' + '[Date "????.??.??"]\n' + '[Round "?"]\n' + '[White "?"]\n' + '[Black "?"]\n' + '[Result "*"]\n' + "\n" + "1. e4 (1. d4 d5 2. e4 (2. c4))(1. c4 c5 2. d4 (2. e4)) 1. ... h5 (1. ... d5 2. d4 e5 (2. ... c5))(1. ... c5 2. d4 d5 (2. ... e5)) *";
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(imported_pgn));
    chai.assert.equal(1, parser.gamelist.length);

    const game_id = Game.startLocalExaminedGameWithObject("mi1", parser.gamelist[0]);
    const exported_pgn = Game.exportToPGN(game_id);
    const expected_exported_pgn = imported_pgn.replace(/\[.*]\n/g, "");
    const actual_exported_pgn = exported_pgn.pgn.replace(/\[.*]\n/g, "");
    chai.assert.equal(actual_exported_pgn, expected_exported_pgn);
  });
});
