@{%
    const lexer = require("./pgnlexer.js").lexer;
    function join(array) {
    console.log("array=" + array);
        if(!array || !array.length) return "{}";
        return "{" + array.join(",") + "}";
    }
 %}

@lexer lexer

database -> null | (game _ database) {% ([[g, _, d]]) => "[database " + g + ", " + d + "]" %}

game -> tagsection _ movetextsection {% ([ts, _1, mt]) => "[game " +  ts + "," + mt + "]" %}

tagsection -> null | (tagpair __ tagsection) {% ([[tp, _, ts]]) => "[tagsection " + tp + ", " + ts + "]" %}

tagpair -> %LBRACKET _ tagname __ tagvalue _ %RBRACKET {% ([_1, _2, tn, _3, tv]) => "[tagpair " + tn + "," + tv + "]" %}

tagname -> %SYMBOL {% ([tn]) => "[tagname " + tn + "]" %}

tagvalue -> %STRING {% ([tv]) => "[tagvalue " + tv + "]" %}

movetextsection -> elementsequence gametermination {% ([es, gt]) => "[movetextsection " + es + ", " + gt + "]" %}

elementsequence -> null | ((element | recursivevariation) __ elementsequence) {% ([[el, _, es]]) => "[elementsequence " + el + ", " + es + "]" %}

element -> movenumber | dotdotdot | sanmove | numericannotationglyph | comment {% ([el]) => "[element " + el + "]" %}

movenumber -> %INTEGER (%PERIOD | %DOTDOTDOT) {% ([mn]) => "[movenumber " + mn + "]" %}

dotdotdot -> %DOTDOTDOT {% () => "[..." + "]" %}

sanmove -> %SAN {% ([sm]) => "[sanmove " + sm + "]" %}

numericannotationglyph -> %NAG {% (nag) => "[nag " + nag + "]" %}

comment -> (%COMMENT1 | %COMMENT2) {% ([c]) => "[comment " + c + "]" %}

recursivevariation -> %LPAREN _ elementsequence _ %RPAREN {% ([_1, _2, es]) => "[recurivevariation " + es + "]" %}

gametermination -> %RESULT {% ([rl]) => "[result " + rl + "]" %}

_ -> %WS:? {% () => "^" %}
__ => %WS:+ {% () => "+" %}
