// Generated from /Users/davidlogan/workspace/icc/iccserver/private/PGN.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');
var PGNListener = require('./PGNListener').PGNListener;
var PGNVisitor = require('./PGNVisitor').PGNVisitor;

var grammarFileName = "PGN.g4";


var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003\u0018k\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004",
    "\u0011\t\u0011\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0007",
    "\u0003\'\n\u0003\f\u0003\u000e\u0003*\u000b\u0003\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0005\u0007\u00050\n\u0005\f\u0005\u000e\u0005",
    "3\u000b\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003",
    "\u0006\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\t\u0003\t\u0003",
    "\t\u0003\n\u0003\n\u0007\nC\n\n\f\n\u000e\nF\u000b\n\u0003\u000b\u0003",
    "\u000b\u0003\u000b\u0003\u000b\u0005\u000bL\n\u000b\u0003\u000b\u0005",
    "\u000bO\n\u000b\u0005\u000bQ\n\u000b\u0003\f\u0003\f\u0005\fU\n\f\u0003",
    "\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000e\u0003\u000f",
    "\u0003\u000f\u0003\u0010\u0003\u0010\u0007\u0010a\n\u0010\f\u0010\u000e",
    "\u0010d\u000b\u0010\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011",
    "\u0003\u0011\u0003\u0011\u0002\u0002\u0012\u0002\u0004\u0006\b\n\f\u000e",
    "\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e \u0002\u0004\u0004",
    "\u0002\u0006\b\u000f\u000f\u0003\u0002\u0004\u0004\u0002d\u0002\"\u0003",
    "\u0002\u0002\u0002\u0004(\u0003\u0002\u0002\u0002\u0006+\u0003\u0002",
    "\u0002\u0002\b1\u0003\u0002\u0002\u0002\n4\u0003\u0002\u0002\u0002\f",
    "9\u0003\u0002\u0002\u0002\u000e;\u0003\u0002\u0002\u0002\u0010=\u0003",
    "\u0002\u0002\u0002\u0012D\u0003\u0002\u0002\u0002\u0014P\u0003\u0002",
    "\u0002\u0002\u0016R\u0003\u0002\u0002\u0002\u0018V\u0003\u0002\u0002",
    "\u0002\u001aX\u0003\u0002\u0002\u0002\u001c\\\u0003\u0002\u0002\u0002",
    "\u001e^\u0003\u0002\u0002\u0002 g\u0003\u0002\u0002\u0002\"#\u0005\u0004",
    "\u0003\u0002#$\u0007\u0002\u0002\u0003$\u0003\u0003\u0002\u0002\u0002",
    "%\'\u0005\u0006\u0004\u0002&%\u0003\u0002\u0002\u0002\'*\u0003\u0002",
    "\u0002\u0002(&\u0003\u0002\u0002\u0002()\u0003\u0002\u0002\u0002)\u0005",
    "\u0003\u0002\u0002\u0002*(\u0003\u0002\u0002\u0002+,\u0005\b\u0005\u0002",
    ",-\u0005\u0010\t\u0002-\u0007\u0003\u0002\u0002\u0002.0\u0005\n\u0006",
    "\u0002/.\u0003\u0002\u0002\u000203\u0003\u0002\u0002\u00021/\u0003\u0002",
    "\u0002\u000212\u0003\u0002\u0002\u00022\t\u0003\u0002\u0002\u000231",
    "\u0003\u0002\u0002\u000245\u0007\u0010\u0002\u000256\u0005\f\u0007\u0002",
    "67\u0005\u000e\b\u000278\u0007\u0011\u0002\u00028\u000b\u0003\u0002",
    "\u0002\u00029:\u0007\u0016\u0002\u0002:\r\u0003\u0002\u0002\u0002;<",
    "\u0007\u000b\u0002\u0002<\u000f\u0003\u0002\u0002\u0002=>\u0005\u0012",
    "\n\u0002>?\u0005\u001c\u000f\u0002?\u0011\u0003\u0002\u0002\u0002@C",
    "\u0005\u0014\u000b\u0002AC\u0005\u001a\u000e\u0002B@\u0003\u0002\u0002",
    "\u0002BA\u0003\u0002\u0002\u0002CF\u0003\u0002\u0002\u0002DB\u0003\u0002",
    "\u0002\u0002DE\u0003\u0002\u0002\u0002E\u0013\u0003\u0002\u0002\u0002",
    "FD\u0003\u0002\u0002\u0002GQ\u0005\u0016\f\u0002HQ\u0007\u000e\u0002",
    "\u0002IK\u0005\u0018\r\u0002JL\u0005 \u0011\u0002KJ\u0003\u0002\u0002",
    "\u0002KL\u0003\u0002\u0002\u0002LN\u0003\u0002\u0002\u0002MO\u0005\u001e",
    "\u0010\u0002NM\u0003\u0002\u0002\u0002NO\u0003\u0002\u0002\u0002OQ\u0003",
    "\u0002\u0002\u0002PG\u0003\u0002\u0002\u0002PH\u0003\u0002\u0002\u0002",
    "PI\u0003\u0002\u0002\u0002Q\u0015\u0003\u0002\u0002\u0002RT\u0007\f",
    "\u0002\u0002SU\u0007\r\u0002\u0002TS\u0003\u0002\u0002\u0002TU\u0003",
    "\u0002\u0002\u0002U\u0017\u0003\u0002\u0002\u0002VW\u0007\u0016\u0002",
    "\u0002W\u0019\u0003\u0002\u0002\u0002XY\u0007\u0012\u0002\u0002YZ\u0005",
    "\u0012\n\u0002Z[\u0007\u0013\u0002\u0002[\u001b\u0003\u0002\u0002\u0002",
    "\\]\t\u0002\u0002\u0002]\u001d\u0003\u0002\u0002\u0002^b\u0007\u0003",
    "\u0002\u0002_a\n\u0003\u0002\u0002`_\u0003\u0002\u0002\u0002ad\u0003",
    "\u0002\u0002\u0002b`\u0003\u0002\u0002\u0002bc\u0003\u0002\u0002\u0002",
    "ce\u0003\u0002\u0002\u0002db\u0003\u0002\u0002\u0002ef\u0007\u0004\u0002",
    "\u0002f\u001f\u0003\u0002\u0002\u0002gh\u0007\u0005\u0002\u0002hi\u0007",
    "\f\u0002\u0002i!\u0003\u0002\u0002\u0002\u000b(1BDKNPTb"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'{'", "'}'", "'$'", "'1-0'", "'0-1'", "'1/2-1/2'", 
                     null, null, null, null, "'.'", null, "'*'", "'['", 
                     "']'", "'('", "')'", "'<'", "'>'" ];

