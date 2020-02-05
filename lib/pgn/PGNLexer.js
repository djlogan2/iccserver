// Generated from /Users/davidlogan/workspace/icc/iccserver/private/PGN.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');



var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0002\u0018\u0088\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004",
    "\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t",
    "\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004",
    "\f\t\f\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010",
    "\t\u0010\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013",
    "\u0004\u0014\t\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016\u0004\u0017",
    "\t\u0017\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0004",
    "\u0003\u0004\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007\u0003\u0007",
    "\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b",
    "\u0003\b\u0007\bH\n\b\f\b\u000e\bK\u000b\b\u0003\b\u0003\b\u0003\t\u0006",
    "\tP\n\t\r\t\u000e\tQ\u0003\t\u0003\t\u0003\n\u0003\n\u0003\n\u0003\n",
    "\u0003\n\u0003\n\u0007\n\\\n\n\f\n\u000e\n_\u000b\n\u0003\n\u0003\n",
    "\u0003\u000b\u0006\u000bd\n\u000b\r\u000b\u000e\u000be\u0003\f\u0003",
    "\f\u0003\r\u0003\r\u0003\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000f",
    "\u0003\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011\u0003\u0012",
    "\u0003\u0012\u0003\u0013\u0003\u0013\u0003\u0014\u0003\u0014\u0003\u0015",
    "\u0003\u0015\u0007\u0015~\n\u0015\f\u0015\u000e\u0015\u0081\u000b\u0015",
    "\u0003\u0016\u0003\u0016\u0005\u0016\u0085\n\u0016\u0003\u0017\u0003",
    "\u0017\u0002\u0002\u0018\u0003\u0003\u0005\u0004\u0007\u0005\t\u0006",
    "\u000b\u0007\r\b\u000f\t\u0011\n\u0013\u000b\u0015\f\u0017\r\u0019\u000e",
    "\u001b\u000f\u001d\u0010\u001f\u0011!\u0012#\u0013%\u0014\'\u0015)\u0016",
    "+\u0017-\u0018\u0003\u0002\t\u0004\u0002\f\f\u000f\u000f\u0005\u0002",
    "\u000b\f\u000f\u000f\"\"\u0004\u0002$$^^\u0003\u00022;\u0005\u00022",
    ";C\\c|\n\u0002%%--//2<??C\\aac|\u0004\u0002##AA\u0002\u008f\u0002\u0003",
    "\u0003\u0002\u0002\u0002\u0002\u0005\u0003\u0002\u0002\u0002\u0002\u0007",
    "\u0003\u0002\u0002\u0002\u0002\t\u0003\u0002\u0002\u0002\u0002\u000b",
    "\u0003\u0002\u0002\u0002\u0002\r\u0003\u0002\u0002\u0002\u0002\u000f",
    "\u0003\u0002\u0002\u0002\u0002\u0011\u0003\u0002\u0002\u0002\u0002\u0013",
    "\u0003\u0002\u0002\u0002\u0002\u0015\u0003\u0002\u0002\u0002\u0002\u0017",
    "\u0003\u0002\u0002\u0002\u0002\u0019\u0003\u0002\u0002\u0002\u0002\u001b",
    "\u0003\u0002\u0002\u0002\u0002\u001d\u0003\u0002\u0002\u0002\u0002\u001f",
    "\u0003\u0002\u0002\u0002\u0002!\u0003\u0002\u0002\u0002\u0002#\u0003",
    "\u0002\u0002\u0002\u0002%\u0003\u0002\u0002\u0002\u0002\'\u0003\u0002",
    "\u0002\u0002\u0002)\u0003\u0002\u0002\u0002\u0002+\u0003\u0002\u0002",
    "\u0002\u0002-\u0003\u0002\u0002\u0002\u0003/\u0003\u0002\u0002\u0002",
    "\u00051\u0003\u0002\u0002\u0002\u00073\u0003\u0002\u0002\u0002\t5\u0003",
    "\u0002\u0002\u0002\u000b9\u0003\u0002\u0002\u0002\r=\u0003\u0002\u0002",
    "\u0002\u000fE\u0003\u0002\u0002\u0002\u0011O\u0003\u0002\u0002\u0002",
    "\u0013U\u0003\u0002\u0002\u0002\u0015c\u0003\u0002\u0002\u0002\u0017",
    "g\u0003\u0002\u0002\u0002\u0019i\u0003\u0002\u0002\u0002\u001bm\u0003",
    "\u0002\u0002\u0002\u001do\u0003\u0002\u0002\u0002\u001fq\u0003\u0002",
    "\u0002\u0002!s\u0003\u0002\u0002\u0002#u\u0003\u0002\u0002\u0002%w\u0003",
    "\u0002\u0002\u0002\'y\u0003\u0002\u0002\u0002){\u0003\u0002\u0002\u0002",
    "+\u0082\u0003\u0002\u0002\u0002-\u0086\u0003\u0002\u0002\u0002/0\u0007",
    "}\u0002\u00020\u0004\u0003\u0002\u0002\u000212\u0007\u007f\u0002\u0002",
    "2\u0006\u0003\u0002\u0002\u000234\u0007&\u0002\u00024\b\u0003\u0002",
    "\u0002\u000256\u00073\u0002\u000267\u0007/\u0002\u000278\u00072\u0002",
    "\u00028\n\u0003\u0002\u0002\u00029:\u00072\u0002\u0002:;\u0007/\u0002",
    "\u0002;<\u00073\u0002\u0002<\f\u0003\u0002\u0002\u0002=>\u00073\u0002",
    "\u0002>?\u00071\u0002\u0002?@\u00074\u0002\u0002@A\u0007/\u0002\u0002",
    "AB\u00073\u0002\u0002BC\u00071\u0002\u0002CD\u00074\u0002\u0002D\u000e",
    "\u0003\u0002\u0002\u0002EI\u0007=\u0002\u0002FH\n\u0002\u0002\u0002",
    "GF\u0003\u0002\u0002\u0002HK\u0003\u0002\u0002\u0002IG\u0003\u0002\u0002",
    "\u0002IJ\u0003\u0002\u0002\u0002JL\u0003\u0002\u0002\u0002KI\u0003\u0002",
    "\u0002\u0002LM\b\b\u0002\u0002M\u0010\u0003\u0002\u0002\u0002NP\t\u0003",
    "\u0002\u0002ON\u0003\u0002\u0002\u0002PQ\u0003\u0002\u0002\u0002QO\u0003",
    "\u0002\u0002\u0002QR\u0003\u0002\u0002\u0002RS\u0003\u0002\u0002\u0002",
    "ST\b\t\u0002\u0002T\u0012\u0003\u0002\u0002\u0002U]\u0007$\u0002\u0002",
    "VW\u0007^\u0002\u0002W\\\u0007^\u0002\u0002XY\u0007^\u0002\u0002Y\\",
    "\u0007$\u0002\u0002Z\\\n\u0004\u0002\u0002[V\u0003\u0002\u0002\u0002",
    "[X\u0003\u0002\u0002\u0002[Z\u0003\u0002\u0002\u0002\\_\u0003\u0002",
    "\u0002\u0002][\u0003\u0002\u0002\u0002]^\u0003\u0002\u0002\u0002^`\u0003",
    "\u0002\u0002\u0002_]\u0003\u0002\u0002\u0002`a\u0007$\u0002\u0002a\u0014",
    "\u0003\u0002\u0002\u0002bd\t\u0005\u0002\u0002cb\u0003\u0002\u0002\u0002",
    "de\u0003\u0002\u0002\u0002ec\u0003\u0002\u0002\u0002ef\u0003\u0002\u0002",
    "\u0002f\u0016\u0003\u0002\u0002\u0002gh\u00070\u0002\u0002h\u0018\u0003",
    "\u0002\u0002\u0002ij\u0005\u0017\f\u0002jk\u0005\u0017\f\u0002kl\u0005",
    "\u0017\f\u0002l\u001a\u0003\u0002\u0002\u0002mn\u0007,\u0002\u0002n",
    "\u001c\u0003\u0002\u0002\u0002op\u0007]\u0002\u0002p\u001e\u0003\u0002",
    "\u0002\u0002qr\u0007_\u0002\u0002r \u0003\u0002\u0002\u0002st\u0007",
    "*\u0002\u0002t\"\u0003\u0002\u0002\u0002uv\u0007+\u0002\u0002v$\u0003",
    "\u0002\u0002\u0002wx\u0007>\u0002\u0002x&\u0003\u0002\u0002\u0002yz",
    "\u0007@\u0002\u0002z(\u0003\u0002\u0002\u0002{\u007f\t\u0006\u0002\u0002",
    "|~\t\u0007\u0002\u0002}|\u0003\u0002\u0002\u0002~\u0081\u0003\u0002",
    "\u0002\u0002\u007f}\u0003\u0002\u0002\u0002\u007f\u0080\u0003\u0002",
    "\u0002\u0002\u0080*\u0003\u0002\u0002\u0002\u0081\u007f\u0003\u0002",
    "\u0002\u0002\u0082\u0084\t\b\u0002\u0002\u0083\u0085\t\b\u0002\u0002",
    "\u0084\u0083\u0003\u0002\u0002\u0002\u0084\u0085\u0003\u0002\u0002\u0002",
    "\u0085,\u0003\u0002\u0002\u0002\u0086\u0087\u000b\u0002\u0002\u0002",
    "\u0087.\u0003\u0002\u0002\u0002\n\u0002IQ[]e\u007f\u0084\u0003\b\u0002",
    "\u0002"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

