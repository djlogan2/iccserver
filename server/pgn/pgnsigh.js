import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
const moo = require("moo");

export const ImportedGameCollection = new Mongo.Collection("imported_games");

export function Parser() {
  this.x = "y";
  this.lexer = moo.compile({
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
    SAN: /(?:(?:[RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[RQBN])?)|O-O(?:-O)?)[+#]?/,
    SYMBOL: /[a-zA-Z0-9_]+/,
    COMMENT1: /{.*?}/,
    NL: { match: /\r?\n/, lineBreaks: true }
  });
  this.info = null;
  this.line = 1;
  this.state = this.game;

  if (Meteor.isTest || Meteor.isAppTest) {
    this.collection = ImportedGameCollection;
  }
}
Meteor.publish("imported_games", function() {
  return ImportedGameCollection.find({}
    
  );
});
Parser.prototype.feed = function(chunk) {
  this.lexer.reset(chunk, this.info);
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
};

Parser.prototype.error = function(msg, token) {
  const m =
    msg +
    " on line " +
    token.line +
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
};

Parser.prototype.game = function(token) {
  if (token.type === "LBRACKET") {
    this.state = this.tagname;
    this.gameobject = { tags: {}, variations: { movelist: [{}] } };
    this.cmi = 0;
  } else this.error("Expecting start of game (that is, a left bracket '[')", token);
};

Parser.prototype.tagname = function(token) {
  if (token.type === "SYMBOL") {
    this._tagname = token.value;
    this.state = this.tagvalue;
  } else this.error("Expecting a tagname", token);
};

Parser.prototype.tagvalue = function(token) {
  if (token.type === "STRING") {
    this.gameobject.tags[this._tagname] = token.value;
    this.state = this.endtag;
  } else this.error("Expecting tag value", token);
};

Parser.prototype.endtag = function(token) {
  if (token.type === "RBRACKET") {
    this.state = this.nexttag;
  } else this.error("Expecting a right bracket", token);
};

Parser.prototype.nexttag = function(token) {
  switch (token.type) {
    case "LBRACKET":
      this.state = this.tagname;
      break;
    case "INTEGER":
      this.state = this.movenumber;
      break;
    case "RESULT":
      return this.savegame(token.value);
    default:
      this.error("Expecting a '[', a move number, or game result", token);
  }
};

Parser.prototype.variationstart = function(token) {
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
};

Parser.prototype.movenumber = function(token) {
  if (token.type === "PERIOD" || token.type === "DOTDOTDOT") {
    this.state = this.san;
  } else this.error("Expecting a PERIOD (.)", token);
};

Parser.prototype.san = function(token) {
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
};

Parser.prototype.nag = function(token) {
  if (token.type === "NAG") {
    this.gameobject.variations.movelist[this.cmi].nag = token.value;
  } else this.comment(token);
};

Parser.prototype.comment = function(token) {
  if (token.type === "COMMENT1") {
    this.gameobject.variations.movelist[this.cmi].comment = token.value;
  } else this.recursive(token);
};

Parser.prototype.recursive = function(token) {
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
      return this.savegame(token.value);
    case "SAN":
      return this.san(token);
    default:
      this.error("Expected a variation, move number, result, or san", token);
  }
};

Parser.prototype.savegame = function(result) {
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

  GameCollection.insert(this.gameobject);
  delete this.gameobject;
  this.state = this.game;
};
