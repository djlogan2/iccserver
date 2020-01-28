// Generated from /Users/davidlogan/workspace/icc/iccserver/private/PGN.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');



var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0002\u0016\u008b\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004",
    "\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t",
    "\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004",
    "\f\t\f\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010",
    "\t\u0010\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013",
    "\u0004\u0014\t\u0014\u0004\u0015\t\u0015\u0003\u0002\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003",
    "\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003",
    "\u0004\u0003\u0004\u0003\u0005\u0003\u0005\u0007\u0005>\n\u0005\f\u0005",
    "\u000e\u0005A\u000b\u0005\u0003\u0005\u0003\u0005\u0003\u0006\u0003",
    "\u0006\u0007\u0006G\n\u0006\f\u0006\u000e\u0006J\u000b\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0007\u0006\u0007Q\n\u0007",
    "\r\u0007\u000e\u0007R\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003",
    "\b\u0003\b\u0003\b\u0003\b\u0007\b]\n\b\f\b\u000e\b`\u000b\b\u0003\b",
    "\u0003\b\u0003\t\u0006\te\n\t\r\t\u000e\tf\u0003\n\u0003\n\u0003\u000b",
    "\u0003\u000b\u0003\f\u0003\f\u0003\r\u0003\r\u0003\u000e\u0003\u000e",
    "\u0003\u000f\u0003\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011",
    "\u0003\u0012\u0003\u0012\u0006\u0012{\n\u0012\r\u0012\u000e\u0012|\u0003",
    "\u0013\u0003\u0013\u0007\u0013\u0081\n\u0013\f\u0013\u000e\u0013\u0084",
    "\u000b\u0013\u0003\u0014\u0003\u0014\u0005\u0014\u0088\n\u0014\u0003",
    "\u0015\u0003\u0015\u0002\u0002\u0016\u0003\u0003\u0005\u0004\u0007\u0005",
    "\t\u0006\u000b\u0007\r\b\u000f\t\u0011\n\u0013\u000b\u0015\f\u0017\r",
    "\u0019\u000e\u001b\u000f\u001d\u0010\u001f\u0011!\u0012#\u0013%\u0014",
    "\'\u0015)\u0016\u0003\u0002\n\u0004\u0002\f\f\u000f\u000f\u0003\u0002",
    "\u007f\u007f\u0005\u0002\u000b\f\u000f\u000f\"\"\u0004\u0002$$^^\u0003",
    "\u00022;\u0005\u00022;C\\c|\n\u0002%%--//2<??C\\aac|\u0004\u0002##A",
    "A\u0002\u0094\u0002\u0003\u0003\u0002\u0002\u0002\u0002\u0005\u0003",
    "\u0002\u0002\u0002\u0002\u0007\u0003\u0002\u0002\u0002\u0002\t\u0003",
    "\u0002\u0002\u0002\u0002\u000b\u0003\u0002\u0002\u0002\u0002\r\u0003",
    "\u0002\u0002\u0002\u0002\u000f\u0003\u0002\u0002\u0002\u0002\u0011\u0003",
    "\u0002\u0002\u0002\u0002\u0013\u0003\u0002\u0002\u0002\u0002\u0015\u0003",
    "\u0002\u0002\u0002\u0002\u0017\u0003\u0002\u0002\u0002\u0002\u0019\u0003",
    "\u0002\u0002\u0002\u0002\u001b\u0003\u0002\u0002\u0002\u0002\u001d\u0003",
    "\u0002\u0002\u0002\u0002\u001f\u0003\u0002\u0002\u0002\u0002!\u0003",
    "\u0002\u0002\u0002\u0002#\u0003\u0002\u0002\u0002\u0002%\u0003\u0002",
    "\u0002\u0002\u0002\'\u0003\u0002\u0002\u0002\u0002)\u0003\u0002\u0002",
    "\u0002\u0003+\u0003\u0002\u0002\u0002\u0005/\u0003\u0002\u0002\u0002",
    "\u00073\u0003\u0002\u0002\u0002\t;\u0003\u0002\u0002\u0002\u000bD\u0003",
    "\u0002\u0002\u0002\rP\u0003\u0002\u0002\u0002\u000fV\u0003\u0002\u0002",
    "\u0002\u0011d\u0003\u0002\u0002\u0002\u0013h\u0003\u0002\u0002\u0002",
    "\u0015j\u0003\u0002\u0002\u0002\u0017l\u0003\u0002\u0002\u0002\u0019",
    "n\u0003\u0002\u0002\u0002\u001bp\u0003\u0002\u0002\u0002\u001dr\u0003",
    "\u0002\u0002\u0002\u001ft\u0003\u0002\u0002\u0002!v\u0003\u0002\u0002",
    "\u0002#x\u0003\u0002\u0002\u0002%~\u0003\u0002\u0002\u0002\'\u0085\u0003",
    "\u0002\u0002\u0002)\u0089\u0003\u0002\u0002\u0002+,\u00073\u0002\u0002",
    ",-\u0007/\u0002\u0002-.\u00072\u0002\u0002.\u0004\u0003\u0002\u0002",
    "\u0002/0\u00072\u0002\u000201\u0007/\u0002\u000212\u00073\u0002\u0002",
    "2\u0006\u0003\u0002\u0002\u000234\u00073\u0002\u000245\u00071\u0002",
    "\u000256\u00074\u0002\u000267\u0007/\u0002\u000278\u00073\u0002\u0002",
    "89\u00071\u0002\u00029:\u00074\u0002\u0002:\b\u0003\u0002\u0002\u0002",
    ";?\u0007=\u0002\u0002<>\n\u0002\u0002\u0002=<\u0003\u0002\u0002\u0002",
    ">A\u0003\u0002\u0002\u0002?=\u0003\u0002\u0002\u0002?@\u0003\u0002\u0002",
    "\u0002@B\u0003\u0002\u0002\u0002A?\u0003\u0002\u0002\u0002BC\b\u0005",
    "\u0002\u0002C\n\u0003\u0002\u0002\u0002DH\u0007}\u0002\u0002EG\n\u0003",
    "\u0002\u0002FE\u0003\u0002\u0002\u0002GJ\u0003\u0002\u0002\u0002HF\u0003",
    "\u0002\u0002\u0002HI\u0003\u0002\u0002\u0002IK\u0003\u0002\u0002\u0002",
    "JH\u0003\u0002\u0002\u0002KL\u0007\u007f\u0002\u0002LM\u0003\u0002\u0002",
    "\u0002MN\b\u0006\u0002\u0002N\f\u0003\u0002\u0002\u0002OQ\t\u0004\u0002",
    "\u0002PO\u0003\u0002\u0002\u0002QR\u0003\u0002\u0002\u0002RP\u0003\u0002",
    "\u0002\u0002RS\u0003\u0002\u0002\u0002ST\u0003\u0002\u0002\u0002TU\b",
    "\u0007\u0002\u0002U\u000e\u0003\u0002\u0002\u0002V^\u0007$\u0002\u0002",
    "WX\u0007^\u0002\u0002X]\u0007^\u0002\u0002YZ\u0007^\u0002\u0002Z]\u0007",
    "$\u0002\u0002[]\n\u0005\u0002\u0002\\W\u0003\u0002\u0002\u0002\\Y\u0003",
    "\u0002\u0002\u0002\\[\u0003\u0002\u0002\u0002]`\u0003\u0002\u0002\u0002",
    "^\\\u0003\u0002\u0002\u0002^_\u0003\u0002\u0002\u0002_a\u0003\u0002",
    "\u0002\u0002`^\u0003\u0002\u0002\u0002ab\u0007$\u0002\u0002b\u0010\u0003",
    "\u0002\u0002\u0002ce\t\u0006\u0002\u0002dc\u0003\u0002\u0002\u0002e",
    "f\u0003\u0002\u0002\u0002fd\u0003\u0002\u0002\u0002fg\u0003\u0002\u0002",
    "\u0002g\u0012\u0003\u0002\u0002\u0002hi\u00070\u0002\u0002i\u0014\u0003",
    "\u0002\u0002\u0002jk\u0007,\u0002\u0002k\u0016\u0003\u0002\u0002\u0002",
    "lm\u0007]\u0002\u0002m\u0018\u0003\u0002\u0002\u0002no\u0007_\u0002",
    "\u0002o\u001a\u0003\u0002\u0002\u0002pq\u0007*\u0002\u0002q\u001c\u0003",
    "\u0002\u0002\u0002rs\u0007+\u0002\u0002s\u001e\u0003\u0002\u0002\u0002",
    "tu\u0007>\u0002\u0002u \u0003\u0002\u0002\u0002vw\u0007@\u0002\u0002",
    "w\"\u0003\u0002\u0002\u0002xz\u0007&\u0002\u0002y{\t\u0006\u0002\u0002",
    "zy\u0003\u0002\u0002\u0002{|\u0003\u0002\u0002\u0002|z\u0003\u0002\u0002",
    "\u0002|}\u0003\u0002\u0002\u0002}$\u0003\u0002\u0002\u0002~\u0082\t",
    "\u0007\u0002\u0002\u007f\u0081\t\b\u0002\u0002\u0080\u007f\u0003\u0002",
    "\u0002\u0002\u0081\u0084\u0003\u0002\u0002\u0002\u0082\u0080\u0003\u0002",
    "\u0002\u0002\u0082\u0083\u0003\u0002\u0002\u0002\u0083&\u0003\u0002",
    "\u0002\u0002\u0084\u0082\u0003\u0002\u0002\u0002\u0085\u0087\t\t\u0002",
    "\u0002\u0086\u0088\t\t\u0002\u0002\u0087\u0086\u0003\u0002\u0002\u0002",
    "\u0087\u0088\u0003\u0002\u0002\u0002\u0088(\u0003\u0002\u0002\u0002",
    "\u0089\u008a\u000b\u0002\u0002\u0002\u008a*\u0003\u0002\u0002\u0002",
    "\f\u0002?HR\\^f|\u0082\u0087\u0003\b\u0002\u0002"].join("");


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
PGNLexer.WHITE_WINS = 1;
PGNLexer.BLACK_WINS = 2;
PGNLexer.DRAWN_GAME = 3;
PGNLexer.REST_OF_LINE_COMMENT = 4;
PGNLexer.BRACE_COMMENT = 5;
PGNLexer.SPACES = 6;
PGNLexer.STRING = 7;
PGNLexer.INTEGER = 8;
PGNLexer.PERIOD = 9;
PGNLexer.ASTERISK = 10;
PGNLexer.LEFT_BRACKET = 11;
PGNLexer.RIGHT_BRACKET = 12;
PGNLexer.LEFT_PARENTHESIS = 13;
PGNLexer.RIGHT_PARENTHESIS = 14;
PGNLexer.LEFT_ANGLE_BRACKET = 15;
PGNLexer.RIGHT_ANGLE_BRACKET = 16;
PGNLexer.NUMERIC_ANNOTATION_GLYPH = 17;
PGNLexer.SYMBOL = 18;
PGNLexer.SUFFIX_ANNOTATION = 19;
PGNLexer.UNEXPECTED_CHAR = 20;

