import { TestHelpers } from "../imports/server/TestHelpers";
import chai from "chai";
import { Parser } from "./pgn/pgnparser";


const pgn =
  '[Event "Waldshut Sen\\Nes"]\n' +
  '[Site "Waldshut Sen\\Nes"]\n' +
  '[Date "1991.??.??"]\n' +
  '[Round "1"]\n' +
  '[White "Nadenau, Oskar"]\n' +
  '[Black "Seiter, G"]\n' +
  '[Result "1-0"]\n' +
  '[Opening "Dan\'s Opening"]\n' +
  '[ECO "A30d"]\n' +
  '[DansTag "Dan Loves Chess"]\n' +
  '[EventDate "1991.??.??"]\n' +
  "\n*\n";

describe.only("When exporting a pgn", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should add tags to the pgn if there are any", function() {
    this.timeout(3600000);
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;

    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.resignLocalGame("mi1", game_id);


    Game.importPGNIntoExaminedGame("mi1", game_id, pgn);
    const game = Game.GameCollection.findOne({ _id: game_id });
    chai.assert.isDefined(game.tags);
    const exportedPgn = Game.exportToPGN(game_id);
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(exportedPgn.pgn));
    for(const tag in game.tags) {
      chai.assert.isDefined(parser.gamelist[0].tags[tag]);
      chai.assert.equal(game.tags[tag], parser.gamelist[0].tags[tag]);
    }

    const game2_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.resignLocalGame("mi1", game2_id);
    Game.importPGNIntoExaminedGame("mi1", game2_id, exportedPgn.pgn);
    const game2 = Game.GameCollection.findOne({ _id: game2_id });
    for(const tag in game.tags) {
      chai.assert.isDefined(parser.gamelist[0].tags[tag]);
      chai.assert.equal(game.tags[tag], parser.gamelist[0].tags[tag]);
    }
  });
  it("should use the ECO tag for the PGN if the ECO or Opening tag exist instead of the ECO in the movelist", function () {
    if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
    let name = "King's Indian Attack";
    let code = "A07";
    let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
    Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });


    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;

    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    Game.resignLocalGame("mi1", game_id);

    const moves = ["Nf3", "d5", "g3"];

    moves.forEach((move) => {
      Game.saveLocalMove(move, game_id, move);
    });
    let exportedPgn = Game.exportToPGN(game_id);
    const parser = new Parser();
    chai.assert.doesNotThrow(() => parser.feed(exportedPgn.pgn));
    chai.assert.equal(parser.gamelist[0].tags["Opening"], "King's Indian Attack");
    chai.assert.equal(parser.gamelist[0].tags["ECO"], "A07");
    Game.importPGNIntoExaminedGame("mi1", game_id, pgn);
    exportedPgn = Game.exportToPGN(game_id);
    chai.assert.doesNotThrow(() => parser.feed(exportedPgn.pgn));
    chai.assert.notEqual(parser.gamelist[1].tags["Opening"], "King's Indian Attack");
    chai.assert.notEqual(parser.gamelist[1].tags["ECO"], "A07");
    chai.assert.equal(parser.gamelist[1].tags["Opening"], "Dan's Opening");
    chai.assert.equal(parser.gamelist[1].tags["ECO"], "A30d");
  });
});
