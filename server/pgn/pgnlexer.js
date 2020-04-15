const moo = require("moo");
const lexer = moo.compile({
  WS: { match: /[ \t\r\n]+/, lineBreaks: true },
  STRING: /"(?:\\["\\]|[^\n"\\])*"/,
  NAG: /\$[0-9]+/,
  RESULT: ["0-1", "1-0", "1/2-1/2", "*"],
  INTEGER: /[0-9]+/,
  DOTDOTDOT: /\.\.\./,
  PERIOD: /\./,
  LBRACKET: /\[/,
  RBRACKET: /]/,
  LPAREN: /\(/,
  RPAREN: /\)/,
  SAN: /(?:[RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[RQKBN])?[+#]?)|(?:O-O(?:-O)?)/,
  SYMBOL: /[a-zA-Z0-9_]+/,
  COMMENT1: /{.*?}/,
  COMMENT2: /;.*?\r?\n/,
  NL: { match: /\r?\n/, lineBreaks: true }
});

exports.lexer = lexer;
