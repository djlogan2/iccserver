import { PGNImportStorageAdapter } from "./PGNImportStorageAdapter";
import chai from "chai";
const nearley = require("nearley");
const grammar = require("./pgn.js");
const lexer = require("../../server/pgn/pgnlexer").lexer;

describe.only("PGN Import", function() {
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

  it("should lex pgn strings into token correctly", function(done) {
    const pgn =
      '[A "b"]\n' +
      "1. e4 ((1. d4)(1.c4)) {comment1}\n" +
      "... e5 ; comment2 not Nf3\n" +
      "2. Nf3 *";
    const tokens = [
      "LBRACKET",
      "SYMBOL",
      "WS",
      "STRING",
      "RBRACKET",
      "WS",
      "INTEGER",
      "PERIOD",
      "WS",
      "SAN",
      "WS",
      "LPAREN",
      "LPAREN",
      "INTEGER",
      "PERIOD",
      "WS",
      "SAN",
      "RPAREN",
      "LPAREN",
      "INTEGER",
      "PERIOD",
      "SAN",
      "RPAREN",
      "RPAREN",
      "WS",
      "COMMENT1",
      "WS",
      "DOTDOTDOT",
      "WS",
      "SAN",
      "WS",
      "COMMENT2",
      "INTEGER",
      "PERIOD",
      "WS",
      "SAN",
      "WS",
      "RESULT"
    ];
    lexer.reset(pgn);
    let x = 0;
    let token = lexer.next();
    while (true) {
      if (x === tokens.length && !token) {
        done();
        return;
      }
      if (x === tokens.length)
        chai.assert.fail("Expected end of tokens, but got " + token + " at location " + x);
      else if (!token)
        chai.assert.fail("Expected " + tokens[x] + " but did not get a token at location " + x);
      else if (token.type !== tokens[x])
        chai.assert.fail(
          "Expected " + tokens[x] + " but received " + token.type + " at location " + x
        );
      x++;
      token = lexer.next();
    }
  });

  it("should parse an empty file", function() {
    this.timeout(500000);
    const parser = new nearley.Parser(grammar, { keepHistory: true });
    parser.feed("");
    console.log(parser.result);
    //console.log(parser.table);
    for (let x = 0; x < parser.table; x++) printme(parser.table[x].scannable);
    chai.assert.fail("finish me");
  });

  function printme(prefix, states, wantedby) {
    for (let x = 0; x < states.length; x++) {
      if (states[x].isComplete || wantedby) {
        console.log(prefix + states[x].rule.name);
        if (states[x].wantedBy) printme(prefix + "  ", states[x].wantedBy, true);
      }
    }
  }
  /* for (let x = 0; x < parser.table.length; x++) printme("" + x + ": ", parser.table[x].states); */

  it("should parse a basic tag and result", function() {
    this.timeout(500000);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed('[a "b"]\n*');
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse pgn correctly", function() {
    this.timeout(500000);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(pgn);
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse pgn1 correctly", function() {
    this.timeout(500000);
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(pgn1);
    chai.assert.equal(4, parser.results.length);
  });
});
