import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Random } from "meteor/random";
import { Game } from "../../server/Game";

const PGNListener = require("./PGNListener");
const GameCollection = new Mongo.Collection("imported_games");

function removeOuterQuotes(str) {
  if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"')
    return str.substr(1, str.length - 2);
  else return str;
}

function removeOuterBrackets(str) {
  if (str.charAt(0) === "{" && str.charAt(str.length - 1) === "}")
    return str.substr(1, str.length - 2);
  else return str;
}

const NodePGNListener = function(userId, callback) {
  this.callback = callback;
  this.userId = userId;
  PGNListener.PGNListener.call(this);
  this.gamelist = [];
  this.fileTimingStart = new Date().getTime();
  this.gameCount = 0;
  return this;
};

NodePGNListener.prototype = Object.create(PGNListener.PGNListener.prototype);
NodePGNListener.prototype.constructor = NodePGNListener;

NodePGNListener.prototype.exitPgn_database = function(ctx) {
  if (this.gamelist.length) GameCollection.rawCollection().insert(this.gamelist);
  if (this.callback && typeof this.callback === "function") this.callback();
  const inter = new Date().getTime();
  const timing = inter - this.fileTimingStart;
  console.log(this.gameCount + " games done in " + timing + "ms, average " + timing / this.gameCount + "ms/game");
};

NodePGNListener.prototype.enterPgn_game = function(ctx) {
  this.gameTimingStart = new Date().getTime();
  this.currentgame = {
    _id: Random.id(),
    owner: this.userId,
    startTime: new Date(),
    white: { name: "unknown", rating: 1600 },
    black: { name: "unknown", rating: 1600 },
    result: "*"
  };
};

NodePGNListener.prototype.exitPgn_game = function(ctx) {
  this.gameCount++;
  if (!!this.currentgame.variations)
    this.currentgame.variations.movelist.forEach(ml => {
      if (ml.variations && ml.variations.length > 1) ml.variations = ml.variations.reverse();
    });

  this.gamelist.push(this.currentgame);
  delete this.currentgame;
  this.currentgame = {};

  if (this.gamelist.length === 1000) {
    //const result = Meteor.wrapAsync(GameCollection.rawCollection().insertMany)(this.gamelist);
    const inter = new Date().getTime();
    const timing = inter - this.fileTimingStart;
    const gameTime = inter - this.gameTimingStart;
    console.log(this.gameCount + " games done in " + timing + "ms, average " + timing / this.gameCount + "ms/game, this game took " + gameTime + "ms");
    delete this.gamelist;
    this.gamelist = [];
  }
};

NodePGNListener.prototype.exitTag_pair = function(ctx) {
  const tag = removeOuterQuotes(ctx.tag_name().getText());
  const value = removeOuterQuotes(ctx.tag_value().getText());
  switch (tag) {
    case "Date":
      this.currentgame.startTime = Date.parse(value);
      return;
    case "White":
      this.currentgame.white.name = value;
      return;
    case "Black":
      this.currentgame.black.name = value;
      return;
    case "Result":
      this.currentgame.result = value;
      return;
    case "WhiteUSCF":
    case "WhiteElo":
      this.currentgame.white.rating = parseInt(value);
      return;
    case "BlackUSCF":
    case "BlackElo":
      this.currentgame.black.rating = parseInt(value);
      return;
    default:
      break;
  }
  if (this.currentgame.tags === undefined) this.currentgame.tags = {};
  this.currentgame.tags[tag] = value;
};

NodePGNListener.prototype.exitSan_move = function(ctx) {
  const move = ctx.getText();
  if (this.currentgame.variations === undefined)
    this.currentgame.variations = { cmi: 0, movelist: [{}] };
  Game.addMoveToMoveList(this.currentgame.variations, move, null);
};

NodePGNListener.prototype.exitBrace_comment = function(ctx) {
  this.currentgame.variations.movelist[
    this.currentgame.variations.cmi
  ].comment = removeOuterBrackets(ctx.getText());
};

NodePGNListener.prototype.exitNumeric_annotation_glyph = function(ctx) {
  this.currentgame.variations.movelist[this.currentgame.variations.cmi].nag = ctx.getText();
};

NodePGNListener.prototype.enterRecursive_variation = function(ctx) {
  if (this.cmi === undefined) this.cmi = [];
  this.cmi.push(this.currentgame.variations.cmi);
  this.currentgame.variations.cmi = this.currentgame.variations.movelist[
    this.currentgame.variations.cmi
  ].prev;
};

NodePGNListener.prototype.exitRecursive_variation = function(ctx) {
  this.currentgame.variations.cmi = this.cmi.pop();
};

NodePGNListener.prototype.exitGame_termination = function(ctx) {
  this.currentgame.result = removeOuterQuotes(ctx.getText());
};

exports.NodePGNListener = NodePGNListener;