var symbolicNames = [ null, null, null, null, "WHITE_WINS", "BLACK_WINS", 
                      "DRAWN_GAME", "REST_OF_LINE_COMMENT", "SPACES", "STRING", 
                      "INTEGER", "PERIOD", "DOT_DOT_DOT", "ASTERISK", "LEFT_BRACKET", 
                      "RIGHT_BRACKET", "LEFT_PARENTHESIS", "RIGHT_PARENTHESIS", 
                      "LEFT_ANGLE_BRACKET", "RIGHT_ANGLE_BRACKET", "SYMBOL", 
                      "SUFFIX_ANNOTATION", "UNEXPECTED_CHAR" ];

var ruleNames =  [ "parse", "pgn_database", "pgn_game", "tag_section", "tag_pair", 
                   "tag_name", "tag_value", "movetext_section", "element_sequence", 
                   "element", "move_number_indication", "san_move", "recursive_variation", 
                   "game_termination", "brace_comment", "numeric_annotation_glyph" ];

function PGNParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

PGNParser.prototype = Object.create(antlr4.Parser.prototype);
PGNParser.prototype.constructor = PGNParser;

Object.defineProperty(PGNParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

PGNParser.EOF = antlr4.Token.EOF;
PGNParser.T__0 = 1;
PGNParser.T__1 = 2;
PGNParser.T__2 = 3;
PGNParser.WHITE_WINS = 4;
PGNParser.BLACK_WINS = 5;
PGNParser.DRAWN_GAME = 6;
PGNParser.REST_OF_LINE_COMMENT = 7;
PGNParser.SPACES = 8;
PGNParser.STRING = 9;
PGNParser.INTEGER = 10;
PGNParser.PERIOD = 11;
PGNParser.DOT_DOT_DOT = 12;
PGNParser.ASTERISK = 13;
PGNParser.LEFT_BRACKET = 14;
PGNParser.RIGHT_BRACKET = 15;
PGNParser.LEFT_PARENTHESIS = 16;
PGNParser.RIGHT_PARENTHESIS = 17;
PGNParser.LEFT_ANGLE_BRACKET = 18;
PGNParser.RIGHT_ANGLE_BRACKET = 19;
PGNParser.SYMBOL = 20;
PGNParser.SUFFIX_ANNOTATION = 21;
PGNParser.UNEXPECTED_CHAR = 22;

PGNParser.RULE_parse = 0;
PGNParser.RULE_pgn_database = 1;
PGNParser.RULE_pgn_game = 2;
PGNParser.RULE_tag_section = 3;
PGNParser.RULE_tag_pair = 4;
PGNParser.RULE_tag_name = 5;
PGNParser.RULE_tag_value = 6;
PGNParser.RULE_movetext_section = 7;
PGNParser.RULE_element_sequence = 8;
PGNParser.RULE_element = 9;
PGNParser.RULE_move_number_indication = 10;
PGNParser.RULE_san_move = 11;
PGNParser.RULE_recursive_variation = 12;
PGNParser.RULE_game_termination = 13;
PGNParser.RULE_brace_comment = 14;
PGNParser.RULE_numeric_annotation_glyph = 15;


function ParseContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_parse;
    return this;
}

ParseContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParseContext.prototype.constructor = ParseContext;

ParseContext.prototype.pgn_database = function() {
    return this.getTypedRuleContext(Pgn_databaseContext,0);
};

ParseContext.prototype.EOF = function() {
    return this.getToken(PGNParser.EOF, 0);
};

ParseContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterParse(this);
	}
};

ParseContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitParse(this);
	}
};

ParseContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitParse(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.ParseContext = ParseContext;

PGNParser.prototype.parse = function() {

    var localctx = new ParseContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, PGNParser.RULE_parse);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 32;
        this.pgn_database();
        this.state = 33;
        this.match(PGNParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Pgn_databaseContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_pgn_database;
    return this;
}

Pgn_databaseContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Pgn_databaseContext.prototype.constructor = Pgn_databaseContext;

Pgn_databaseContext.prototype.pgn_game = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Pgn_gameContext);
    } else {
        return this.getTypedRuleContext(Pgn_gameContext,i);
    }
};

Pgn_databaseContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterPgn_database(this);
	}
};

Pgn_databaseContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitPgn_database(this);
	}
};

Pgn_databaseContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitPgn_database(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Pgn_databaseContext = Pgn_databaseContext;

PGNParser.prototype.pgn_database = function() {

    var localctx = new Pgn_databaseContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, PGNParser.RULE_pgn_database);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 38;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << PGNParser.WHITE_WINS) | (1 << PGNParser.BLACK_WINS) | (1 << PGNParser.DRAWN_GAME) | (1 << PGNParser.INTEGER) | (1 << PGNParser.DOT_DOT_DOT) | (1 << PGNParser.ASTERISK) | (1 << PGNParser.LEFT_BRACKET) | (1 << PGNParser.LEFT_PARENTHESIS) | (1 << PGNParser.SYMBOL))) !== 0)) {
            this.state = 35;
            this.pgn_game();
            this.state = 40;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Pgn_gameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_pgn_game;
    return this;
}

