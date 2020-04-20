import chai from "chai";
const nearley = require("nearley");
const grammar = require("./pgn.js");
const lexer = require("../../server/pgn/pgnlexer").lexer;

describe.only("PGN Import", function() {
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
    '[a "b"] 1. e4 (1. d4 d5 (... c5) (1... f5)(1. ... c5 2. Nc3) (1. c4) {Other opening moves} e5 2. d4 d5 1-0'
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

  valid.forEach(v =>
    it(v.replace(/[\r\n]/g, "^") + " is valid", function() {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      chai.assert.doesNotThrow(() => parser.feed(v));
      chai.assert.equal(1, parser.results.length);
    })
  );

  it("should lex pgn strings into token correctly", function(done) {
    const pgn = '[A "b"]\n1. e4 ((1. d4)(1.c4)) {comment1}\n... e5 2. Nf3 *';
    const tokens = [
      "LBRACKET",
      "SYMBOL",
      "WS",
      "STRING",
      "RBRACKET",
      "NL",
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
      "NL",
      "DOTDOTDOT",
      "WS",
      "SAN",
      "WS",
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
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), { keepHistory: true });
    chai.assert.doesNotThrow(() => parser.feed(""));
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
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    chai.assert.doesNotThrow(() => parser.feed('[a "b"]\n*\n'));
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse a basic tag and result with windows newlines", function() {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    chai.assert.doesNotThrow(() => parser.feed('[a "b"]\r\n[b "c"]\r\n[d "e"]\r\n*'));
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse a basic tag and result with unix newlines", function() {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    chai.assert.doesNotThrow(() => parser.feed('[a "b"]\n[b "c"]\n[d "e"]\n*'));
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse a basic tag and result whitespace", function() {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(
      '[a \r\n\t\t\r\n\n\n\r\n\t\t\n\n\r\n"b"]\r\n\t\t\r\n\n\n\r\n\t\t\n\n\r\n[b\r\n\t\t\r\n\n\n\r\n\t\t\n\n\r\n "c"]\n\n\n\t\r\n\n\n\t\t[d \r\n\t\t\r\n\n\n\r\n\t\t\n\n\r\n "e"]\t\t\t\n\n\n\r\n\r\n\n\n\t\t\t*'
    );
    chai.assert.equal(1, parser.results.length);
  });

  it("should parse pgn correctly", function() {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(pgn);
    chai.assert.equal(1, parser.results.length);
  });

  it.skip("should parse pgn1 correctly", function() {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.feed(pgn1);
    chai.assert.equal(4, parser.results.length);
  });
});
