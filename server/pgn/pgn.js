// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const lexer = require("./pgnlexer.js").lexer;
    function join(array) {
    console.log("array=" + array);
        if(!array || !array.length) return "{}";
        return "{" + array.join(",") + "}";
    }
 var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "database", "symbols": []},
    {"name": "database$subexpression$1", "symbols": ["game", "_", "database"]},
    {"name": "database", "symbols": ["database$subexpression$1"], "postprocess": ([[g, _, d]]) => "[database " + g + ", " + d + "]"},
    {"name": "game", "symbols": ["tagsection", "_", "movetextsection"], "postprocess": ([ts, _1, mt]) => "[game " +  ts + "," + mt + "]"},
    {"name": "tagsection", "symbols": []},
    {"name": "tagsection$subexpression$1", "symbols": ["tagpair", "__", "tagsection"]},
    {"name": "tagsection", "symbols": ["tagsection$subexpression$1"], "postprocess": ([[tp, _, ts]]) => "[tagsection " + tp + ", " + ts + "]"},
    {"name": "tagpair", "symbols": [(lexer.has("LBRACKET") ? {type: "LBRACKET"} : LBRACKET), "_", "tagname", "__", "tagvalue", "_", (lexer.has("RBRACKET") ? {type: "RBRACKET"} : RBRACKET)], "postprocess": ([_1, _2, tn, _3, tv]) => "[tagpair " + tn + "," + tv + "]"},
    {"name": "tagname", "symbols": [(lexer.has("SYMBOL") ? {type: "SYMBOL"} : SYMBOL)], "postprocess": ([tn]) => "[tagname " + tn + "]"},
    {"name": "tagvalue", "symbols": [(lexer.has("STRING") ? {type: "STRING"} : STRING)], "postprocess": ([tv]) => "[tagvalue " + tv + "]"},
    {"name": "movetextsection", "symbols": ["elementsequence", "gametermination"], "postprocess": ([es, gt]) => "[movetextsection " + es + ", " + gt + "]"},
    {"name": "elementsequence", "symbols": []},
    {"name": "elementsequence$subexpression$1$subexpression$1", "symbols": ["element"]},
    {"name": "elementsequence$subexpression$1$subexpression$1", "symbols": ["recursivevariation"]},
    {"name": "elementsequence$subexpression$1", "symbols": ["elementsequence$subexpression$1$subexpression$1", "__", "elementsequence"]},
    {"name": "elementsequence", "symbols": ["elementsequence$subexpression$1"], "postprocess": ([[el, _, es]]) => "[elementsequence " + el + ", " + es + "]"},
    {"name": "element", "symbols": ["movenumber"]},
    {"name": "element", "symbols": ["dotdotdot"]},
    {"name": "element", "symbols": ["sanmove"]},
    {"name": "element", "symbols": ["numericannotationglyph"]},
    {"name": "element", "symbols": ["comment"], "postprocess": ([el]) => "[element " + el + "]"},
    {"name": "movenumber$subexpression$1", "symbols": [(lexer.has("PERIOD") ? {type: "PERIOD"} : PERIOD)]},
    {"name": "movenumber$subexpression$1", "symbols": [(lexer.has("DOTDOTDOT") ? {type: "DOTDOTDOT"} : DOTDOTDOT)]},
    {"name": "movenumber", "symbols": [(lexer.has("INTEGER") ? {type: "INTEGER"} : INTEGER), "movenumber$subexpression$1"], "postprocess": ([mn]) => "[movenumber " + mn + "]"},
    {"name": "dotdotdot", "symbols": [(lexer.has("DOTDOTDOT") ? {type: "DOTDOTDOT"} : DOTDOTDOT)], "postprocess": () => "[..." + "]"},
    {"name": "sanmove", "symbols": [(lexer.has("SAN") ? {type: "SAN"} : SAN)], "postprocess": ([sm]) => "[sanmove " + sm + "]"},
    {"name": "numericannotationglyph", "symbols": [(lexer.has("NAG") ? {type: "NAG"} : NAG)], "postprocess": (nag) => "[nag " + nag + "]"},
    {"name": "comment$subexpression$1", "symbols": [(lexer.has("COMMENT1") ? {type: "COMMENT1"} : COMMENT1)]},
    {"name": "comment$subexpression$1", "symbols": [(lexer.has("COMMENT2") ? {type: "COMMENT2"} : COMMENT2)]},
    {"name": "comment", "symbols": ["comment$subexpression$1"], "postprocess": ([c]) => "[comment " + c + "]"},
    {"name": "recursivevariation", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "_", "elementsequence", "_", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess": ([_1, _2, es]) => "[recurivevariation " + es + "]"},
    {"name": "gametermination", "symbols": [(lexer.has("RESULT") ? {type: "RESULT"} : RESULT)], "postprocess": ([rl]) => "[result " + rl + "]"},
    {"name": "_$ebnf$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => "^"},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": () => "+"}
]
  , ParserStart: "database"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
