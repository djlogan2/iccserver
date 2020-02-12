const PGNParser = require("./PGNParser");

const NodePGNParser = function(tokens) {
  this.buildParseTrees = false;
  PGNParser.PGNParser.call(this, tokens);
  return this;
};

NodePGNParser.prototype = Object.create(PGNParser.PGNParser.prototype);
NodePGNParser.prototype.constructor = NodePGNParser;
NodePGNParser.prototype.addContextToParseTree = function() {
  if (this._ctx instanceof PGNParser.PGNParser.Pgn_databaseContext) return;
  if (this._ctx instanceof PGNParser.PGNParser.Pgn_gameContext) return;
  PGNParser.PGNParser.prototype.addContextToParseTree.call(this);
};

NodePGNParser.prototype.getTokenFactory = function() {
  return this._input.tokenSource._factory;
};

NodePGNParser.prototype.setTokenFactory = function(factory) {
  this._input.tokenSource._factory = factory;
};

NodePGNParser.prototype.getTokenStream = function() {
  return this._input;
};

// Set the token stream and reset the parser.//
NodePGNParser.prototype.setTokenStream = function(input) { // djl
  this._input = null;
  this.reset();
  this._input = input;
};

exports.NodePGNParser = NodePGNParser;