function PGNLexer(input) {
	antlr4.Lexer.call(this, input);
    this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    return this;
}

PGNLexer.prototype = Object.create(antlr4.Lexer.prototype);
PGNLexer.prototype.constructor = PGNLexer;

Object.defineProperty(PGNLexer.prototype, "atn", {
        get : function() {
                return atn;
        }
});

PGNLexer.EOF = antlr4.Token.EOF;
PGNLexer.T__0 = 1;
PGNLexer.T__1 = 2;
PGNLexer.T__2 = 3;
PGNLexer.WHITE_WINS = 4;
PGNLexer.BLACK_WINS = 5;
PGNLexer.DRAWN_GAME = 6;
PGNLexer.REST_OF_LINE_COMMENT = 7;
PGNLexer.SPACES = 8;
PGNLexer.STRING = 9;
PGNLexer.INTEGER = 10;
PGNLexer.PERIOD = 11;
PGNLexer.DOT_DOT_DOT = 12;
PGNLexer.ASTERISK = 13;
PGNLexer.LEFT_BRACKET = 14;
PGNLexer.RIGHT_BRACKET = 15;
PGNLexer.LEFT_PARENTHESIS = 16;
PGNLexer.RIGHT_PARENTHESIS = 17;
PGNLexer.LEFT_ANGLE_BRACKET = 18;
PGNLexer.RIGHT_ANGLE_BRACKET = 19;
PGNLexer.SYMBOL = 20;
PGNLexer.SUFFIX_ANNOTATION = 21;
PGNLexer.UNEXPECTED_CHAR = 22;

