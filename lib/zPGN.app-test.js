import antlr4 from "antlr4";
import PGNLexer from "./pgn/PGNLexer";
import NodePGNParser from "./pgn/NodePGNParser";
import NodePGNListener from "./pgn/NodePGNListener";
import NodeInputStream from "../server/pgn/NodeInputStream";
import NodePGNTokenStream from "./pgn/NodePGNTokenStream";

describe.only("sigh", function() {
  this.timeout(500000);
  it("x3", function(done) {
    const lexer = new PGNLexer.PGNLexer(
      new NodeInputStream.NodeInputStream("/Users/davidlogan/Downloads/test2.pgn")
    );
    const tokens = new NodePGNTokenStream.NodePGNTokenStream(lexer);
    const parser = new NodePGNParser.NodePGNParser(tokens);
    parser.addParseListener(new NodePGNListener.NodePGNListener("userid", done));
    parser.pgn_database();
    console.log("here x3");
  });
});
