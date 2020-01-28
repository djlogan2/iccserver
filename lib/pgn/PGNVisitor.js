// Generated from /Users/davidlogan/workspace/icc/iccserver/private/PGN.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by PGNParser.

function PGNVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

PGNVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
PGNVisitor.prototype.constructor = PGNVisitor;

// Visit a parse tree produced by PGNParser#parse.
PGNVisitor.prototype.visitParse = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#pgn_database.
PGNVisitor.prototype.visitPgn_database = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#pgn_game.
PGNVisitor.prototype.visitPgn_game = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#tag_section.
PGNVisitor.prototype.visitTag_section = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#tag_pair.
PGNVisitor.prototype.visitTag_pair = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#tag_name.
PGNVisitor.prototype.visitTag_name = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#tag_value.
PGNVisitor.prototype.visitTag_value = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#movetext_section.
PGNVisitor.prototype.visitMovetext_section = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#element_sequence.
PGNVisitor.prototype.visitElement_sequence = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#element.
PGNVisitor.prototype.visitElement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#move_number_indication.
PGNVisitor.prototype.visitMove_number_indication = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#san_move.
PGNVisitor.prototype.visitSan_move = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#recursive_variation.
PGNVisitor.prototype.visitRecursive_variation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by PGNParser#game_termination.
PGNVisitor.prototype.visitGame_termination = function(ctx) {
  return this.visitChildren(ctx);
};



exports.PGNVisitor = PGNVisitor;