PGNLexer.prototype.channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];

PGNLexer.prototype.modeNames = [ "DEFAULT_MODE" ];

PGNLexer.prototype.literalNames = [ null, "'{'", "'}'", "'$'", "'1-0'", 
                                    "'0-1'", "'1/2-1/2'", null, null, null, 
                                    null, "'.'", null, "'*'", "'['", "']'", 
                                    "'('", "')'", "'<'", "'>'" ];

PGNLexer.prototype.symbolicNames = [ null, null, null, null, "WHITE_WINS", 
                                     "BLACK_WINS", "DRAWN_GAME", "REST_OF_LINE_COMMENT", 
                                     "SPACES", "STRING", "INTEGER", "PERIOD", 
                                     "DOT_DOT_DOT", "ASTERISK", "LEFT_BRACKET", 
                                     "RIGHT_BRACKET", "LEFT_PARENTHESIS", 
                                     "RIGHT_PARENTHESIS", "LEFT_ANGLE_BRACKET", 
                                     "RIGHT_ANGLE_BRACKET", "SYMBOL", "SUFFIX_ANNOTATION", 
                                     "UNEXPECTED_CHAR" ];

PGNLexer.prototype.ruleNames = [ "T__0", "T__1", "T__2", "WHITE_WINS", "BLACK_WINS", 
                                 "DRAWN_GAME", "REST_OF_LINE_COMMENT", "SPACES", 
                                 "STRING", "INTEGER", "PERIOD", "DOT_DOT_DOT", 
                                 "ASTERISK", "LEFT_BRACKET", "RIGHT_BRACKET", 
                                 "LEFT_PARENTHESIS", "RIGHT_PARENTHESIS", 
                                 "LEFT_ANGLE_BRACKET", "RIGHT_ANGLE_BRACKET", 
                                 "SYMBOL", "SUFFIX_ANNOTATION", "UNEXPECTED_CHAR" ];

PGNLexer.prototype.grammarFileName = "PGN.g4";


exports.PGNLexer = PGNLexer;