PGNLexer.prototype.channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];

PGNLexer.prototype.modeNames = [ "DEFAULT_MODE" ];

PGNLexer.prototype.literalNames = [ null, "'1-0'", "'0-1'", "'1/2-1/2'", 
                                    null, null, null, null, null, "'.'", 
                                    "'*'", "'['", "']'", "'('", "')'", "'<'", 
                                    "'>'" ];

PGNLexer.prototype.symbolicNames = [ null, "WHITE_WINS", "BLACK_WINS", "DRAWN_GAME", 
                                     "REST_OF_LINE_COMMENT", "BRACE_COMMENT", 
                                     "SPACES", "STRING", "INTEGER", "PERIOD", 
                                     "ASTERISK", "LEFT_BRACKET", "RIGHT_BRACKET", 
                                     "LEFT_PARENTHESIS", "RIGHT_PARENTHESIS", 
                                     "LEFT_ANGLE_BRACKET", "RIGHT_ANGLE_BRACKET", 
                                     "NUMERIC_ANNOTATION_GLYPH", "SYMBOL", 
                                     "SUFFIX_ANNOTATION", "UNEXPECTED_CHAR" ];

PGNLexer.prototype.ruleNames = [ "WHITE_WINS", "BLACK_WINS", "DRAWN_GAME", 
                                 "REST_OF_LINE_COMMENT", "BRACE_COMMENT", 
                                 "SPACES", "STRING", "INTEGER", "PERIOD", 
                                 "ASTERISK", "LEFT_BRACKET", "RIGHT_BRACKET", 
                                 "LEFT_PARENTHESIS", "RIGHT_PARENTHESIS", 
                                 "LEFT_ANGLE_BRACKET", "RIGHT_ANGLE_BRACKET", 
                                 "NUMERIC_ANNOTATION_GLYPH", "SYMBOL", "SUFFIX_ANNOTATION", 
                                 "UNEXPECTED_CHAR" ];

PGNLexer.prototype.grammarFileName = "PGN.g4";


exports.PGNLexer = PGNLexer;

