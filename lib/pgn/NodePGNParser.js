const PGNParser = require("./PGNParser");

const NodePGNParser = function(tokens) {
  PGNParser.PGNParser.call(this, tokens);
  //this.buildParseTrees = false;
  return this;
};

NodePGNParser.prototype = Object.create(PGNParser.PGNParser.prototype);
NodePGNParser.prototype.constructor = NodePGNParser;
NodePGNParser.prototype.addContextToParseTree = function() {
  if (this._ctx instanceof PGNParser.PGNParser.Pgn_databaseContext) return;
  if (this._ctx instanceof PGNParser.PGNParser.Pgn_gameContext) return;
  PGNParser.PGNParser.prototype.addContextToParseTree.call(this);
};

exports.NodePGNParser = NodePGNParser;
