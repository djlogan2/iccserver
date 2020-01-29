import { Mongo } from "meteor/mongo";
import { Game } from "../../server/Game";
const PGNListener = require("./PGNListener");
const GameCollection = new Mongo.Collection("imported_games");

function removeOuterQuotes(str) {
  if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"')
    return str.substr(1, str.length - 2);
  else return str;
}

const NodePGNListener = function(userId) {
  this.userId = userId;
  PGNListener.PGNListener.call(this);
  return this;
};

NodePGNListener.prototype = Object.create(PGNListener.PGNListener.prototype);
NodePGNListener.prototype.constructor = NodePGNListener;

NodePGNListener.prototype.enterPgn_game = function(ctx) {
  this.currentgame = {
    owner: this.userId,
    startTime: new Date(),
    white: { name: "unknown", rating: 1600 },
    black: { name: "unknown", rating: 1600 },
    result: "*"
  };
};

NodePGNListener.prototype.exitPgn_game = function(ctx) {
  GameCollection.insert(this.currentgame);
  delete this.currentgame;
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

// NodePGNListener.prototype.enterRecursive_variation = function(ctx) {
//   console.log("here");
// };

NodePGNListener.prototype.exitRecursive_variation = function(ctx) {
  console.log("here");
};

NodePGNListener.prototype.exitGame_termination = function(ctx) {
  this.currentgame.result = removeOuterQuotes(ctx.getText());
};

exports.NodePGNListener = NodePGNListener;
