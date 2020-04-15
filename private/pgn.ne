@{%
    const lexer = require("./pgnlexer.js").lexer;
 %}

@lexer lexer

database -> null | (game __ database) {% ([[g, _, d]]) => "[database " + g + ", " + d + "]" %}

game -> tagsection __ movetextsection {% ([ts, _1, mt]) => {
console.log("[game " +  ts + "," + mt + "]");
} %}

tagsection -> null | (tagpair __ tagsection) {% ([[tp, _, ts]]) => {
                            const tags = Array.isArray(ts) ? {} : ts;
                            tags[tp[0]] = tp[1];
                            return tags;
} %}

tagpair -> %LBRACKET _ tagname __ tagvalue _ %RBRACKET {% ([_1, _2, tn, _3, tv]) => [tn, tv] %}

tagname -> %SYMBOL {% ([tn]) => tn.value %}

tagvalue -> %STRING {% ([tv]) => tv.value %}

movetextsection -> elementsequence gametermination {% ([es, gt]) => "[movetextsection " + es + ", " + gt + "]" %}

elementsequence -> null | ((element | recursivevariation) __ elementsequence) {% ([[[[[what, value]]], _, es]]) => {
                const game = Array.isArray(es) ? {} : es;
                game[what] = value;
                return game;
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

comment -> (%COMMENT1 | %COMMENT2) {% ([[c]]) => {
        if(c.type === "COMMENT1")
            return ["comment", c.value.slice(1,c.value.length - 1)];
        else
            return ["comment", c.value];
    }
%}

recursivevariation -> %LPAREN _ elementsequence _ %RPAREN {% ([_1, _2, es]) =>
                            {
                            console.log("[recurivevariation " + es + "]");
                            return es;
                            }
%}

gametermination -> %RESULT {% ([rl]) => "[result " + rl + "]" %}

_ -> %WS:? {% () => "^" %}
__ => %WS:+ {% () => "+" %}