Pgn_gameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Pgn_gameContext.prototype.constructor = Pgn_gameContext;

Pgn_gameContext.prototype.tag_section = function() {
    return this.getTypedRuleContext(Tag_sectionContext,0);
};

Pgn_gameContext.prototype.movetext_section = function() {
    return this.getTypedRuleContext(Movetext_sectionContext,0);
};

Pgn_gameContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterPgn_game(this);
	}
};

Pgn_gameContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitPgn_game(this);
	}
};

Pgn_gameContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitPgn_game(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Pgn_gameContext = Pgn_gameContext;

PGNParser.prototype.pgn_game = function() {

    var localctx = new Pgn_gameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, PGNParser.RULE_pgn_game);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 41;
        this.tag_section();
        this.state = 42;
        this.movetext_section();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Tag_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_tag_section;
    return this;
}

Tag_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Tag_sectionContext.prototype.constructor = Tag_sectionContext;

Tag_sectionContext.prototype.tag_pair = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Tag_pairContext);
    } else {
        return this.getTypedRuleContext(Tag_pairContext,i);
    }
};

Tag_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterTag_section(this);
	}
};

Tag_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitTag_section(this);
	}
};

Tag_sectionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitTag_section(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Tag_sectionContext = Tag_sectionContext;

PGNParser.prototype.tag_section = function() {

    var localctx = new Tag_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, PGNParser.RULE_tag_section);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 47;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===PGNParser.LEFT_BRACKET) {
            this.state = 44;
            this.tag_pair();
            this.state = 49;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Tag_pairContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_tag_pair;
    return this;
}

Tag_pairContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Tag_pairContext.prototype.constructor = Tag_pairContext;

Tag_pairContext.prototype.LEFT_BRACKET = function() {
    return this.getToken(PGNParser.LEFT_BRACKET, 0);
};

Tag_pairContext.prototype.tag_name = function() {
    return this.getTypedRuleContext(Tag_nameContext,0);
};

Tag_pairContext.prototype.tag_value = function() {
    return this.getTypedRuleContext(Tag_valueContext,0);
};

Tag_pairContext.prototype.RIGHT_BRACKET = function() {
    return this.getToken(PGNParser.RIGHT_BRACKET, 0);
};

Tag_pairContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterTag_pair(this);
	}
};

Tag_pairContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitTag_pair(this);
	}
};

Tag_pairContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitTag_pair(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Tag_pairContext = Tag_pairContext;

PGNParser.prototype.tag_pair = function() {

    var localctx = new Tag_pairContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, PGNParser.RULE_tag_pair);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 50;
        this.match(PGNParser.LEFT_BRACKET);
        this.state = 51;
        this.tag_name();
        this.state = 52;
        this.tag_value();
        this.state = 53;
        this.match(PGNParser.RIGHT_BRACKET);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Tag_nameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_tag_name;
    return this;
}

Tag_nameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Tag_nameContext.prototype.constructor = Tag_nameContext;

Tag_nameContext.prototype.SYMBOL = function() {
    return this.getToken(PGNParser.SYMBOL, 0);
};

Tag_nameContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterTag_name(this);
	}
};

Tag_nameContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitTag_name(this);
	}
};

Tag_nameContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitTag_name(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Tag_nameContext = Tag_nameContext;

PGNParser.prototype.tag_name = function() {

    var localctx = new Tag_nameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, PGNParser.RULE_tag_name);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 55;
        this.match(PGNParser.SYMBOL);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Tag_valueContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_tag_value;
    return this;
}

Tag_valueContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Tag_valueContext.prototype.constructor = Tag_valueContext;

Tag_valueContext.prototype.STRING = function() {
    return this.getToken(PGNParser.STRING, 0);
};

Tag_valueContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterTag_value(this);
	}
};

Tag_valueContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitTag_value(this);
	}
};

