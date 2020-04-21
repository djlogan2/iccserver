@{%
    const lexer = require("./pgnlexer.js").lexer;
    const saver = require("./saveimportedgames.js").save;
 %}

@lexer lexer

database -> null | (game __ database) {% () => null %}

game -> tagsection __ movetextsection {% ([ts, _1, game]) => {
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
    //GameCollection.insert(game);
    return null;
} %}

tagsection -> null | (tagpair __ tagsection) {% ([[tp, _, ts]]) => {
                            const tags = Array.isArray(ts) ? {} : ts;
                            tags[tp[0]] = tp[1];
                            return tags;
} %}

tagpair -> %LBRACKET _ tagname __ tagvalue _ %RBRACKET {% ([_1, _2, tn, _3, tv]) => [tn, tv] %}

tagname -> %SYMBOL {% ([tn]) => tn.value %}

tagvalue -> %STRING {% ([tv]) => tv.value.slice(1,tv.value.length - 1) %}

movetextsection -> elementsequence gametermination {% ([es, gt]) => {
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
} %}

elementsequence -> ((element | recursivevariation) __ elementsequence):? {% (param) => {
                const [[[el_or_rv], _, es]] = param;
                es.push(el_or_rv);
                return es;
                }
%}

element -> movenumber | dotdotdot | sanmove | numericannotationglyph | comment {% ([el]) => {
    return el;
} %}

movenumber -> %INTEGER (%PERIOD | %DOTDOTDOT) {% ([mn]) => {return ["movenumber", mn.value];} %}

dotdotdot -> %DOTDOTDOT {% () => {return ["movenumber", "..."];} %}

sanmove -> %SAN {% ([sm]) => {
return ["move", sm.value];
} %}

numericannotationglyph -> %NAG {% (nag) => {return ["nag", nag.value];} %}

comment -> %COMMENT1 {% ([c]) => {
        if(c.type === "COMMENT1")
            return [["comment", c.value.slice(1,c.value.length - 1)]];
        else
            return [["comment", c.value]];
    }
%}

recursivevariation -> %LPAREN _ elementsequence _ %RPAREN {% ([_1, _2, es]) =>
                            {
                            console.log("[recurivevariation " + es + "]");
                            return es;
                            }
%}

gametermination -> %RESULT {% ([rl]) => rl.value %}

_ => ws:* {% () => null %}
__ => ws _ {% () => null %}
ws -> (%WS | %NL) {% () => null %}
