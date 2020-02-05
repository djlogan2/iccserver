import { Mongo } from "meteor/mongo";
import { GameHistorySchema } from "./GameHistorySchema";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { Logger } from "../lib/server/Logger";
import Chess from "chess.js";
import { Users } from "../imports/collections/users";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { Game } from "./Game";

let log = new Logger("server/GameHistroy_js");
export const GameHistory = {};

const GameHistoryCollection = new Mongo.Collection("game_history");
GameHistoryCollection.attachSchema(GameHistorySchema);

GameHistory.savePlayedGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = Game.findById(game_id);
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to save game to game history",
      "Unable to find game to save"
    );
  return GameHistoryCollection.insert(game);
};
//TODO: we can't figure out this.
//Game.savePlayedGame = GameHistory.savePlayedGame;

GameHistory.examineGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const self = Meteor.user();
  check(self, Object);

  const hist = GameHistoryCollection.findOne({ _id: game_id });
  if (!hist)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to examine saved game",
      "Unable to find game"
    );

  if (Game.isPlayingGame(self._id)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  Game.localUnobserveAllGames(message_identifier, self._id);

  const chess = new Chess.Chess();
  if (hist.tags && hist.tags.FEN) {
    hist.fen = hist.tags.FEN;
    if (!chess.loadfen(hist.tags.FEN))
      throw new ICCMeteorError(
        message_identifier,
        "Unable to examine saved game",
        "FEN string is invalid"
      );
  } else {
    hist.fen = chess.fen();
  }

  delete hist._id;
  hist.tomove = chess.turn() === "w" ? "white" : "black";
  hist.status = "examining";
  hist.observers = [{ id: self._id, username: self.username }];
  hist.examiners = [{ id: self._id, username: self.username }];
  hist.variations.cmi = 0;
  return Game.startLocalExaminedGameWithObject(hist, chess);
};

GameHistory.search = function(message_identifier, search_parameters, offset, count) {
  const self = Meteor.user();
  check(self, Object);
  check(search_parameters, Object);
  check(offset, Number);
  check(count, Number);
  if (!Users.isAuthorized(self, "search_game_history"))
    throw new ICCMeteorError(message_identifier, "Unable to search games", "User not authorized");
  if (count > SystemConfiguration.maximumGameHistorySearchCount())
    count = SystemConfiguration.maximumGameHistorySearchCount();
  // TODO: Do we want to leave search_parameters wide open? I can't think of a reason why not other than it's often inherently dangerous for reasons only hackers show you about... (djl)
  return GameHistoryCollection.find(search_parameters, { skip: offset, limit: count });
};

Meteor.methods({
  searchGameHistory: GameHistory.search,
  examineGame: GameHistory.examineGame
});

Meteor.publish("game_history", function() {
  return GameHistoryCollection.find({
    $or: [{ "white.id": this.userId }, { "black.id": this.userId }]
  });
});

if (Meteor.isTest || Meteor.isAppTest) {
  GameHistory.collection = GameHistoryCollection;
}
