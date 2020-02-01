// Generated from /Users/davidlogan/workspace/icc/iccserver/private/PGN.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by PGNParser.
function PGNListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

PGNListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
PGNListener.prototype.constructor = PGNListener;

// Enter a parse tree produced by PGNParser#parse.
PGNListener.prototype.enterParse = function(ctx) {
};

// Exit a parse tree produced by PGNParser#parse.
PGNListener.prototype.exitParse = function(ctx) {
};


// Enter a parse tree produced by PGNParser#pgn_database.
PGNListener.prototype.enterPgn_database = function(ctx) {
};

// Exit a parse tree produced by PGNParser#pgn_database.
PGNListener.prototype.exitPgn_database = function(ctx) {
};


// Enter a parse tree produced by PGNParser#pgn_game.
PGNListener.prototype.enterPgn_game = function(ctx) {
};

// Exit a parse tree produced by PGNParser#pgn_game.
PGNListener.prototype.exitPgn_game = function(ctx) {
};


// Enter a parse tree produced by PGNParser#tag_section.
PGNListener.prototype.enterTag_section = function(ctx) {
};

// Exit a parse tree produced by PGNParser#tag_section.
PGNListener.prototype.exitTag_section = function(ctx) {
};


// Enter a parse tree produced by PGNParser#tag_pair.
PGNListener.prototype.enterTag_pair = function(ctx) {
};

// Exit a parse tree produced by PGNParser#tag_pair.
PGNListener.prototype.exitTag_pair = function(ctx) {
};


// Enter a parse tree produced by PGNParser#tag_name.
PGNListener.prototype.enterTag_name = function(ctx) {
};

// Exit a parse tree produced by PGNParser#tag_name.
PGNListener.prototype.exitTag_name = function(ctx) {
};


// Enter a parse tree produced by PGNParser#tag_value.
PGNListener.prototype.enterTag_value = function(ctx) {
};

// Exit a parse tree produced by PGNParser#tag_value.
PGNListener.prototype.exitTag_value = function(ctx) {
};


// Enter a parse tree produced by PGNParser#movetext_section.
PGNListener.prototype.enterMovetext_section = function(ctx) {
};

// Exit a parse tree produced by PGNParser#movetext_section.
PGNListener.prototype.exitMovetext_section = function(ctx) {
};


// Enter a parse tree produced by PGNParser#element_sequence.
PGNListener.prototype.enterElement_sequence = function(ctx) {
};

// Exit a parse tree produced by PGNParser#element_sequence.
PGNListener.prototype.exitElement_sequence = function(ctx) {
};


// Enter a parse tree produced by PGNParser#element.
PGNListener.prototype.enterElement = function(ctx) {
};

// Exit a parse tree produced by PGNParser#element.
PGNListener.prototype.exitElement = function(ctx) {
};


// Enter a parse tree produced by PGNParser#move_number_indication.
PGNListener.prototype.enterMove_number_indication = function(ctx) {
};

// Exit a parse tree produced by PGNParser#move_number_indication.
PGNListener.prototype.exitMove_number_indication = function(ctx) {
};


// Enter a parse tree produced by PGNParser#san_move.
PGNListener.prototype.enterSan_move = function(ctx) {
};

// Exit a parse tree produced by PGNParser#san_move.
PGNListener.prototype.exitSan_move = function(ctx) {
};


// Enter a parse tree produced by PGNParser#recursive_variation.
PGNListener.prototype.enterRecursive_variation = function(ctx) {
};

// Exit a parse tree produced by PGNParser#recursive_variation.
PGNListener.prototype.exitRecursive_variation = function(ctx) {
};


// Enter a parse tree produced by PGNParser#game_termination.
PGNListener.prototype.enterGame_termination = function(ctx) {
};

// Exit a parse tree produced by PGNParser#game_termination.
PGNListener.prototype.exitGame_termination = function(ctx) {
};


// Enter a parse tree produced by PGNParser#brace_comment.
PGNListener.prototype.enterBrace_comment = function(ctx) {
};

// Exit a parse tree produced by PGNParser#brace_comment.
PGNListener.prototype.exitBrace_comment = function(ctx) {
};


// Enter a parse tree produced by PGNParser#numeric_annotation_glyph.
PGNListener.prototype.enterNumeric_annotation_glyph = function(ctx) {
};

// Exit a parse tree produced by PGNParser#numeric_annotation_glyph.
PGNListener.prototype.exitNumeric_annotation_glyph = function(ctx) {
};



exports.PGNListener = PGNListener;