Tag_valueContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitTag_value(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Tag_valueContext = Tag_valueContext;

PGNParser.prototype.tag_value = function() {

    var localctx = new Tag_valueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, PGNParser.RULE_tag_value);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 57;
        this.match(PGNParser.STRING);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Movetext_sectionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_movetext_section;
    return this;
}

Movetext_sectionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Movetext_sectionContext.prototype.constructor = Movetext_sectionContext;

Movetext_sectionContext.prototype.element_sequence = function() {
    return this.getTypedRuleContext(Element_sequenceContext,0);
};

Movetext_sectionContext.prototype.game_termination = function() {
    return this.getTypedRuleContext(Game_terminationContext,0);
};

Movetext_sectionContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterMovetext_section(this);
	}
};

Movetext_sectionContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitMovetext_section(this);
	}
};

Movetext_sectionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitMovetext_section(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Movetext_sectionContext = Movetext_sectionContext;

PGNParser.prototype.movetext_section = function() {

    var localctx = new Movetext_sectionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, PGNParser.RULE_movetext_section);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 59;
        this.element_sequence();
        this.state = 60;
        this.game_termination();
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Element_sequenceContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_element_sequence;
    return this;
}

Element_sequenceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Element_sequenceContext.prototype.constructor = Element_sequenceContext;

Element_sequenceContext.prototype.element = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ElementContext);
    } else {
        return this.getTypedRuleContext(ElementContext,i);
    }
};

Element_sequenceContext.prototype.recursive_variation = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(Recursive_variationContext);
    } else {
        return this.getTypedRuleContext(Recursive_variationContext,i);
    }
};

Element_sequenceContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterElement_sequence(this);
	}
};

Element_sequenceContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitElement_sequence(this);
	}
};

Element_sequenceContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitElement_sequence(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Element_sequenceContext = Element_sequenceContext;

PGNParser.prototype.element_sequence = function() {

    var localctx = new Element_sequenceContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, PGNParser.RULE_element_sequence);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 66;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << PGNParser.INTEGER) | (1 << PGNParser.DOT_DOT_DOT) | (1 << PGNParser.LEFT_PARENTHESIS) | (1 << PGNParser.SYMBOL))) !== 0)) {
            this.state = 64;
            this._errHandler.sync(this);
            switch(this._input.LA(1)) {
            case PGNParser.INTEGER:
            case PGNParser.DOT_DOT_DOT:
            case PGNParser.SYMBOL:
                this.state = 62;
                this.element();
                break;
            case PGNParser.LEFT_PARENTHESIS:
                this.state = 63;
                this.recursive_variation();
                break;
            default:
                throw new antlr4.error.NoViableAltException(this);
            }
            this.state = 68;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function ElementContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_element;
    return this;
}

ElementContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElementContext.prototype.constructor = ElementContext;

ElementContext.prototype.move_number_indication = function() {
    return this.getTypedRuleContext(Move_number_indicationContext,0);
};

ElementContext.prototype.DOT_DOT_DOT = function() {
    return this.getToken(PGNParser.DOT_DOT_DOT, 0);
};

ElementContext.prototype.san_move = function() {
    return this.getTypedRuleContext(San_moveContext,0);
};

ElementContext.prototype.numeric_annotation_glyph = function() {
    return this.getTypedRuleContext(Numeric_annotation_glyphContext,0);
};

ElementContext.prototype.brace_comment = function() {
    return this.getTypedRuleContext(Brace_commentContext,0);
};

ElementContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterElement(this);
	}
};

ElementContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitElement(this);
	}
};

ElementContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitElement(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.ElementContext = ElementContext;

PGNParser.prototype.element = function() {

    var localctx = new ElementContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, PGNParser.RULE_element);
    var _la = 0; // Token type
    try {
        this.state = 78;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case PGNParser.INTEGER:
            this.enterOuterAlt(localctx, 1);
            this.state = 69;
            this.move_number_indication();
            break;
        case PGNParser.DOT_DOT_DOT:
            this.enterOuterAlt(localctx, 2);
            this.state = 70;
            this.match(PGNParser.DOT_DOT_DOT);
            break;
        case PGNParser.SYMBOL:
            this.enterOuterAlt(localctx, 3);
            this.state = 71;
            this.san_move();
            this.state = 73;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if(_la===PGNParser.T__2) {
                this.state = 72;
                this.numeric_annotation_glyph();
            }

            this.state = 76;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if(_la===PGNParser.T__0) {
                this.state = 75;
                this.brace_comment();
            }

            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Move_number_indicationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_move_number_indication;
    return this;
}

Move_number_indicationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Move_number_indicationContext.prototype.constructor = Move_number_indicationContext;

Move_number_indicationContext.prototype.INTEGER = function() {
    return this.getToken(PGNParser.INTEGER, 0);
};

Move_number_indicationContext.prototype.PERIOD = function() {
    return this.getToken(PGNParser.PERIOD, 0);
};

Move_number_indicationContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterMove_number_indication(this);
	}
};

Move_number_indicationContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitMove_number_indication(this);
	}
};

Move_number_indicationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitMove_number_indication(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Move_number_indicationContext = Move_number_indicationContext;

PGNParser.prototype.move_number_indication = function() {

    var localctx = new Move_number_indicationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, PGNParser.RULE_move_number_indication);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 80;
        this.match(PGNParser.INTEGER);
        this.state = 82;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if(_la===PGNParser.PERIOD) {
            this.state = 81;
            this.match(PGNParser.PERIOD);
        }

    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function San_moveContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_san_move;
    return this;
}

San_moveContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
San_moveContext.prototype.constructor = San_moveContext;

San_moveContext.prototype.SYMBOL = function() {
    return this.getToken(PGNParser.SYMBOL, 0);
};

San_moveContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterSan_move(this);
	}
};

San_moveContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitSan_move(this);
	}
};

San_moveContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitSan_move(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.San_moveContext = San_moveContext;

PGNParser.prototype.san_move = function() {

    var localctx = new San_moveContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, PGNParser.RULE_san_move);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 84;
        this.match(PGNParser.SYMBOL);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Recursive_variationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_recursive_variation;
    return this;
}

Recursive_variationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Recursive_variationContext.prototype.constructor = Recursive_variationContext;

Recursive_variationContext.prototype.LEFT_PARENTHESIS = function() {
    return this.getToken(PGNParser.LEFT_PARENTHESIS, 0);
};

Recursive_variationContext.prototype.element_sequence = function() {
    return this.getTypedRuleContext(Element_sequenceContext,0);
};

Recursive_variationContext.prototype.RIGHT_PARENTHESIS = function() {
    return this.getToken(PGNParser.RIGHT_PARENTHESIS, 0);
};

Recursive_variationContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterRecursive_variation(this);
	}
};

Recursive_variationContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitRecursive_variation(this);
	}
};

Recursive_variationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitRecursive_variation(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Recursive_variationContext = Recursive_variationContext;

PGNParser.prototype.recursive_variation = function() {

    var localctx = new Recursive_variationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, PGNParser.RULE_recursive_variation);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 86;
        this.match(PGNParser.LEFT_PARENTHESIS);
        this.state = 87;
        this.element_sequence();
        this.state = 88;
        this.match(PGNParser.RIGHT_PARENTHESIS);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Game_terminationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_game_termination;
    return this;
}

Game_terminationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Game_terminationContext.prototype.constructor = Game_terminationContext;

Game_terminationContext.prototype.WHITE_WINS = function() {
    return this.getToken(PGNParser.WHITE_WINS, 0);
};

Game_terminationContext.prototype.BLACK_WINS = function() {
    return this.getToken(PGNParser.BLACK_WINS, 0);
};

Game_terminationContext.prototype.DRAWN_GAME = function() {
    return this.getToken(PGNParser.DRAWN_GAME, 0);
};

Game_terminationContext.prototype.ASTERISK = function() {
    return this.getToken(PGNParser.ASTERISK, 0);
};

