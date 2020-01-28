import chai from "chai";
//import fs from "fs";
import antlr4 from "antlr4";
import PGNLexer from "./pgn/PGNLexer";
import PGNParser from "./pgn/PGNParser";
import PGNListener from "./pgn/PGNListener";
import { PGN } from "./PGN";
import NodeInputStream from "../server/pgn/NodeInputStream";

const fs = require("fs");

class ICCPGNListener extends PGNListener.PGNListener {

  constructor(r) {
    super();
  }

  enterPgn_game(ctx) {
    console.log("enter pgn");
  }

  exitPgn_game(ctx) {
    console.log("exit pgn");
  }
}

describe.only("PGN importer/exporter", function() {
  this.timeout(500000);
  it("x", function(done) {
    const listener = new ICCPGNListener();
    //const stream = fs.createReadStream();
    const lexer = new PGNLexer.PGNLexer(new NodeInputStream.NodeInputStream("/Users/davidlogan/Downloads/test2.pgn"));
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new PGNParser.PGNParser(tokens);
    const tree = parser.pgn_database();
    console.log("here");
    // const input = '{x: 1}';
    //
    // const chars = new antlr4.InputStream(input);
    // const lexer = new ECMAScriptLexer.ECMAScriptLexer(chars);
    //
    // lexer.strictMode = false; // do not use js strictMode
    //
    // const tokens = new antlr4.CommonTokenStream(lexer);
    // const parser = new ECMAScriptParser.ECMAScriptParser(tokens);
    // const tree = parser.program();
    //
    // console.log(tree.toStringTree(parser.ruleNames));
  });
  it("should parse tags correctly", function() {
    const pgn_string =
      '[Event "Portuguese National Championships, Lisb"]\n' +
      '[Site "?"]\n' +
      '[Date "1994.??.??"]\n' +
      '[Round "?"]\n' +
      '[White "Dantas, C."]\n' +
      '[Black "Santos, C.P."]\n' +
      '[Result "0-1"]\n' +
      '[WhiteElo "2000"]\n' +
      '[BlackElo "2310"]\n' +
      '[ECO "A00j"]\n' +
      '[EventDate "1994.??.??"]\n' +
      '[PlyCount "54"]\n' +
      "\n" +
      "1. d3 d5 2. g3 c5 3. Bg2 Nc6 4. Nd2 Bg4 5. h3 Bh5 6. g4 Bg6 7. f4 e6 8. e4\n" +
      "f6 9. exd5 exd5 10. Qe2+ Qe7 11. Bxd5 Nd4 12. Qxe7+ Nxe7 13. Bb3 Bf7 14. \n" +
      "Ngf3 Bxb3 15. Nxd4 Bd5 16. N4f3 h5 17. Rf1 hxg4 18. hxg4 O-O-O 19. Kf2 Nc6\n" +
      "20. Kg3 Nb4 21. Ne1 Re8 $1 22. Nb3 Re2 $1 23. c4 Bc6 24. a3 Nc2 25. Nf3 \n" +
      "Ba4 26. Nfd2 Reh2 27. Kf3 Bc6+ 0-1";
    const pgn = new PGN();
    const game = pgn.parse(pgn_string);
    chai.assert.isDefined(game);
    chai.assert.fail("yep, do me");
  });
});
