import chai from "chai";
import { TestHelpers } from "../../imports/server/TestHelpers";
import { Parser } from "./pgnsigh";
import { Game } from "../Game";

describe("PGN Import", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  const valid = [
    "",
    '[a "b"] *',
    '[a "b"]\n*',
    '[a\n"b"]\n*',
    '[a\r\n"b"]\n*',
    '[a\r\n"b"]\r\n*',
    '[a\r\n"b"]\r\n*\n',
    '[a\r\n"b"]\r\n*\r\n',
    '[a\t"b"]\r\n*\r\n',
    '[a\t"b"]\t*\r\n',
    '[a\t"b"]\t*\t',
    '[a\t\n"b"]\r\n*\r\n',
    '[a\t\r\n"b"]\t*\r\n',
    '[a "b"] 1-0',
    '[a "b"] 0-1',
    '[a "b"] 1/2-1/2',
    '[a "b"] 1. e4 1-0',
    '[a "b"] 1. e4 0-1',
    '[a "b"] 1. e4 1/2-1/2',
    '[a "b"] 1.\ne4 1-0',
    '[a "b"] 1.\ne4\n0-1',
    '[a "b"] 1. e4 e5 1-0',
    '[a "b"] 1. e4 e5 2. d4 1-0',
    '[a "b"] 1. e4 e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) {Other opening moves} e5 (1. ... c5) (1... f5) 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 (... c5) (1... f5)(1. ... c5 2. Nc3) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4) (1. c4) e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 $1 (1. d4) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 $2) (1. c4) {Other opening moves} e5 (1. ... c5) (1... f5) 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other opening moves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other\nopening\nmoves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other\r\nopening\r\nmoves} e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) ;Other opening moves\n e5 2. d4 d5 1-0',
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) ;Other opening moves\r\n e5 2. d4 d5 1-0'
  ];
  const pgn =
    '[Event "?"]\n' +
    '[Site "?"]\n' +
    '[Date "????.??.??"]\n' +
    '[Round "?"]\n' +
    '[White "?"]\n' +
    '[Black "?"]\n' +
    '[Result "*"]\n' +
    "\n" +
    "1. e4 e5 \n" +
    "    ( 1. ... d5 2. exd5 )\n" +
    "    ( 1. ... c5 2. d4 )\n" +
    "    ( 1. ... Nc6 2. Nc3 )\n" +
    "2. Nf3 *" +
    "\n";

  const pgn1 =
    '[Event "ICC 5 0 u"]\n' +
    '[Site "Internet Chess Club"]\n' +
    '[Date "2019.10.13"]\n' +
    '[Round "-"]\n' +
    '[White "uiuxtest1"]\n' +
    '[Black "uiuxtest2"]\n' +
    '[Result "*"]\n' +
    '[ICCResult "Game adjourned when White disconnected"]\n' +
    '[WhiteElo "1400"]\n' +
    '[BlackElo "1400"]\n' +
    '[Opening "Two knights defense"]\n' +
    '[ECO "C55"]\n' +
    '[NIC "IG.01"]\n' +
    '[Time "13:08:42"]\n' +
    '[TimeControl "300+0"]\n' +
    "\n" +
    "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. c3 d5 5. exd5 Nxd5 6. Qb3 Be6 7. O-O Be7\n" +
    "8. d3 O-O 9. Re1 {Game adjourned when White disconnected} *\n" +
    "\n" +
    '[Event "ICC 5 0 u"]\n' +
    '[Site "Internet Chess Club"]\n' +
    '[Date "2019.10.13"]\n' +
    '[Round "-"]\n' +
    '[White "uiuxtest1"]\n' +
    '[Black "uiuxtest2"]\n' +
    '[Result "*"]\n' +
    '[ICCResult "Game adjourned when White disconnected"]\n' +
    '[WhiteElo "1400"]\n' +
    '[BlackElo "1400"]\n' +
    '[Opening "Two knights defense"]\n' +
    '[ECO "C55"]\n' +
    '[NIC "IG.01"]\n' +
    '[Time "13:08:42"]\n' +
    '[TimeControl "300+0"]\n' +
    "\n" +
    "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. c3 d5 5. exd5 Nxd5 6. Qb3 Be6 7. O-O Be7\n" +
    "8. d3 O-O 9. Re1 {Game adjourned when White disconnected} *";

  valid.forEach(v =>
    it(v.replace(/[\r\n]/g, "^") + " is valid", function() {
      const parser = new Parser();
      chai.assert.doesNotThrow(() => parser.feed(v));
      if(v.length === 0)
        chai.assert.isUndefined(parser.gamelist);
      else
        chai.assert.equal(1, parser.gamelist.length);
    })
  );

  it("should parse pgn correctly", function() {
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(pgn));
    chai.assert.equal(1, parser.gamelist.length);
  });

  it("should parse pgn1 correctly", function() {
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(pgn1));
    chai.assert.equal(2, parser.gamelist.length);
  });

  it("should export and import their own games correctly", function() {
    this.timeout(500000);
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.saveLocalMove("mi2", game_id, "e5");
    Game.moveBackward("mi2", game_id);
    Game.saveLocalMove("mi2", game_id, "d5");
    Game.setTag("mi2", game_id, "Result", "1/2-1/2");
    const pgn = Game.exportToPGN(game_id);
    const game = Game.collection.findOne();
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(pgn.pgn));
    chai.assert.equal(1, parser.gamelist.length);

    function compareMovelist(cmi1, cmi2, v1, v2) {
      chai.assert.equal(
        v1.movelist[cmi1].move,
        v2.movelist[cmi2].move,
        "Move for cmi " +
          cmi1 +
          " does not match. parser=" +
          v1.movelist[cmi1].move +
          ", actual=" +
          v2.movelist[cmi2].move
      );
      chai.assert.equal(
        v1.movelist[cmi1].prev,
        v2.movelist[cmi2].prev,
        "Prev for cmi " +
          cmi1 +
          " does not match. parser=" +
          v1.movelist[cmi1].prev +
          ", actual=" +
          v2.movelist[cmi2].prev
      );
      if (v1.movelist[cmi1].variations && !v2.movelist[cmi2].variations) {
        chai.assert.fail(
          "Parser has a variation at cmi " + cmi1 + ", whereas the actual game does not"
        );
      } else if (!v1.movelist[cmi1].variations && v2.movelist[cmi2].variations) {
        chai.assert.fail(
          "Parser does not have a variation at cmi " + cmi1 + ", whereas the actual game does"
        );
      } else if (v1.movelist[cmi1].variations && v2.movelist[cmi2].variations) {
        chai.assert.equal(
          v1.movelist[cmi1].variations.length,
          v2.movelist[cmi2].variations.length,
          "Variations differ for cmi " +
            cmi1 +
            ". parser=" +
            v1.movelist[cmi1].variations +
            ", actual=" +
            v2.movelist[cmi2].variations
        );
        for (let x = 0; x < v1.movelist[cmi1].variations.length; x++)
          compareMovelist(v1.movelist[cmi1].variations[x], v2.movelist[cmi2].variations[x], v1, v2);
      }
    }

    compareMovelist(0, 0, parser.gamelist[0].variations, game.variations);
  });
});
