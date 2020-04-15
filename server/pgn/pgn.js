// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const lexer = require("./pgnlexer.js").lexer;
    const saver = require("./saveimportedgames.js").save;
 var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "database", "symbols": []},
    {"name": "database$subexpression$1", "symbols": ["game", "__", "database"]},
    {"name": "database", "symbols": ["database$subexpression$1"], "postprocess": ([[g, _, d]]) => "[database " + g + ", " + d + "]"},
    {"name": "game", "symbols": ["tagsection", "__", "movetextsection"], "postprocess":  ([ts, _1, game]) => {
            game.tags = ts;
            game.white = {name: "?", rating: 1600};
            game.black = {name: "?", rating: 1600};
        
            for(let tag in ts) {
              switch (tag) {
                case "White":
                  game.white.name = ts[tag];
                  break;
                case "Black":
                    game.black.name = ts[tag];
                  break;
                case "Result":
                    game.result = ts[tag];
                  break;
                case "WhiteUSCF":
                case "WhiteElo":
                    game.white.rating =  parseInt(ts[tag]);
                  break;
                case "BlackUSCF":
                case "BlackElo":
                  game.black.rating = parseInt(ts[tag]);
                  break;
                default:
                  break;
              }
            }
        
            saver(game);
            return null;
        } },
    {"name": "tagsection", "symbols": []},
    {"name": "tagsection$subexpression$1", "symbols": ["tagpair", "__", "tagsection"]},
    {"name": "tagsection", "symbols": ["tagsection$subexpression$1"], "postprocess":  ([[tp, _, ts]]) => {
                                    const tags = Array.isArray(ts) ? {} : ts;
                                    tags[tp[0]] = tp[1];
                                    return tags;
        } },
    {"name": "tagpair", "symbols": [(lexer.has("LBRACKET") ? {type: "LBRACKET"} : LBRACKET), "_", "tagname", "__", "tagvalue", "_", (lexer.has("RBRACKET") ? {type: "RBRACKET"} : RBRACKET)], "postprocess": ([_1, _2, tn, _3, tv]) => [tn, tv]},
    {"name": "tagname", "symbols": [(lexer.has("SYMBOL") ? {type: "SYMBOL"} : SYMBOL)], "postprocess": ([tn]) => tn.value},
    {"name": "tagvalue", "symbols": [(lexer.has("STRING") ? {type: "STRING"} : STRING)], "postprocess": ([tv]) => tv.value.slice(1,tv.value.length - 1)},
    {"name": "movetextsection", "symbols": ["elementsequence", "gametermination"], "postprocess":  ([es, gt]) => {
                const movelist = [{}];
                let cmi = 0;
                for(let x = es.length - 1 ; x >= 0 ; x--) {
                    const [what, value] = es[x];
                    switch(what) {
                        case "movenumber":
                            break;
                        case "move":
                            if(!movelist[cmi].variations) movelist[cmi].variations = [];
                            movelist[cmi].variations.push(movelist.length);
                            movelist.push({move: value, prev: cmi});
                            cmi = movelist.length - 1;
                            break;
                        case "nag":
                            movelist[cmi].nag = value;
                            break;
                        case "comment":
                            movelist[cmi].comment = value;
                            break;
                        default:
                            throw new Error("do me");
                            break;
                    }
                }
                const game = {result: gt, variations: {movelist: movelist}};
                return game;
        } },
    {"name": "elementsequence", "symbols": []},
    {"name": "elementsequence$subexpression$1$subexpression$1", "symbols": ["element"]},
    {"name": "elementsequence$subexpression$1$subexpression$1", "symbols": ["recursivevariation"]},
    {"name": "elementsequence$subexpression$1", "symbols": ["elementsequence$subexpression$1$subexpression$1", "__", "elementsequence"]},
    {"name": "elementsequence", "symbols": ["elementsequence$subexpression$1"], "postprocess":  (fuck) => {
        const [[[[el_or_rv]], _, es]] = fuck;
        es.push(el_or_rv);
        return es;
        }
        },
    {"name": "element", "symbols": ["movenumber"]},
    {"name": "element", "symbols": ["dotdotdot"]},
    {"name": "element", "symbols": ["sanmove"]},
    {"name": "element", "symbols": ["numericannotationglyph"]},
    {"name": "element", "symbols": ["comment"], "postprocess":  ([el]) => {
            return el;
        } },
    {"name": "movenumber$subexpression$1", "symbols": [(lexer.has("PERIOD") ? {type: "PERIOD"} : PERIOD)]},
    {"name": "movenumber$subexpression$1", "symbols": [(lexer.has("DOTDOTDOT") ? {type: "DOTDOTDOT"} : DOTDOTDOT)]},
    {"name": "movenumber", "symbols": [(lexer.has("INTEGER") ? {type: "INTEGER"} : INTEGER), "movenumber$subexpression$1"], "postprocess": ([mn]) => {return ["movenumber", mn.value];}},
    {"name": "dotdotdot", "symbols": [(lexer.has("DOTDOTDOT") ? {type: "DOTDOTDOT"} : DOTDOTDOT)], "postprocess": () => {return ["movenumber", "..."];}},
    {"name": "sanmove", "symbols": [(lexer.has("SAN") ? {type: "SAN"} : SAN)], "postprocess":  ([sm]) => {
        return ["move", sm.value];
        } },
    {"name": "numericannotationglyph", "symbols": [(lexer.has("NAG") ? {type: "NAG"} : NAG)], "postprocess": (nag) => {return ["nag", nag.value];}},
    {"name": "comment$subexpression$1", "symbols": [(lexer.has("COMMENT1") ? {type: "COMMENT1"} : COMMENT1)]},
    {"name": "comment$subexpression$1", "symbols": [(lexer.has("COMMENT2") ? {type: "COMMENT2"} : COMMENT2)]},
    {"name": "comment", "symbols": ["comment$subexpression$1"], "postprocess":  ([[c]]) => {
            if(c.type === "COMMENT1")
                return [["comment", c.value.slice(1,c.value.length - 1)]];
            else
                return [["comment", c.value]];
        }
        },
    {"name": "recursivevariation", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "_", "elementsequence", "_", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess":  ([_1, _2, es]) =>
        {
        console.log("[recurivevariation " + es + "]");
        return es;
        }
        },
    {"name": "gametermination", "symbols": [(lexer.has("RESULT") ? {type: "RESULT"} : RESULT)], "postprocess": ([rl]) => rl.value},
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