Game_terminationContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterGame_termination(this);
	}
};

Game_terminationContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitGame_termination(this);
	}
};

Game_terminationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitGame_termination(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Game_terminationContext = Game_terminationContext;

PGNParser.prototype.game_termination = function() {

    var localctx = new Game_terminationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, PGNParser.RULE_game_termination);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 90;
        _la = this._input.LA(1);
        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << PGNParser.WHITE_WINS) | (1 << PGNParser.BLACK_WINS) | (1 << PGNParser.DRAWN_GAME) | (1 << PGNParser.ASTERISK))) !== 0))) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Brace_commentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_brace_comment;
    return this;
}

Brace_commentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Brace_commentContext.prototype.constructor = Brace_commentContext;


Brace_commentContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterBrace_comment(this);
	}
};

Brace_commentContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitBrace_comment(this);
	}
};

Brace_commentContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitBrace_comment(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Brace_commentContext = Brace_commentContext;

PGNParser.prototype.brace_comment = function() {

    var localctx = new Brace_commentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, PGNParser.RULE_brace_comment);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 92;
        this.match(PGNParser.T__0);
        this.state = 96;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << PGNParser.T__0) | (1 << PGNParser.T__2) | (1 << PGNParser.WHITE_WINS) | (1 << PGNParser.BLACK_WINS) | (1 << PGNParser.DRAWN_GAME) | (1 << PGNParser.REST_OF_LINE_COMMENT) | (1 << PGNParser.SPACES) | (1 << PGNParser.STRING) | (1 << PGNParser.INTEGER) | (1 << PGNParser.PERIOD) | (1 << PGNParser.DOT_DOT_DOT) | (1 << PGNParser.ASTERISK) | (1 << PGNParser.LEFT_BRACKET) | (1 << PGNParser.RIGHT_BRACKET) | (1 << PGNParser.LEFT_PARENTHESIS) | (1 << PGNParser.RIGHT_PARENTHESIS) | (1 << PGNParser.LEFT_ANGLE_BRACKET) | (1 << PGNParser.RIGHT_ANGLE_BRACKET) | (1 << PGNParser.SYMBOL) | (1 << PGNParser.SUFFIX_ANNOTATION) | (1 << PGNParser.UNEXPECTED_CHAR))) !== 0)) {
            this.state = 93;
            _la = this._input.LA(1);
            if(_la<=0 || _la===PGNParser.T__1) {
            this._errHandler.recoverInline(this);
            }
            else {
            	this._errHandler.reportMatch(this);
                this.consume();
            }
            this.state = 98;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 99;
        this.match(PGNParser.T__1);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


function Numeric_annotation_glyphContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PGNParser.RULE_numeric_annotation_glyph;
    return this;
}

Numeric_annotation_glyphContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Numeric_annotation_glyphContext.prototype.constructor = Numeric_annotation_glyphContext;

Numeric_annotation_glyphContext.prototype.INTEGER = function() {
    return this.getToken(PGNParser.INTEGER, 0);
};

Numeric_annotation_glyphContext.prototype.enterRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.enterNumeric_annotation_glyph(this);
	}
};

Numeric_annotation_glyphContext.prototype.exitRule = function(listener) {
    if(listener instanceof PGNListener ) {
        listener.exitNumeric_annotation_glyph(this);
	}
};

Numeric_annotation_glyphContext.prototype.accept = function(visitor) {
    if ( visitor instanceof PGNVisitor ) {
        return visitor.visitNumeric_annotation_glyph(this);
    } else {
        return visitor.visitChildren(this);
    }
};




PGNParser.Numeric_annotation_glyphContext = Numeric_annotation_glyphContext;

PGNParser.prototype.numeric_annotation_glyph = function() {

    var localctx = new Numeric_annotation_glyphContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, PGNParser.RULE_numeric_annotation_glyph);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 101;
        this.match(PGNParser.T__2);
        this.state = 102;
        this.match(PGNParser.INTEGER);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


exports.PGNParser = PGNParser;
