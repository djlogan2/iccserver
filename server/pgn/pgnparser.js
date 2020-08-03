import { Logger } from "../../lib/server/Logger";
import moo from "moo";
//const moo = require("moo");

const log = new Logger("server/pgnparser_js");

const debug = Meteor.bindEnvironment((message, data) => log.debug(message, data));
//const //debug = console.log;

export class Parser {
  constructor() {
    this.lexer = moo.states({
      notcomment: {
        WS: /[ \t]+/,
        STRING: /"(?:\\["\\]|[^\n"\\])*"/,
        NAG: /\$[0-9]+/,
        RESULT: ["0-1", "1-0", "1/2-1/2", "*"],
        INTEGER: /[0-9]+/,
        DOTDOTDOT: /\.\.\./,
        PERIOD: /\./,
        LBRACKET: /\[/,
        RBRACKET: /]/,
        LPAREN: /\(/,
        RPAREN: /\)/,
        LBRACE: { match: /{/, push: "comment1" },
        SEMICOLON: { match: /;/, push: "comment2" },
        SAN: /(?:(?:[RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[RQBN])?)|O-O(?:-O)?)[+#]?/,
        SYMBOL: /[a-zA-Z0-9_]+/,
        NL: { match: /\r?\n/, lineBreaks: true }
      },
      comment1: {
        C1: { match: /.*?}/, pop: 1 },
        C1NL: { match: /.*?\r?\n/, lineBreaks: true }
      },
      comment2: {
        C2: { match: /.*?\r?\n/, lineBreaks: true, pop: 1 }
      }
    });
    this.info = null;
    this.line = 1;
    this.state = this.game;
  }

  feed(chunk) {
    // eslint-disable-next-line no-control-regex
    //if (chunk.length > 32) debug(chunk.substr(0, 16) + " ... " + chunk.substr(chunk.length - 16));
    //else debug(chunk);
    this.lexer.reset(chunk.replace(/[^\x00-\x7F]/g, " "), this.info);
    this.info = this.lexer.save();
    let token;
    while ((token = this.lexer.next()) !== undefined) {
      if (token.type === "NL") {
        this.line++;
        continue;
      }
      if (token.type === "WS") continue;
      this.state.call(this, token);
    }
  }

  error(msg, token) {
    const m =
      msg +
      " on line " +
      this.line +
      " offset " +
      token.offset +
      ", token=" +
      token.type +
      ", value='" +
      token.value +
      "'";
    const e = new Error(m);
    e.token = token;
    throw e;
  }

  game(token) {
    //debug("game token=" + token.type + ", text=" + token.text);
    if (token.type === "LBRACKET") {
      this.state = this.tagname;
      this.gameobject = { tags: {}, variations: { movelist: [{}] } };
      this.cmi = 0;
    } else this.error("Expecting start of game (that is, a left bracket '[')", token);
  }

  tagname(token) {
    //debug("tagname token=" + token.type + ", text=" + token.text);
    if (token.type === "SYMBOL") {
      this._tagname = token.value;
      this.state = this.tagvalue;
    } else this.error("Expecting a tagname", token);
  }

  tagvalue(token) {
    //debug("tagvalue token=" + token.type + ", text=" + token.text);
    if (token.type === "STRING") {
      this.gameobject.tags[this._tagname] = token.value.slice(1, token.value.length - 1);
      this.state = this.endtag;
    } else this.error("Expecting tag value", token);
  }

  endtag(token) {
    //debug("endtag token=" + token.type + ", text=" + token.text);
    if (token.type === "RBRACKET") {
      this.state = this.nexttag;
    } else this.error("Expecting a right bracket", token);
  }

  nexttag(token) {
    //debug("nexttag token=" + token.type + ", text=" + token.text);
    switch (token.type) {
      case "LBRACKET":
        this.state = this.tagname;
        break;
      case "INTEGER":
        this.state = this.movenumber;
        break;
      case "RESULT":
        this.savegame(token.value);
        break;
      default:
        this.error("Expecting a '[', a move number, or game result", token);
    }
  }

  variationstart(token) {
    //debug("variationstart token=" + token.type + ", text=" + token.text);
    switch (token.type) {
      case "INTEGER":
        this.state = this.movenumber;
        return;
      case "PERIOD":
      case "DOTDOTDOT":
        this.state = this.san;
        return;
      default:
        this.error("Expected a move number or periods", token);
    }
  }

  movenumber(token) {
    //debug("movenumber token=" + token.type + ", text=" + token.text);
    if (token.type === "PERIOD" || token.type === "DOTDOTDOT") {
      this.state = this.san;
    } else this.error("Expecting a PERIOD (.)", token);
  }

  san(token) {
    //debug("san token=" + token.type + ", text=" + token.text);
    if (token.type === "PERIOD" || token.type === "DOTDOTDOT") return; // Skip "1." "1..." "1. ..." "..." etc.
    if (token.type !== "SAN") this.error("Expecting periods or a SAN move", token);
    if (!this.gameobject.variations.movelist[this.cmi].variations)
      this.gameobject.variations.movelist[this.cmi].variations = [];
    this.gameobject.variations.movelist[this.cmi].variations.push(
      this.gameobject.variations.movelist.length
    );
    this.gameobject.variations.movelist.push({ move: token.value, prev: this.cmi });
    this.cmi = this.gameobject.variations.movelist.length - 1;
    this.state = this.nag;
  }

  nag(token) {
    //debug("nag token=" + token.type + ", text=" + token.text);
    if (token.type === "NAG") {
      this.gameobject.variations.movelist[this.cmi].nag = token.value;
    } else this.comment(token);
  }

  comment(token) {
    //debug("comment token=" + token.type + ", text=" + token.text);
    if (token.type === "LBRACE" || token.type === "SEMICOLON") {
      this.state = this.commenttext;
      this.gameobject.variations.movelist[this.cmi].comment = "";
    } else this.recursive(token);
  }

  commenttext(token) {
    //debug("commenttext token=" + token.type + ", text=" + token.text);
    switch (token.type) {
      case "C1NL":
        this.gameobject.variations.movelist[this.cmi].comment += token.value;
        return;
      case "C1":
        this.gameobject.variations.movelist[this.cmi].comment += token.value.substring(
          0,
          token.value.length - 1
        );
        this.state = this.nag;
        return;
      case "C2":
        this.gameobject.variations.movelist[this.cmi].comment += token.value.replace(/\r?\n/, "");
        this.state = this.nag;
        return;
      default:
        throw new Error("What is the correct thing to do here?");
    }
  }

  recursive(token) {
    //debug("recursive token=" + token.type + ", text=" + token.text);
    switch (token.type) {
      case "LPAREN":
        this.state = this.variationstart;
        if (this.nested_variations === undefined) this.nested_variations = [];
        this.nested_variations.push(this.cmi);
        this.cmi = this.gameobject.variations.movelist[this.cmi].prev;
        break;
      case "RPAREN":
        this.cmi = this.nested_variations.pop();
        this.state = this.nag;
        break;
      case "INTEGER":
        this.state = this.movenumber;
        break;
      case "RESULT":
        this.savegame(token.value);
        break;
      case "SAN":
        this.san(token);
        break;
      default:
        this.error("Expected a variation, move number, result, or san", token);
    }
  }

  savegame(result) {
    //debug("savegame result=" + result);
    this.gameobject.result = result;
    this.gameobject.white = { name: "?", rating: 1600 };
    this.gameobject.black = { name: "?", rating: 1600 };

    for (let tag in this.gameobject.tags) {
      switch (tag) {
        case "White":
          this.gameobject.white.name = this.gameobject.tags[tag];
          break;
        case "Black":
          this.gameobject.black.name = this.gameobject.tags[tag];
          break;
        case "Result":
          this.gameobject.result = this.gameobject.tags[tag];
          break;
        case "WhiteUSCF":
        case "WhiteElo":
          this.gameobject.white.rating = parseInt(this.gameobject.tags[tag]);
          break;
        case "BlackUSCF":
        case "BlackElo":
          this.gameobject.black.rating = parseInt(this.gameobject.tags[tag]);
          break;
        default:
          break;
      }
    }

    if (!this.gamelist) this.gamelist = [];
    this.gamelist.push(this.gameobject);
    delete this.gameobject;
    this.state = this.game;
  }
}
