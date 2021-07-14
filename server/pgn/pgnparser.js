import { Logger } from "../../lib/server/Logger";
import moo from "moo";
import date from "date-and-time";

const log = new Logger("server/pgnparser_js");

export class Parser {
  constructor() {
    this.debug = [];
    this.lexer = moo.states({
      notcomment: {
        WS: /[ \t]+/,
        STRING: /"(?:\\["\\]|[^\n"])*"/,
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
        NL: { match: /\r?\n/, lineBreaks: true },
      },
      comment1: {
        C1: { match: /.*?}/, pop: 1 },
        C1NL: { match: /.*?\r?\n/, lineBreaks: true },
      },
      comment2: {
        C2: { match: /.*?\r?\n/, lineBreaks: true, pop: 1 },
      },
    });
    this.info = null;
    this.line = 1;
    this.nl = 0;
    this.state = this.game;
  }

  pushdebug(name, type, value) {
    if (this.debug.length >= 100) this.debug.shift();
    this.debug.push([name, type, value]);
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
        this.nl++;
        continue;
      }
      if (token.type === "WS") continue;
      this.state.call(this, token);
      this.nl = 0;
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
    this.debug.forEach((step) => {
      log.error("parse failed, steps: " + step[0] + " token=" + step[1] + ", value=" + step[2]);
    });
    throw e;
  }

  game(token) {
    this.pushdebug("game", token.type, token.text);
    if (token.type === "LBRACKET") {
      this.state = this.tagname;
      this.gameobject = { tags: {}, variations: { movelist: [{}] } };
      this.cmi = 0;
    } else this.error("Expecting start of game (that is, a left bracket '[')", token);
  }

  tagname(token) {
    this.pushdebug("tagname", token.type, token.text);
    if (token.type === "SYMBOL") {
      this._tagname = token.value;
      this.state = this.tagvalue;
    } else this.error("Expecting a tagname", token);
  }

  tagvalue(token) {
    this.pushdebug("tagvalue", token.type, token.text);
    if (token.type === "STRING") {
      this.gameobject.tags[this._tagname] = token.value.slice(1, token.value.length - 1);
      this.state = this.endtag;
    } else this.error("Expecting tag value", token);
  }

  endtag(token) {
    this.pushdebug("endtag", token.type, token.text);
    if (token.type === "RBRACKET") {
      this.state = this.nexttag;
    } else this.error("Expecting a right bracket", token);
  }

  nexttag(token) {
    this.pushdebug("nexttag", token.type, token.text);

    switch (token.type) {
      case "LBRACKET":
        // Special code to handle a game with  no moves, and no result
        if (this.nl === 2) {
          this.savegame("*");
          this.game(token);
        }
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
    this.pushdebug("variationstart", token.type, token.text);
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
    this.pushdebug("movenumber", token.type, token.text);
    if (token.type === "PERIOD" || token.type === "DOTDOTDOT") {
      this.state = this.san;
    } else this.error("Expecting a PERIOD (.)", token);
  }

  san(token) {
    this.pushdebug("san", token.type, token.text);
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
    this.pushdebug("nag", token.type, token.text);
    if (token.type === "NAG") {
      this.gameobject.variations.movelist[this.cmi].nag = token.value;
    } else this.comment(token);
  }

  comment(token) {
    this.pushdebug("comment", token.type, token.text);
    if (token.type === "LBRACE" || token.type === "SEMICOLON") {
      this.state = this.commenttext;
      this.gameobject.variations.movelist[this.cmi].comment = "";
    } else this.recursive(token);
  }

  commenttext(token) {
    this.pushdebug("commenttext", token.type, token.text);
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
    this.pushdebug("recursive", token.type, token.text);
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
    this.pushdebug("savegame", null, result);
    this.gameobject.result = result;
    this.gameobject.white = { name: "?", rating: 1600 };
    this.gameobject.black = { name: "?", rating: 1600 };

    for (let tag in this.gameobject.tags) {
      switch (tag) {
        case "White":
          this.gameobject.white.name = this.gameobject.tags[tag];
          delete this.gameobject.tags.White;
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
        case "Date":
          const newdate = date.parse(this.gameobject.tags[tag], "YYYY.DD.MM");
          if (!this.gameobject.startTime) this.gameobject.startTime = newdate;
          else {
            this.gameobject.startTime.setFullYear(newdate.getFullYear());
            this.gameobject.setMonth(newdate.getMonth());
            this.gameobject.setDate(newdate.getDate());
          }
          break;
        case "Time":
          const newtime = date.parse(this.gameobject.tags[tag], "hh.mm.ss");
          if (!this.gameobject.startTime) {
            this.gameobject.startTime = newtime;
          } else {
            this.gameobject.startTime.setHours(newtime.getHours());
            this.gameobject.startTime.setMinutes(newtime.getMinutes());
            this.gameobject.startTime.setSeconds(newtime.getSeconds());
            this.gameobject.startTime.setMilliseconds(0);
          }
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
