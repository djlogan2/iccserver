import chai from "chai";
import { TestHelpers } from "../../imports/server/TestHelpers";
import { Parser } from "./pgnsigh";

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
    '[a "b"] 1. e4 (1. d4 d5 $7 (... c5 $3) (1... f5 $4)(1. ... c5 $5 2. Nc3 $6) (1. c4) {Other opening moves} e5 2. d4 d5 1-0'
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
      chai.assert.equal(v.length == 0 ? 0 : 1, parser.collection.find().count());
    })
  );

  it("should parse pgn correctly", function() {
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(pgn));
    chai.assert.equal(1, parser.collection.find().count());
  });

  it("should parse pgn1 correctly", function() {
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(pgn1));
    chai.assert.equal(2, parser.collection.find().count());
  });
});
