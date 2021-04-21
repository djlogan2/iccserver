import _ from "lodash";
import Chess from "chess.js";
import { check, Match } from "meteor/check";
import { Mongo } from "meteor/mongo";
import { Logger } from "../lib/server/Logger";
import { Meteor } from "meteor/meteor";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { PlayedGameSchema } from "./PlayedGameSchema";
import { GameHistorySchema } from "./GameHistorySchema";
import { ExaminedGameSchema } from "./ExaminedGameSchema";
import { LegacyUser } from "../lib/server/LegacyUsers";
import { Timestamp } from "../lib/server/timestamp";
import { TimestampServer } from "../lib/Timestamp";
import { DynamicRatings } from "./DynamicRatings";
import { Users } from "../imports/collections/users";
import { Parser } from "./pgn/pgnparser";
//import { Awsmanager } from "./awsmanager";
import { exportGameObjectToPGN } from "../lib/exportpgn";

export const GameHistory = {};

let active_games = {};
const game_pings = {};
const move_timers = {};

const GameHistoryCollection = new Mongo.Collection("game_history");
export const ImportedGameCollection = new Mongo.Collection("imported_games");
GameHistoryCollection.attachSchema(GameHistorySchema);

const log = new Logger("server/Game_js");
let pinglog = new Logger("server/Game::ping");

class Game {
  constructor() {
    const _self = this;

    this.ecoCollection = new Mongo.Collection("ecocodes");
    this.GameCollection = new Mongo.Collection("game");
    this.GameCollection.attachSchema(ExaminedGameSchema, {
      selector: { status: "examining" }
    });

    this.GameCollection.attachSchema(PlayedGameSchema, {
      selector: { status: "playing" }
    });
    // TODO: Need to adjourn these, not just delete them
    // Meteor.startup(() => _self.GameCollection.remove({}));

    Users.events.on("userLogin", function(fields) {
      const user = Meteor.users.findOne({ _id: fields.userId });
      const owned_game = _self.GameCollection.findOne({ private: true, owner: fields.userId });
      if (!!owned_game) {
        if (!owned_game.examiners.some(ex => ex.id === fields.userId)) {
          const rec = { id: user._id, username: user.username };
          _self.GameCollection.update(
            { _id: owned_game._id, status: owned_game.status },
            { $addToSet: { analysis: rec, examiners: rec, observers: rec } }
          );
        }
      }
      Users.setGameStatus("server", user, _self.getStatusFromGameCollection(fields.userId));
    });

    Users.events.on("userLogout", function(fields) {
      if (_self.getStatusFromGameCollection(fields.userId) === "none") return;

      const doTheLogout = () => {
        _self.localResignAllGames("server", fields.userId, 4);
        _self.localUnobserveAllGames("server", fields.userId, true, true);
        Users.setGameStatus("server", fields.userId, "none");
      };

      if (Meteor.isTest || Meteor.isAppTest || !SystemConfiguration.logoutTimeout()) {
        doTheLogout();
        return;
      }

      const cursor = Meteor.users.find({ _id: fields.userId }).observeChanges({
        changed(id, fields2) {
          if ("status" in fields2 && "online" in fields2.status && fields2.status.online) {
            Meteor.clearInterval(interval);
            cursor.stop();
          }
        }
      });

      const interval = Meteor.setInterval(() => {
        Meteor.clearInterval(interval);
        cursor.stop();
        if (!Meteor.users.find({ _id: fields.userId, "status.online": true }).count())
          doTheLogout();
      }, SystemConfiguration.logoutTimeout());
    });

    if (Meteor.isTest || Meteor.isAppTest) {
      this.collection = _self.GameCollection;
    }

    function gamesWeArePlaying(user) {
      return _self.GameCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            { status: "playing" },
            { $or: [{ "white.id": user._id }, { "black.id": user._id }] }
          ]
        },
        {
          fields: {
            black: 1,
            clocks: 1,
            fen: 1,
            lag: 1,
            observers: 1,
            pending: 1,
            rated: 1,
            rating_type: 1,
            startTime: 1,
            status: 1,
            tomove: 1,
            variations: 1,
            white: 1,
            wild: 1
          }
        }
      );
    }

    function gamesWeOwn(user) {
      return _self.GameCollection.find({ owner: user._id }, { fields: { actions: 0 } });
    }

    function examineWithAnalysis(user) {
      return _self.GameCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            { "observers.id": user._id },
            { owner: { $ne: user._id } },
            {
              $or: [{ status: "playing" }, { private: { $ne: true } }, { "analysis.id": user._id }]
            }
          ]
        },
        {
          fields: {
            deny_chat: 0,
            deny_requests: 0,
            requestors: 0,
            analysis: 0,
            actions: 0
          }
        }
      );
    }

    function examineWithoutAnalysis(user) {
      return _self.GameCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            { "observers.id": user._id },
            { owner: { $ne: user._id } },
            { private: true },
            { "analysis.id": { $ne: user._id } }
          ]
        },
        {
          fields: {
            deny_chat: 0,
            deny_requests: 0,
            requestors: 0,
            computer_variations: 0,
            analysis: 0,
            actions: 0
          }
        }
      );
    }

    function allGames(user) {
      if (user.status.game === "playing") return _self.GameCollection.find({ _id: "none" });
      return _self.GameCollection.find(
        {
          $and: [
            { isolation_group: user.isolation_group },
            {
              $or: [
                { status: "examining" },
                {
                  $and: [{ "white.id": { $ne: user._id } }, { "black.id": { $ne: user._id } }]
                }
              ]
            },
            { "observers.id": { $ne: user._id } },
            { owner: { $ne: user._id } },
            { private: { $ne: true } }
          ]
        },
        {
          fields: {
            startTime: 1,
            result: 1,
            status2: 1,
            private: 1,
            tomove: 1,
            wild: 1,
            rating_type: 1,
            rated: 1,
            status: 1,
            clocks: 1,
            white: 1,
            black: 1
          }
        }
      );
    }

    const attempts = [gamesWeArePlaying, gamesWeOwn, examineWithAnalysis, examineWithoutAnalysis];

    function userRecord() {
      return Meteor.users.find({ _id: this.userId, "status.online": true });
    }

    //
    // OK, since we are currently in a "single game" system, the easy fix to publish/publishComposite
    // not returning record data correctly is to simply assume that there will always be only one
    // record for which we care about, and simply return that.
    //
    Meteor.publishComposite("games", [
      {
        find: userRecord,
        children: [
          {
            find(user) {
              for (let i = 0; i < attempts.length; i++) {
                const cursor = attempts[i](user);
                if (!!cursor.count()) return cursor;
              }
              return _self.GameCollection.find({ _id: "0" });
            }
          }
        ]
      }
    ]);
    /*
    Meteor.publishComposite("games", [
      {
        find: userRecord,
        children: [
          {
            find: gamesWeArePlaying
          }
        ]
      },
      {
        find: userRecord,
        children: [
          {
            find: gamesWeOwn
          }
        ]
      },
      {
        find: userRecord,
        children: [
          {
            find: examineWithAnalysis
          }
        ]
      },
      {
        find: userRecord,
        children: [
          {
            find: examineWithoutAnalysis
          }
        ]
      },
      {
        find: userRecord,
        children: [
          {
            find: allGames
          }
        ]
      }
    ]);
     */
  }

  getAndCheck(self, message_identifier, game_id) {
    check(self, Object);
    check(game_id, String);

    const game = this.GameCollection.findOne({ _id: game_id });

    if (!game) {
      if (self._id !== "computer")
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    if (game.legacy_game_number)
      throw new ICCMeteorError(message_identifier, "Found a legacy game record");

    if (!active_games[game_id]) {
      //
      // Load an initial FEN if there was one
      //
      let fen;
      if (!!game.tags && !!game.tags.FEN) {
        fen = game.tags.FEN;
      }
      active_games[game_id] = new Chess.Chess(fen);

      //
      // Replay all of the moves in the chess object to the current CMI
      //
      const moves = [];
      let cmi = game.variations.cmi;
      while (cmi !== 0) {
        moves.unshift(game.variations.movelist[cmi].move);
        cmi = game.variations.movelist[cmi].prev;
      }
      moves.forEach(move => active_games[game_id].move(move));
      // fen = active_games[game_id].fen();
      // this.collection.update({ _id: game._id, status: game.status }, { $set: { fen: fen } });
    }

    return game;
  }

  addAction(id, action) {
    const game = this.GameCollection.findOne({ _id: id });
    if (!!game)
      this.GameCollection.update({ _id: id, status: game.status }, { $push: { actions: action } });
  }

  startBotGame(
    message_identifier,
    wild_number,
    rating_type,
    white_initial,
    white_increment_or_delay,
    white_increment_or_delay_type,
    black_initial,
    black_increment_or_delay,
    black_increment_or_delay_type,
    color,
    skill_level,
    examined_game_id
  ) {
    return this.startLocalGame(
      message_identifier,
      "computer",
      wild_number,
      rating_type,
      false,
      white_initial,
      white_increment_or_delay,
      white_increment_or_delay_type,
      black_initial,
      black_increment_or_delay,
      black_increment_or_delay_type,
      color,
      skill_level,
      examined_game_id
    );
  }

  startLocalGame(
    message_identifier,
    other_user,
    wild_number,
    rating_type,
    rated,
    white_initial,
    white_increment_or_delay,
    white_increment_or_delay_type,
    black_initial,
    black_increment_or_delay,
    black_increment_or_delay_type,
    color,
    skill_level,
    examined_game_id
    /*,
  irregular_legality,
  irregular_semantics,
  uses_plunkers,
  fancy_timecontrol,
  promote_to_king*/
  ) {
    const self = Meteor.user();

    check(self, Object);
    check(message_identifier, String);
    check(other_user, Match.OneOf(Object, String));
    check(wild_number, Number);
    check(rating_type, String);
    check(rated, Boolean);
    check(white_initial, Number);
    check(white_increment_or_delay, Number);
    check(white_increment_or_delay_type, String);
    check(black_initial, Number);
    check(black_increment_or_delay, Number);
    check(black_increment_or_delay_type, String);
    check(color, Match.Maybe(String));
    check(skill_level, Match.Maybe(Number));
    check(examined_game_id, Match.Maybe(String));

    check(white_increment_or_delay, Number);
    check(black_increment_or_delay, Number);
    check(white_increment_or_delay_type, String);
    check(black_increment_or_delay_type, String);

    if (typeof other_user === "string" && other_user !== "computer")
      throw new Meteor.Error("Unable to start local game", "other_user must be 'computer' only");
    if (other_user === "computer" && skill_level === undefined)
      throw new Meteor.Error(
        "Unable to start local game",
        "Skill level must be defined for bot play"
      );
    if (other_user !== "computer" && skill_level !== undefined && skill_level !== null)
      throw new Meteor.Error(
        "Unable to start local game",
        "Skill level can only be defined for bot play"
      );

    check(self.ratings[rating_type], Object); // Rating type needs to be valid!
    if (!self.status.online) {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to start game",
        "User starting game is not logged on"
      );
    }

    if (!!color && color !== "white" && color !== "black")
      throw new Match.Error(
        "Unable to start local game",
        "color must be undefined, 'white' or 'black"
      );

    if (other_user !== "computer" && !other_user.status.online) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
      return;
    }

    if (!Users.isAuthorized(self, "play_" + (rated ? "" : "un") + "rated_games")) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "UNABLE_TO_PLAY_" + (rated ? "" : "UN") + "RATED_GAMES"
      );
      return;
    }

    if (
      other_user !== "computer" &&
      !Users.isAuthorized(other_user, "play_" + (rated ? "" : "un") + "rated_games")
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
      return;
    }

    if (
      rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "white",
        rating_type,
        white_initial,
        white_increment_or_delay,
        white_increment_or_delay_type,
        "start",
        !!color
      )
    ) {
      throw new ICCMeteorError("Unable to start game", "White time/inc/delay fails validation");
    }

    if (
      rated &&
      !DynamicRatings.meetsRatingTypeRules(
        message_identifier,
        "black",
        rating_type,
        black_initial,
        black_increment_or_delay,
        black_increment_or_delay_type,
        "start",
        !!color
      )
    ) {
      throw new ICCMeteorError("Unable to start game", "Black time/inc/delay fails validation");
    }

    if (this.hasOwnedGame(self._id)) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "COMMAND_INVALID_WITH_OWNED_GAME"
      );
      return;
    }
    if (other_user !== "computer" && this.hasOwnedGame(other_user._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PLAY_OPPONENT");
      return;
    }
    if (this.isPlayingGame(self._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
      return;
    }

    if (other_user !== "computer" && this.isPlayingGame(other_user._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
      return;
    }

    let examined_game;
    const chess = new Chess.Chess();

    if (!!examined_game_id) {
      examined_game = this.GameCollection.findOne({ _id: examined_game_id });
      if (!examined_game) {
        ClientMessages.sendMessageToClient(self, message_identifier, "GAME_NOT_FOUND");
        return;
      }

      if (!chess.validate_fen(examined_game.fen)) {
        ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_FEN");
        return;
      } else chess.load(examined_game.fen);
    }

    if (chess.game_over()) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_FEN");
      return;
    }

    this.localUnobserveAllGames(message_identifier, self._id, true);
    if (other_user !== "computer")
      this.localUnobserveAllGames(message_identifier, other_user._id, true);

    if (other_user === "computer") {
      other_user = {
        _id: "computer",
        username: "Computer"
      };
      other_user["ratings"] = {};
      other_user.ratings[rating_type] = {
        rating: 1600,
        need: 0,
        won: 0,
        draw: 0,
        lost: 0,
        best: 0
      };
    }

    const white = this.determineWhite(self, other_user, color);
    const black = white._id === self._id ? other_user : self;

    const game = {
      starttime: new Date(),
      isolation_group: self.isolation_group,
      fen: chess.fen(),
      tomove: chess.turn() === "w" ? "white" : "black",
      pending: {
        white: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        },
        black: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        }
      },
      white: {
        id: white._id,
        name: white.username,
        rating: white.ratings[rating_type].rating
      },
      black: {
        id: black._id,
        name: black.username,
        rating: black.ratings[rating_type].rating
      },
      wild: wild_number,
      rating_type: rating_type,
      rated: rated,
      skill_level: skill_level,
      clocks: {
        white: {
          initial: white_initial,
          inc_or_delay: white_increment_or_delay,
          delaytype: white_increment_or_delay_type,
          current: white_initial * 60 * 1000, // milliseconds
          starttime: chess.turn() === "w" ? new Date().getTime() : 0
        },
        black: {
          initial: black_initial,
          inc_or_delay: black_increment_or_delay,
          delaytype: black_increment_or_delay_type,
          current: black_initial * 60 * 1000, //milliseconds
          starttime: chess.turn() === "b" ? new Date().getTime() : 0
        }
      },
      status: "playing",
      actions: [],
      observers: [],
      variations: { hmtb: 0, cmi: 0, movelist: [{}] },
      computer_variations: [],
      lag: {
        white: {
          active: [],
          pings: []
        },
        black: {
          active: [],
          pings: []
        }
      }
    };

    if (!!examined_game) {
      game.tags = { FEN: examined_game.fen };
    }
    if (white._id !== "computer") Users.setGameStatus(message_identifier, white, "playing");
    if (black._id !== "computer") Users.setGameStatus(message_identifier, black, "playing");

    const game_id = this.GameCollection.insert(game);

    active_games[game_id] = chess;
    const computer_color =
      white._id === "computer" ? "white" : black._id === "computer" ? "black" : null;
    this.startGamePing(game_id, computer_color);
    this.startMoveTimer(
      game_id,
      "white",
      (game.clocks.white.inc_or_delay | 0) * 1000,
      game.clocks.white.delaytype,
      game.clocks.white.current
    );

    return game_id;
  }

  updateLocalExaminedGameWithObject(message_identifier, game_id, game_object, pgn_text) {
    const self = Meteor.user();

    check(self, Object);
    check(message_identifier, String);
    check(game_id, String);
    check(game_object, Object);
    check(pgn_text, String);

    const existing_game = this.GameCollection.findOne({
      _id: game_id,
      status: "examining",
      "examiners.id": self._id
    });
    if (!existing_game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    delete game_object.actions;

    delete existing_game.fen;
    delete existing_game.status;
    delete existing_game.clocks;
    delete existing_game.variations;

    game_object = _.merge(existing_game, game_object);

    if (!game_object.fen)
      game_object.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    game_object.actions.push({ type: "loadpgn", issuer: self._id, parameter: { pgn: pgn_text } });

    game_object.owner = self._id;
    game_object.isolation_group = self.isolation_group;

    if (!game_object.status) game_object.status = "examining";
    if (!game_object.white) game_object.white = { name: "?", rating: 1600 };
    if (!game_object.black) game_object.black = { name: "?", rating: 1600 };
    if (!game_object.white.name) game_object.white.name = "?";
    if (!game_object.black.name) game_object.black.name = "?";
    if (!game_object.white.rating) game_object.white.rating = 1600;
    if (!game_object.black.rating) game_object.black.rating = 1600;
    if (!game_object.wild) game_object.wild = 0;
    if (!game_object.actions) game_object.actions = [];
    if (!game_object.clocks)
      game_object.clocks = {
        white: { initial: 1, inc_or_delay: 0, delaytype: "none" },
        black: { initial: 1, inc_or_delay: 0, delaytype: "none" }
      };
    if (!game_object.startTime) game_object.startTime = new Date();
    if (!game_object.tomove) game_object.tomove = "w";
    if (!game_object.actions) game_object.actions = [];
    if (!game_object.variations) game_object.variations = { movelist: [{}], ecocodes: [] };
    if (!game_object.variations.cmi) game_object.variations.cmi = 0;
    if (!game_object.variations.ecocodes) game_object.variations.ecocodes = [];

    function mongoReplacementModifier(keep, change) {
      var $unset = {};
      for (var key in change) {
        if (keep[key] === undefined) {
          $unset[key] = "";
        }
      }
      var copy = _.clone(keep);
      delete copy._id;
      return { $set: copy, $unset: $unset };
    }

    const modifier = mongoReplacementModifier(game_object, existing_game);
    this.GameCollection.update({ _id: game_id, status: "examining" }, modifier);

    if (!active_games[game_id]) active_games[game_id] = new Chess.Chess();
    active_games[game_id].load(game_object.fen);
  }

  startLocalExaminedGameWithObject(message_identifier, game_object) {
    const self = Meteor.user();

    check(self, Object);
    check(message_identifier, String);
    check(game_object, Object);

    game_object.owner = self._id;
    game_object.isolation_group = self.isolation_group;

    if (!game_object.status) game_object.status = "examining";
    if (!game_object.white) game_object.white = { name: "?", rating: 1600 };
    if (!game_object.black) game_object.black = { name: "?", rating: 1600 };
    if (!game_object.white.name) game_object.white.name = "?";
    if (!game_object.black.name) game_object.black.name = "?";
    if (!game_object.white.rating) game_object.white.rating = 1600;
    if (!game_object.black.rating) game_object.black.rating = 1600;
    if (!game_object.wild) game_object.wild = 0;
    if (!game_object.actions) game_object.actions = [];
    if (!game_object.clocks)
      game_object.clocks = {
        white: { initial: 1, inc_or_delay: 0, delaytype: "none" },
        black: { initial: 1, inc_or_delay: 0, delaytype: "none" }
      };
    if (!game_object.startTime) game_object.startTime = new Date();
    if (!game_object.tomove) game_object.tomove = "white";
    if (!game_object.actions) game_object.actions = [];
    if (!game_object.variations) game_object.variations = { movelist: [{}], ecocodes: [] };
    if (!game_object.variations.cmi) game_object.variations.cmi = 0;
    if (!game_object.variations.ecocodes) game_object.variations.ecocodes = [];

    game_object.examiners = [{ id: self._id, username: self.username }];
    game_object.observers = [{ id: self._id, username: self.username }];

    const chess = new Chess.Chess();
    if (game_object.tags && game_object.tags.FEN) {
      game_object.fen = game_object.tags.FEN;
      if (!chess.load(game_object.tags.FEN))
        throw new ICCMeteorError(
          message_identifier,
          "Unable to examine saved game",
          "FEN string is invalid"
        );
      game_object.tomove = chess.turn() === "w" ? "white" : "black";
    } else {
      game_object.fen = chess.fen();
    }

    delete game_object._id; // For safety
    const game_id = this.GameCollection.insert(game_object);
    Users.setGameStatus("server", self._id, "examining");
    active_games[game_id] = chess;
    return game_id;
  }

  startLocalExaminedGame(message_identifier, white_name, black_name, wild_number) {
    const self = Meteor.user();

    check(self, Object);
    check(message_identifier, String);
    check(white_name, String);
    check(black_name, String);
    check(wild_number, Number);

    if (!self.status.online) {
      throw new ICCMeteorError(
        message_identifier,
        "Unable to examine game",
        "User examining game is not logged on"
      );
    }

    if (this.isPlayingGame(self._id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
      return;
    }

    if (this.hasOwnedGame(self._id)) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "COMMAND_INVALID_WITH_OWNED_GAME"
      );
      return;
    }

    this.localUnobserveAllGames(message_identifier, self._id);

    const chess = new Chess.Chess();

    const game = {
      owner: self._id,
      isolation_group: self.isolation_group,
      starttime: new Date(),
      result: "*",
      fen: chess.fen(),
      tomove: "white",
      white: {
        name: white_name,
        rating: 1600
      },
      black: {
        name: black_name,
        rating: 1600
      },
      wild: wild_number,
      status: "examining",
      actions: [],
      observers: [{ id: self._id, username: self.username }],
      examiners: [{ id: self._id, username: self.username }],
      analysis: [{ id: self._id, username: self.username }],
      variations: { hmtb: 0, cmi: 0, movelist: [{}], ecocodes: [] },
      computer_variations: []
    };

    const game_id = this.GameCollection.insert(game);
    Users.setGameStatus(message_identifier, self, "examining");
    active_games[game_id] = chess;
    return game_id;
  }

  importPGNIntoExaminedGame(message_identifier, game_id, pgn_text) {
    const self = Meteor.user();
    check(self, Object);
    check(message_identifier, String);
    check(game_id, String);
    check(pgn_text, String);

    const parser = new Parser();
    try {
      parser.feed(pgn_text);
      if (!parser.gamelist || !parser.gamelist.length || parser.gamelist.length > 1) {
        ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_PGN");
        return;
      }
      this.updateLocalExaminedGameWithObject(
        message_identifier,
        game_id,
        parser.gamelist[0],
        pgn_text
      );
    } catch (e) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_PGN");
    }
  }

  startLegacyGame(
    message_identifier,
    gamenumber,
    whitename,
    blackname,
    wild_number,
    rating_type,
    rated,
    white_initial,
    white_increment,
    black_initial,
    black_increment,
    played_game,
    white_rating,
    black_rating,
    game_id,
    white_titles,
    black_titles,
    ex_string,
    irregular_legality,
    irregular_semantics,
    uses_plunkers,
    fancy_timecontrol,
    promote_to_king
  ) {
    log.debug("startLegacyGame " + message_identifier);
    check(message_identifier, String);
    check(gamenumber, Number);
    check(whitename, String);
    check(blackname, String);
    check(wild_number, Number);
    check(rating_type, String);
    check(rated, Boolean);
    check(white_initial, Number);
    check(white_increment, Number);
    check(black_initial, Number);
    check(black_increment, Number);
    check(played_game, Boolean);
    check(ex_string, String);
    check(white_rating, Number);
    check(black_rating, Number);
    check(game_id, String);
    check(white_titles, Array);
    check(black_titles, Array);
    check(irregular_legality, Match.Maybe(String));
    check(irregular_semantics, Match.Maybe(String));
    check(uses_plunkers, Match.Maybe(String));
    check(fancy_timecontrol, Match.Maybe(String));
    check(promote_to_king, Match.Maybe(Boolean));

    const whiteuser = Meteor.users.findOne({
      "profile.legacy.username": whitename,
      "profile.legacy.validated": true
    });

    const blackuser = Meteor.users.findOne({
      "profile.legacy.username": blackname,
      "profile.legacy.validated": true
    });

    const self = Meteor.user();
    const iswhite = !!self && !!whiteuser && whiteuser._id === self._id;
    const isblack = !!self && !!blackuser && blackuser._id === self._id;

    if (!self || (!iswhite && !isblack))
      throw new ICCMeteorError(
        message_identifier,
        "Unable to start legacy game",
        "Unable to find user"
      );

    if (!self.status.online)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to start legacy game",
        "User is not logged on"
      );

    const exists = this.GameCollection.find({ legacy_game_number: gamenumber }).count();
    if (exists)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to start game",
        "There is already a game in the database with the same game number"
      );

    if (
      !!whiteuser &&
      !!blackuser &&
      LegacyUser.isLoggedOn(whiteuser) &&
      LegacyUser.isLoggedOn(blackuser)
    )
      throw new ICCMeteorError(
        message_identifier,
        "Unable to start game",
        "Both players are logged on locally. Begin a local game"
      );

    if (
      this.GameCollection.find({
        status: "playing",
        $or: [{ "white.id": self._id }, { "black.id": self._id }]
      }).count() !== 0
    ) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
      return;
    }

    this.localUnobserveAllGames(message_identifier, self._id, true);

    const game = {
      starttime: new Date(),
      isolation_group: "public",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      tomove: "white",
      legacy_game_number: gamenumber,
      legacy_game_id: game_id,
      white: {
        name: "(L) " + whitename,
        rating: white_rating
      },
      black: {
        name: "(L) " + blackname,
        rating: black_rating
      },
      wild: wild_number,
      rating_type: rating_type,
      rated: rated,
      clocks: {
        white: {
          initial: white_initial,
          inc_or_delay: white_increment,
          delaytype: "inc",
          current: white_initial * 60 * 1000,
          starttime: 0
        },
        black: {
          initial: black_initial,
          inc_or_delay: black_increment,
          delaytype: "inc",
          current: black_initial * 60 * 1000,
          starttime: 0
        }
      },
      status: played_game ? "playing" : "examining",
      result: "*",
      pending: {
        white: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        },
        black: {
          draw: "0",
          abort: "0",
          adjourn: "0",
          takeback: { number: 0, mid: "0" }
        }
      },
      actions: [],
      variations: { hmtb: 0, cmi: 0, movelist: [{}], ecocodes: [] },
      computer_variations: [],
      lag: {
        white: {
          active: [],
          pings: []
        },
        black: {
          active: [],
          pings: []
        }
      }
    };

    game.examiners = [];
    if (!!whiteuser) {
      game.white.id = whiteuser._id;
      if (!played_game) game.examiners.push({ id: whiteuser._id, username: whiteuser.username });
    }
    if (!!blackuser) {
      game.black.id = blackuser._id;
      if (!played_game) game.examiners.push({ id: blackuser._id, username: blackuser.username });
    }

    if (!!whiteuser) Users.setGameStatus(message_identifier, whiteuser, "playing");
    if (!!blackuser) Users.setGameStatus(message_identifier, blackuser, "playing");

    return this.GameCollection.insert(game);
  }

  saveLegacyMove(message_identifier, gamenumber, move) {
    check(message_identifier, String);
    check(gamenumber, Number);
    check(move, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ legacy_game_number: gamenumber });

    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to make move",
        "Unable to find legacy game record"
      );

    if (game.white.id !== self._id && game.black.id !== self._id)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to make move",
        "User does not seem to be either player"
      );

    const variation = game.variations;

    this.addMoveToMoveList(
      variation,
      move,
      game.status === "playing" ? game.clocks[game.tomove].current : null
    );

    const newtm = game.tomove === "white" ? "black" : "white";
    const chess = new Chess.Chess(game.fen);
    chess.move(move);
    const newfen = chess.fen();

    const result = this.GameCollection.update(
      { _id: game._id, status: game.status },
      {
        $push: { actions: { type: "move", issuer: "legacy", parameter: move } },
        $set: { variations: variation, tomove: newtm, fen: newfen }
      }
    );
    log.debug("saveLegacyMove result", result);
  }

  calculateGameLag(lagobject) {
    if (!lagobject || !lagobject.pings) return 0;
    let gamelag;
    let totallag = 0;
    const lagvalues = lagobject.pings.slice(-2);
    const now = new Date().getTime();
    if (lagvalues.length) {
      totallag = lagvalues.reduce((total, cur) => total + cur, 0);
      totallag = totallag | 0; // convert double to int
      let lastlag = lagobject.active.reduce((total, cur) => now - cur.originate + total, 0);
      gamelag = (totallag + lastlag) / lagvalues.length;
      if (gamelag > SystemConfiguration.minimumLag()) gamelag -= SystemConfiguration.minimumLag();
    }
    return gamelag;
  }

  saveLocalMove(message_identifier, game_id, move) {
    check(message_identifier, String);
    check(game_id, String);
    check(move, String);
    const self = Meteor.user();
    check(self, Object);
    this.internalSaveLocalMove(self, message_identifier, game_id, move);
  }

  internalSaveLocalPremove(message_identifier, game, move) {
    const chessObject = active_games[game._id];
    const temp = new Chess(chessObject.fen());
    const moves = temp.moves();
    let found = false;
    for (let x = 0; !found && x < moves.length(); x++) {
      temp.move(moves[x]);
      const result = chessObject.move(move, { sloppy: true });
      if (!!result) {
        result.message_identifier = message_identifier;
        this.GameCollection.update({ _id: game._id }, { $set: { premove: result } });
        return;
      }
      temp.undo();
    }
    ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "ILLEGAL_MOVE");
    // TODO: Do we delete the premove in this case?
  }

  internalSaveLocalMove(self, message_identifier, game_id, move, is_premove) {
    const game = this.getAndCheck(self, message_identifier, game_id);

    if (!game) return;
    const chessObject = active_games[game_id];
    const variation = game.variations;

    if (game.status === "playing") {
      const turn_id = chessObject.turn() === "w" ? game.white.id : game.black.id;
      if (self._id !== turn_id) {
        if (self._id === "computer")
          throw new Meteor.Error(
            "Unable to make local move",
            "Computer is trying to make an illegal move"
          );
        if (!self.settings.premove)
          ClientMessages.sendMessageToClient(
            Meteor.user(),
            message_identifier,
            "COMMAND_INVALID_NOT_YOUR_MOVE"
          );
        else this.internalSaveLocalPremove(message_identifier, game, move);
        return;
      }
    } else if (game.examiners.map(e => e.id).indexOf(self._id) === -1) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    //chess.move('Nf6')
    // // -> { color: 'b', from: 'g8', to: 'f6', flags: 'n', piece: 'n', san: 'Nf6' }
    const result = chessObject.move(move);
    const bw = self._id === game.white.id ? "white" : "black";
    const otherbw = bw === "white" ? "black" : "white";

    if (!result) {
      ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "ILLEGAL_MOVE", [move]);
      if (is_premove)
        this.startMoveTimer(
          game_id,
          self._id,
          (game.clocks[bw].inc_or_delay | 0) * 1000,
          game.clocks[bw].delaytype,
          game.clocks[bw].current
        );
      return;
    }

    if (!is_premove) this.endMoveTimer(game_id);

    const setobject = { fen: chessObject.fen() };

    const unsetobject = {};
    let gamelag = 0;
    let gameping = 0;
    this.addMoveToMoveList(
      variation,
      move,
      game.status === "playing" ? game.clocks[bw].current : null,
      result.piece,
      result.color,
      result.from,
      result.to,
      result.promotion
    );

    if (game.status === "playing") {
      if (
        active_games[game_id].in_draw() &&
        (active_games[game_id].in_stalemate() || active_games[game_id].insufficient_material())
      ) {
        setobject.result = "1/2-1/2";
        if (active_games[game_id].in_stalemate()) setobject.status2 = 14;
        else setobject.status2 = 18;
      } else if (active_games[game_id].game_over()) {
        if (active_games[game_id].in_checkmate()) {
          setobject.result = active_games[game_id].turn() === "w" ? "0-1" : "1-0";
          setobject.status2 = 1;
        } else {
          setobject.result = active_games[game_id].turn() === "*";
          setobject.status2 = 42;
        }
      }

      if (!!setobject.result) {
        setobject.status = "examining";
        setobject.examiners = [];
        if (game.white.id !== "computer")
          setobject.examiners.push({ id: game.white.id, username: game.white.name });
        if (game.black.id !== "computer")
          setobject.examiners.push({ id: game.black.id, username: game.black.name });
        setobject.observers = game.observers.concat(setobject.examiners);
        unsetobject.pending = "";
      } else {
        setobject["pending." + otherbw + ".draw"] = "0";
        setobject["pending." + otherbw + ".abort"] = "0";
        setobject["pending." + otherbw + ".adjourn"] = "0";
        setobject["pending." + otherbw + ".takeback.number"] = 0;
        setobject["pending." + otherbw + ".takeback.mid"] = "0";
        // If user made an even-number takeback request, that means they are requesting that they take take
        // their own previous move(s), making it their move. If they do this, and then move, we revoke the
        // takeback request.
        // However, if they make an odd-number takeback request, they are requesting to take back their
        // opponents move. In this case, if they then make a move, we increment the half moves so that if
        // their opponent acccepts, it takes back their last move(s) and continues.
        if (game.pending[bw].takeback.number && game.pending[bw].takeback.number % 2 === 0) {
          setobject["pending." + bw + ".takeback.number"] = 0;
          setobject["pending." + bw + ".takeback.mid"] = "0";
          game.variations.hmtb = 0;
        } else if (game.variations.hmtb) setobject.variations = { hmtb: game.variations.hmtb + 1 };
      }

      if (!setobject.result) {
        const timenow = new Date().getTime();
        gamelag = this.calculateGameLag(game.lag[bw]) | 0;
        gameping = game.lag[bw].pings.slice(-1) | 0;

        let used = timenow - game.clocks[bw].starttime + gamelag;
        let addback = 0;

        if (game.clocks[bw].delaytype !== "none") {
          if (game.clocks[bw].delaytype === "inc") {
            addback = game.clocks[bw].inc_or_delay * 1000;
          } else if (game.clocks[bw].inc_or_delay * 1000 >= used) {
            addback = used;
          } else if (game.clocks[bw].inc_or_delay * 1000 < used) {
            addback = game.clocks[bw].inc_or_delay * 1000;
          }
        }

        //
        // Add the expected lag to the oppnents clock for the receiving of this move
        //
        let opponentlag = 0;
        if (game[otherbw].id !== "computer") {
          opponentlag = this.calculateGameLag(game.lag[otherbw]) | 0;
          if (!opponentlag) opponentlag = Timestamp.averageLag(game[otherbw].id) | 0;
          if (!opponentlag) opponentlag = 0;
        }

        // Editors note: This will ensure that there is a minimum amount of time drop
        // when the user premoves.
        if (used <= SystemConfiguration.minimumMoveTime())
          used = SystemConfiguration.minimumMoveTime();
        setobject["clocks." + bw + ".current"] = game.clocks[bw].current - used + addback;
        // TODO: check for current <= 0 and end the game, yes?
        setobject["clocks." + otherbw + ".current"] = game.clocks[otherbw].current + opponentlag;
      } else {
        this.endGamePing(game_id);
      }
    }

    const move_parameter =
      game.status === "playing"
        ? {
            move: move,
            lag: Timestamp.averageLag(self._id),
            ping: Timestamp.pingTime(self._id),
            gamelag: gamelag,
            gameping: gameping
          }
        : move;

    setobject.variations = variation;
    setobject.tomove = otherbw;
    setobject["clocks." + otherbw + ".starttime"] = new Date().getTime();
    const premove = game.premove;

    if (!!premove) unsetobject.premove = 1;

    if (setobject.result) {
      if (game.white.id !== "computer")
        Users.setGameStatus(message_identifier, game.white.id, "examining");
      if (game.black.id !== "computer")
        Users.setGameStatus(message_identifier, game.black.id, "examining");
    }

    const modifier = {
      $push: { actions: { type: "move", issuer: self._id, parameter: move_parameter } }
    };
    if (!!unsetobject && Object.entries(unsetobject).length) modifier.$unset = unsetobject;
    if (!!setobject && Object.entries(setobject).length) modifier.$set = setobject;

    this.GameCollection.update({ _id: game_id, status: game.status }, modifier);

    if (setobject.result) {
      this.updateUserRatings(game, setobject.result, setobject.status2);
      GameHistory.savePlayedGame(message_identifier, game_id);
      this.sendGameStatus(
        game_id,
        game.white.id,
        game.black.id,
        setobject.tomove,
        setobject.result,
        setobject.status2
      );
    } else if (game.status === "playing")
      if (!!premove) {
        const otherguy = Meteor.users.find({ _id: game[otherbw].id });
        this.internalSaveLocalMove(
          otherguy,
          game.premove.message_identifier,
          game._id,
          premove.san
        );
      } else {
        this.startMoveTimer(
          game_id,
          otherbw,
          (game.clocks[otherbw].inc_or_delay | 0) * 1000,
          game.clocks[otherbw].delaytype,
          game.clocks[otherbw].current
        );
      }
  }

  //	There are three outcome codes, given in the following order:
  // 	(1) game_result, e.g. "Mat" (the 3-letter codes used in game lists)
  // 	(2) score_string2, "0-1", "1-0", "1/2-1/2", "*", or "aborted"
  // 	(3) description_string, e.g. "White checkmated"
  legacyGameEnded(
    message_identifier,
    gamenumber,
    become_examined,
    game_result_code,
    score_string2
    //description_string,
    //eco
  ) {
    log.debug("LegacyGameEnded " + message_identifier + ", " + gamenumber);
    check(message_identifier, String);
    check(gamenumber, Number);
    check(become_examined, Boolean);
    //check(game_result_code, String);
    check(score_string2, String);
    //check(description_string, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ legacy_game_number: gamenumber });
    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to end game",
        "Unable to locate legacy game record"
      );
    if (game.white.id !== self._id && game.black.id !== self._id)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to end game",
        "User does not seem to be black or white"
      );
    if (game.status !== "playing")
      throw new ICCMeteorError(
        message_identifier,
        "Unable to end game",
        "Game is not being played"
      );
    if (become_examined) {
      this.GameCollection.update(
        { _id: game._id, status: "playing" },
        {
          $set: {
            result: score_string2,
            status: "examining",
            status2: 0,
            examiners: [{ id: self._id, username: self.username }],
            observers: [{ id: self._id, username: self.username }],
            analysis: [{ id: self._id, username: self.username }]
          },
          $unset: { pending: "" }
        }
      );

      this.sendGameStatus(game._id, game.white.id, game.black.id, game.tomove, score_string2, 0);
      Users.setGameStatus(message_identifier, self._id, "examining");
    } else {
      this.GameCollection.remove({ _id: game._id });
    }
  }

  localRemoveExaminer(message_identifier, game_id, id_to_remove) {
    check(message_identifier, String);
    check(game_id, String);
    check(id_to_remove, String);
    const self = Meteor.user();
    check(self, Object);

    if (id_to_remove === self._id)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove examiner",
        "Cannot remove yourself"
      );

    const game = this.GameCollection.findOne({
      _id: game_id
    });
    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove examiner",
        "game id does not exist"
      );

    if (!game.examiners || game.examiners.map(e => e.id).indexOf(self._id) === -1) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (game.private && game.owner !== self._id) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_THE_OWNER");
      return;
    } else if (
      !game.private &&
      (!game.examiners || game.examiners.map(e => e.id).indexOf(self._id) === -1)
    ) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (!game.examiners || !game.examiners.some(e => e.id === id_to_remove)) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      { $pull: { examiners: { id: id_to_remove } } }
    );

    Users.setGameStatus(message_identifier, id_to_remove, "observing");
  }

  localAddExaminer(message_identifier, game_id, id_to_add) {
    check(message_identifier, String);
    check(game_id, String);
    check(id_to_add, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ _id: game_id });

    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add examiner",
        "Unable to find game record"
      );

    if (!game.examiners || game.examiners.map(e => e.id).indexOf(self._id) === -1) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (game.private && self._id !== game.owner) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_THE_OWNER");
      return;
    }

    const observer = game.observers && game.observers.find(o => o.id === id_to_add);
    if (!observer) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_OBSERVER");
      return;
    }

    if (!!game.examiners && game.examiners.map(e => e.id).indexOf(id_to_add) !== -1) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "ALREADY_AN_EXAMINER");
      return;
    }

    Users.setGameStatus(message_identifier, id_to_add, "examining");

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      { $addToSet: { examiners: observer } }
    );
  }

  localRemoveObserver(message_identifier, game_id, id_to_remove, server_command, due_to_logout) {
    check(message_identifier, String);
    check(game_id, String);
    check(id_to_remove, String);
    check(server_command, Match.Maybe(Boolean));
    check(due_to_logout, Match.Maybe(Boolean));

    // Since we call this on logout, we have to allow an invalid 'self'
    let self;
    if (!server_command) self = Meteor.user();
    else {
      self = Meteor.users.findOne({ _id: id_to_remove });
      if (message_identifier === "server") message_identifier = "server:game:" + game_id;
    }
    check(self, Object);

    const game = this.GameCollection.findOne({
      _id: game_id
    });

    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove observer",
        "game id does not exist"
      );

    const requestor = game.requestors && game.requestors.some(r => r.id === id_to_remove);
    const observer = game.observers && game.observers.some(o => o.id === id_to_remove);

    if (!requestor && !observer) {
      if (!server_command)
        ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_AN_OBSERVER");
      return;
    }

    if (game.private && self._id !== game.owner && !server_command) {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "NOT_THE_OWNER");
      return;
    }

    Users.setGameStatus(message_identifier, id_to_remove, "none");

    function not_being_played() {
      return game.status !== "playing";
    }

    function last_examiner_in_a_public_game() {
      return (
        game.status !== "playing" &&
        !game.private &&
        (!game.examiners ||
          !game.examiners.length ||
          (game.examiners.length === 1 && game.examiners[0].id === id_to_remove))
      );
    }

    function owner_and_no_observers_in_a_private_game() {
      return (
        game.status !== "playing" &&
        game.private &&
        (!game.observers || (game.observers.length === 1 && game.observers[0].id === id_to_remove))
      );
    }

    const delete_game =
      not_being_played() &&
      (last_examiner_in_a_public_game() || owner_and_no_observers_in_a_private_game());

    if (game.private && self._id !== id_to_remove && !due_to_logout)
      ClientMessages.sendMessageToClient(id_to_remove, message_identifier, "PRIVATE_ENTRY_REMOVED");

    if (game.owner === id_to_remove && game.private && (!due_to_logout || delete_game)) {
      this.setPrivate(message_identifier, game_id, false);
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        { $unset: { owner: 1, deny_chat: 1 } }
      );
    }

    if (delete_game) {
      game.observers.forEach(obr => Users.setGameStatus("server", obr.id, "none"));
      this.GameCollection.remove({ _id: game_id });
      delete active_games[game_id];
    } else {
      this.GameCollection.update(
        { _id: game_id, status: game.status },
        {
          $pull: {
            examiners: { id: id_to_remove },
            observers: { id: id_to_remove },
            requestors: { id: id_to_remove },
            analysis: { id: id_to_remove }
          }
        }
      );
    }
  }

  localAddObserver(message_identifier, game_id, id_to_add) {
    check(message_identifier, String);
    check(game_id, String);
    check(id_to_add, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add examiner",
        "game id does not exist"
      );
    const adding_user = Meteor.users.findOne({ _id: id_to_add });
    if (!adding_user)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add observer",
        "Unable to find user record for ID"
      );
    if (game.legacy_game_number)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add observer",
        "Game is a legacy game"
      );

    if (this.isPlayingGame(id_to_add)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
      return;
    }

    const private_game = this.GameCollection.findOne({
      $and: [
        { status: "examining" },
        { owner: self._id },
        { private: true },
        { _id: { $ne: game_id } }
      ]
    });

    if (!!private_game && private_game.observers.length > 1) {
      ClientMessages.sendMessageToClient(
        self,
        message_identifier,
        "COMMAND_INVALID_WITH_OWNED_GAME"
      );
      return;
    }

    if (game.private) {
      if (self._id === game.owner) {
        let requestor;
        if (game.requestors) requestor = game.requestors.find(r => r.id === id_to_add);
        if (!requestor) {
          ClientMessages.sendMessageToClient(self, message_identifier, "NOT_A_REQUESTOR");
          return;
        }
        this.GameCollection.update(
          { _id: game_id, status: "examining" },
          { $pull: { requestors: { id: id_to_add } } }
        );
        ClientMessages.sendMessageToClient(id_to_add, requestor.mid, "PRIVATE_ENTRY_ACCEPTED");
        // fall through here to do the normal observer stuff to the user
      } else if (self._id !== id_to_add) {
        throw new ICCMeteorError(
          message_identifier,
          "Unable to add observer",
          "Currently no support for adding another observer"
        );
      } else {
        if (game.deny_requests) {
          ClientMessages.sendMessageToClient(self, message_identifier, "PRIVATE_GAME");
          return;
        }
        if (!game.requestors) game.requestors = [];
        game.requestors.push({ id: self._id, username: self.username, mid: message_identifier });
        this.GameCollection.update(
          { _id: game_id, status: "examining" },
          { $set: { requestors: game.requestors } }
        );
        ClientMessages.sendMessageToClient(self, message_identifier, "PRIVATE_ENTRY_REQUESTED");
        return;
      }
    } else if (self._id !== id_to_add)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to add observer",
        "Currently no support for adding another observer"
      );

    const updateobject = {
      $addToSet: { observers: { id: adding_user._id, username: adding_user.username } }
    };

    if (!game.private)
      updateobject.$addToSet.analysis = { id: adding_user._id, username: adding_user.username };

    this.localUnobserveAllGames(message_identifier, id_to_add, id_to_add !== self._id);
    Users.setGameStatus(message_identifier, id_to_add, "observing");
    this.GameCollection.update({ _id: game_id, status: game.status }, updateobject);
  }

  removeLegacyGame(message_identifier, game_id) {
    log.debug("removeLegacyGame " + message_identifier + ", " + game_id);
    check(message_identifier, String);
    check(game_id, Number);
    const self = Meteor.user();
    check(self, Object);

    const count = this.GameCollection.remove({ legacy_game_number: game_id });
    if (!count)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to remove legacy game",
        "Game id not found"
      );
    else if (count !== 1)
      throw new ICCMeteorError(message_identifier, "Catastrophe!", "Deleted more than one record!");
  }

  requestLocalTakeback(message_identifier, game_id, number) {
    check(message_identifier, String);
    check(game_id, String);
    check(number, Number);

    if (number < 1) throw new Match.Error("takeback half ply value must be greater than zero");

    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;

    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const color =
      game.white.id === self._id ? "white" : game.black.id === self._id ? "black" : null;

    if (!color)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to request takeback",
        "User is not either player"
      );

    //
    // If other player has a matching takeback requested, go ahead
    // and treat this as an accepted takeback.
    //
    const othercolor = color === "white" ? "black" : "white";
    if (game.pending[othercolor].takeback.number === number)
      return this.acceptLocalTakeback(message_identifier, game_id);

    if (game.pending[color].takeback.number !== 0) {
      ClientMessages.sendMessageToClient(self, message_identifier, "TAKEBACK_ALREADY_PENDING");
      return;
    }

    const setobject = {};
    setobject["pending." + color + ".takeback.number"] = number;
    setobject["pending." + color + ".takeback.mid"] = message_identifier;
    setobject["variations.hmtb"] = number;

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $set: setobject,
        $push: {
          actions: {
            type: "takeback_requested",
            issuer: self._id,
            parameter: number
          }
        }
      }
    );
  }

  acceptLocalTakeback(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const othercolor = self._id === game.white.id ? "black" : "white";
    let tomove = game.tomove;

    if (!game.pending[othercolor].takeback.number) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NO_TAKEBACK_PENDING");
      return;
    }

    const variation = game.variations;
    const action = { type: "takeback_accepted", issuer: self._id };
    const clock_reset = {};

    for (let x = 0; x < variation.hmtb; x++) {
      const undone = active_games[game_id].undo();
      const current = variation.movelist[variation.cmi];
      if (undone.san !== current.move)
        throw new ICCMeteorError(
          message_identifier,
          "Unable to takeback",
          "Mismatch between chess object and variation object"
        );

      tomove = tomove === "white" ? "black" : "white";
      clock_reset[tomove] = variation.movelist[variation.cmi].current;
      variation.cmi = variation.movelist[variation.cmi].prev;
    }

    const setobject = {
      fen: active_games[game_id].fen(),
      tomove: tomove,
      "pending.white.takeback": { number: 0, mid: "0" },
      "pending.black.takeback": { number: 0, mid: "0" },
      "variations.cmi": variation.cmi,
      "clocks.white.current": clock_reset.white,
      "clocks.black.current": clock_reset.black
    };

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: action },
        $set: setobject
      }
    );

    const otheruser = othercolor === "white" ? game.white.id : game.black.id;
    ClientMessages.sendMessageToClient(
      otheruser,
      game.pending[othercolor].takeback.mid,
      "TAKEBACK_ACCEPTED"
    );
  }

  declineLocalTakeback(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);

    const self = Meteor.user();
    check(self, Object);
    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const othercolor = self._id === game.white.id ? "black" : "white";
    if (!game.pending[othercolor].takeback.number) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NO_TAKEBACK_PENDING");
      return;
    }
    const setobject = {};
    setobject["pending." + othercolor + ".takeback"] = { number: 0, mid: "0" };

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $set: setobject,
        $push: {
          actions: { type: "takeback_declined", issuer: self._id }
        }
      }
    );

    const otherplayer = othercolor === "white" ? game.white.id : game.black.id;
    ClientMessages.sendMessageToClient(
      otherplayer,
      game.pending[othercolor].takeback.mid,
      "TAKEBACK_DECLINED"
    );
  }

  requestLocalDraw(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;

    if (game.legacy_game_number)
      throw new ICCMeteorError(
        self,
        message_identifier,
        "Unable to request draw",
        "Cannot request a local draw on a legacy game"
      );

    if (!game || game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    if (
      active_games[game_id].in_threefold_repetition() ||
      (active_games[game_id].in_draw() && !active_games[game_id].insufficient_material())
    ) {
      Users.setGameStatus(message_identifier, game.white.id, "examining");
      Users.setGameStatus(message_identifier, game.black.id, "examining");
      const status2 = active_games[game_id].in_threefold_repetition() ? 15 : 16;
      const examiners = [];
      if (game.white.id !== "computer")
        examiners.push({ id: game.white.id, username: game.white.name });
      if (game.black.id !== "computer")
        examiners.push({ id: game.black.id, username: game.black.name });
      this.GameCollection.update(
        { _id: game_id, status: "playing" },
        {
          $addToSet: {
            observers: {
              $each: examiners
            }
          },
          $push: {
            actions: { type: "draw", issuer: self._id }
          },
          $unset: { pending: "" },
          $set: {
            status: "examining",
            result: "1/2-1/2",
            status2: status2,
            examiners: examiners
          }
        }
      );
      this.updateUserRatings(game, "1/2-1/2", status2);
      GameHistory.savePlayedGame(message_identifier, game_id);
      this.sendGameStatus(game_id, game.white.id, game.black.id, game.tomove, "1/2-1/2", status2);
      return;
    }

    const color = self._id === game.white.id ? "white" : "black";

    if (game.pending[color].draw !== "0") {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "DRAW_ALREADY_PENDING");
      return;
    }

    const setobject = {};
    setobject["pending." + color + ".draw"] = message_identifier;

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "draw_requested", issuer: self._id } },
        $set: setobject
      }
    );
  }

  requestLocalAbort(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;

    if (game.legacy_game_number)
      throw new ICCMeteorError(
        self,
        message_identifier,
        "Unable to request abort",
        "Cannot request a local abort on a legacy game"
      );

    if (!game || game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const color = self._id === game.white.id ? "white" : "black";

    if (game.pending[color].abort !== "0") {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "ABORT_ALREADY_PENDING");
      return;
    }

    if (
      (game.tomove === "white" && game.variations.movelist.length === 1) ||
      (game.tomove === "black" && game.variations.movelist.length <= 2)
    ) {
      this.endGamePing(game_id);
      this.endMoveTimer(game_id);

      const examiners = [];
      if (game.white.id !== "computer")
        examiners.push({ id: game.white.id, username: game.white.name });
      if (game.black.id !== "computer")
        examiners.push({ id: game.black.id, username: game.black.name });
      this.GameCollection.update(
        { _id: game_id, status: "playing" },
        {
          $set: {
            status: "examining",
            result: "*",
            status2: 37,
            examiners: examiners
          },
          $unset: { pending: "" },
          $addToSet: {
            observers: {
              $each: examiners
            }
          },
          $push: {
            actions: {
              type: "abort_requested",
              issuer: self._id
            }
          }
        }
      );

      Users.setGameStatus(message_identifier, game.white.id, "examining");
      Users.setGameStatus(message_identifier, game.black.id, "examining");
      GameHistory.savePlayedGame(message_identifier, game_id);
      this.sendGameStatus(
        game_id,
        game.white.id,
        game.black.id,
        self._id === game.white.id ? "white" : "black",
        "*",
        37
      );
      return;
    }

    const setobject = {};
    setobject["pending." + color + ".abort"] = message_identifier;

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "abort_requested", issuer: self._id } },
        $set: setobject
      }
    );
  }

  requestLocalAdjourn(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;

    if (game.legacy_game_number)
      throw new ICCMeteorError(
        self,
        message_identifier,
        "Unable to request adjourn",
        "Cannot request a local adjourn on a legacy game"
      );

    if (!game || game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const color = self._id === game.white.id ? "white" : "black";

    if (game.pending[color].adjourn !== "0") {
      ClientMessages.sendMessageToClient(self._id, message_identifier, "ADJOURN_ALREADY_PENDING");
      return;
    }

    const setobject = {};
    setobject["pending." + color + ".adjourn"] = message_identifier;

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "adjourn_requested", issuer: self._id } },
        $set: setobject
      }
    );
  }

  acceptLocalDraw(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    this.endGamePing(game_id);
    this.endMoveTimer(game_id);

    const examiners = [];
    if (game.white.id !== "computer")
      examiners.push({ id: game.white.id, username: game.white.name });
    if (game.black.id !== "computer")
      examiners.push({ id: game.black.id, username: game.black.name });

    this.GameCollection.update(
      { _id: game_id },
      {
        $set: {
          status: "examining",
          result: "1/2-1/2",
          status2: 13,
          examiners: examiners
        },
        $unset: { pending: "" },
        $addToSet: {
          observers: {
            $each: examiners
          }
        },
        $push: {
          actions: {
            type: "draw_accepted",
            issuer: self._id
          }
        }
      }
    );
    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");
    this.updateUserRatings(game, "1/2-1/2", 13);
    GameHistory.savePlayedGame(message_identifier, game_id);
    this.sendGameStatus(
      game_id,
      game.white.id,
      game.black.id,
      self._id === game.white.id ? "white" : "black",
      "1/2-1/2",
      13
    );
  }

  acceptLocalAbort(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    this.endGamePing(game_id);
    this.endMoveTimer(game_id);

    const examiners = [];
    if (game.white.id !== "computer")
      examiners.push({ id: game.white.id, username: game.white.name });
    if (game.black.id !== "computer")
      examiners.push({ id: game.black.id, username: game.black.name });

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $set: {
          status: "examining",
          result: "*",
          status2: 30,
          examiners: examiners
        },
        $unset: { pending: "" },
        $addToSet: {
          observers: {
            $each: examiners
          }
        },
        $push: {
          actions: {
            type: "abort_accepted",
            issuer: self._id
          }
        }
      }
    );

    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");
    GameHistory.savePlayedGame(message_identifier, game_id);
    this.sendGameStatus(game_id, game.white.id, game.black.id, game.tomove, "*", 30);
  }

  acceptLocalAdjourn(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);

    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    this.endGamePing(game_id);
    this.endMoveTimer(game_id);

    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");

    const examiners = [];
    if (game.white.id !== "computer")
      examiners.push({ id: game.white.id, username: game.white.name });
    if (game.black.id !== "computer")
      examiners.push({ id: game.black.id, username: game.black.name });

    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $set: {
          status: "examining",
          result: "*",
          status2: 24,
          examiners: examiners
        },
        $unset: { pending: "" },
        $addToSet: {
          observers: {
            $each: examiners
          }
        },
        $push: {
          actions: {
            type: "adjourn_accepted",
            issuer: self._id
          }
        }
      }
    );
    this.sendGameStatus(game_id, game.white.id, game.black.id, game.tomove, "*", 24);
  }

  drawCircle(message_identifier, game_id, square, color, size) {
    check(message_identifier, String);
    check(square, String);
    check(color, String);
    check(size, Number);
    const self = Meteor.user();
    check(self, Object);

    if (!this.isSquareValid(square)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_SQUARE", square);
      return;
    }
    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new ICCMeteorError(message_identifier, "Unable to draw circle", "Game doesn't exist");
    }
    if (game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const examiner = game.examiners.find(examiner => examiner.id === self._id);
    if (!examiner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const resultFind = game.circles.find(circle => circle.square === square);
    if (resultFind) {
      resultFind.color = color;
      resultFind.size = size;
    } else {
      game.circles.push({ square: square, color: color, size: size });
    }
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: { circles: game.circles },
        $push: {
          actions: {
            type: "draw_circle",
            issuer: self._id,
            parameter: { square: square, color: color, size: size }
          }
        }
      }
    );
  }

  removeCircle(message_identifier, game_id, square) {
    check(message_identifier, String);
    check(square, String);
    const self = Meteor.user();
    check(self, Object);

    if (!this.isSquareValid(square)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_SQUARE", square);
      return;
    }
    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new ICCMeteorError(message_identifier, "Unable to remove circle", "Game doesn't exist");
    }
    if (game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const examiner = game.examiners.find(examiner => examiner.id === self._id);
    if (!examiner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $push: {
          actions: { type: "remove_circle", issuer: self._id, parameter: { square: square } }
        },
        $pull: { circles: { square: square } }
      }
    );
  }

  drawArrow(message_identifier, game_id, from, to, color, size) {
    check(message_identifier, String);
    check(from, String);
    check(to, String);
    check(color, String);
    check(size, Number);
    const self = Meteor.user();
    check(self, Object);

    if (!this.isSquareValid(from) || !this.isSquareValid(to)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ARROW", from, to);
      return;
    }
    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new ICCMeteorError(message_identifier, "Unable to draw arrow", "Game doesn't exist");
    }
    if (game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const examiner = game.examiners.find(examiner => examiner.id === self._id);
    if (!examiner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const resultFind = game.arrows.find(arrow => arrow.from === from && arrow.to === to);
    if (resultFind) {
      resultFind.color = color;
      resultFind.size = size;
    } else {
      game.arrows.push({ from: from, to: to, color: color, size: size });
    }
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: { arrows: game.arrows },
        $push: {
          actions: {
            type: "draw_arrow",
            issuer: self._id,
            parameter: { from: from, to: to, color: color, size: size }
          }
        }
      }
    );
  }

  removeArrow(message_identifier, game_id, from, to) {
    check(message_identifier, String);
    check(from, String);
    check(to, String);
    let self;
    self = Meteor.user();
    check(self, Object);

    if (!this.isSquareValid(from) || !this.isSquareValid(to)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_ARROW", from, to);
      return;
    }
    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new ICCMeteorError(message_identifier, "Unable to remove arrow", "Game doesn't exist");
    }
    if (game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const examiner = game.examiners.find(examiner => examiner.id === self._id);
    if (!examiner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const resultFind = game.arrows.find(arrow => arrow.from === from && arrow.to === to);

    if (!resultFind) {
      return;
    }
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $push: {
          actions: {
            type: "remove_arrow",
            issuer: self._id,
            parameter: { from: from, to: to }
          }
        },
        $pull: { arrows: { from: from, to: to } }
      }
    );
  }

  isSquareValid(square) {
    check(square, String);
    return !(square[0] < "a" || square[0] > "h" || square[1] < "1" || square[1] > "8");
  }

  squareOffset(square, which, offset) {
    let file = square.charCodeAt(0) - 97; /* 'a' */
    let rank = square.charCodeAt(1) - 49; /* '1' */
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    if (which === "rank") {
      rank += offset;
    } else if (which === "file") {
      file += offset;
    }
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return;
    return String.fromCharCode(file + 97) + String.fromCharCode(rank + 49);
  }

  declineLocalDraw(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    check(game_id, String);
    const self = Meteor.user();
    const game = this.getAndCheck(self, message_identifier, game_id);

    if (!game) return;

    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const othercolor = self._id === game.white.id ? "black" : "white";
    const setobject = {};
    const otheruser = othercolor === "white" ? game.white.id : game.black.id;

    setobject["pending." + othercolor + ".draw"] = "0";
    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "draw_declined", issuer: self._id } },
        $set: setobject
      }
    );

    ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].draw, "DRAW_DECLINED");
  }

  declineLocalAbort(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    check(game_id, String);
    const self = Meteor.user();
    const game = this.getAndCheck(self, message_identifier, game_id);

    if (!game) return;

    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const othercolor = self._id === game.white.id ? "black" : "white";
    const setobject = {};
    const otheruser = othercolor === "white" ? game.white.id : game.black.id;

    setobject["pending." + othercolor + ".abort"] = "0";
    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "abort_declined", issuer: self._id } },
        $set: setobject
      }
    );

    ClientMessages.sendMessageToClient(otheruser, game.pending[othercolor].abort, "ABORT_DECLINED");
  }

  declineLocalAdjourn(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    check(game_id, String);
    const self = Meteor.user();
    const game = this.getAndCheck(self, message_identifier, game_id);

    if (!game) return;

    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    const othercolor = self._id === game.white.id ? "black" : "white";
    const setobject = {};
    const otheruser = othercolor === "white" ? game.white.id : game.black.id;

    setobject["pending." + othercolor + ".adjourn"] = "0";
    this.GameCollection.update(
      { _id: game_id, status: "playing" },
      {
        $push: { actions: { type: "adjourn_declined", issuer: self._id } },
        $set: setobject
      }
    );

    ClientMessages.sendMessageToClient(
      otheruser,
      game.pending[othercolor].adjourn,
      "ADJOURN_DECLINED"
    );
  }

  resignLocalGame(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.getAndCheck(self, message_identifier, game_id);
    if (!game) return;
    if (game.status !== "playing") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_A_GAME");
      return;
    }

    this._resignLocalGame(message_identifier, game, self._id, 0);
  }

  _resignLocalGame(message_identifier, game, userId, reason) {
    check(reason, Number);
    this.endGamePing(game._id);
    this.endMoveTimer(game._id);

    const result = userId === game.white.id ? "0-1" : "1-0";
    let action_string;

    switch (reason) {
      case 0:
        action_string = "resign";
        break;
      case 4:
        action_string = "disconnect";
        break;
      default:
        throw new Meteor.Error("Unable to resign game", "Unknown reason code " + reason);
    }

    const examiners = [];
    if (game.white.id !== "computer")
      examiners.push({ id: game.white.id, username: game.white.name });
    if (game.black.id !== "computer")
      examiners.push({ id: game.black.id, username: game.black.name });

    this.GameCollection.update(
      { _id: game._id, status: "playing" },
      {
        $addToSet: {
          observers: {
            $each: examiners
          }
        },
        $push: {
          actions: { type: action_string, issuer: userId }
        },
        $unset: { pending: 1 },
        $set: {
          status: "examining",
          examiners: examiners,
          result: result,
          status2: reason
        }
      }
    );

    Users.setGameStatus(message_identifier, game.white.id, "examining");
    Users.setGameStatus(message_identifier, game.black.id, "examining");
    this.updateUserRatings(game, result, reason);
    GameHistory.savePlayedGame(message_identifier, game._id);
    this.sendGameStatus(game._id, game.white.id, game.black.id, game.tomove, result, reason);
  }

  recordLegacyOffers(
    message_identifier,
    game_number,
    wdraw,
    bdraw,
    wadjourn,
    badjourn,
    wabort,
    babort,
    wtakeback,
    btakeback
  ) {
    check(message_identifier, String);
    check(wdraw, Boolean);
    check(bdraw, Boolean);
    check(wadjourn, Boolean);
    check(badjourn, Boolean);
    check(wabort, Boolean);
    check(babort, Boolean);
    check(wtakeback, Number);
    check(btakeback, Number);

    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ legacy_game_number: game_number });
    if (!game)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to record offers",
        "Unable to find legacy game record"
      );
    if (game.white.id !== self._id && game.black.id !== self._id)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to record offers",
        "Player is neither white nor black"
      );
  }

  determineWhite(p1, p2, color) {
    if (color === "white") return p1;
    if (color === "black") return p2;

    // TODO: Obviously this has to be a far better algorithm based on the games both players have recently played
    if (Math.random() <= 0.5) return p1;
    else return p2;
  }

  hasOwnedGame(user_or_id) {
    check(user_or_id, Match.OneOf(Object, String));
    const id = typeof user_or_id === "object" ? user_or_id._id : user_or_id;
    const private_game = this.GameCollection.findOne({
      status: "examining",
      owner: id,
      private: true
    });
    if (!private_game) return false;
    return private_game.observers.length > 1;
  }

  isPlayingGame(user_or_id) {
    check(user_or_id, Match.OneOf(Object, String));
    const id = typeof user_or_id === "object" ? user_or_id._id : user_or_id;
    return (
      this.GameCollection.find({
        $and: [{ status: "playing" }, { $or: [{ "white.id": id }, { "black.id": id }] }]
      }).count() !== 0
    );
  }

  deleteVariationNode(movelist, cmi) {
    if (!cmi) throw new Meteor.error("INVALID_CMI");
    const new_movelist = [];
    this.rebuildVariationNodes(cmi, movelist, new_movelist, 0);
    return new_movelist;
  }

  rebuildVariationNodes(cmi_to_delete, old_movelist, new_movelist, old_cmi) {
    if (old_cmi === cmi_to_delete) return;
    const new_cmi = new_movelist.length;
    new_movelist.push(old_movelist[old_cmi]);
    if (!!new_movelist[new_cmi].variations) {
      const old_variations = new_movelist[new_cmi].variations;
      new_movelist[new_cmi].variations = old_variations
        .map(oldvarcmi => {
          return this.rebuildVariationNodes(cmi_to_delete, old_movelist, new_movelist, oldvarcmi);
        })
        .filter(newvarcmi => !!newvarcmi);
    }
    return new_cmi;
  }

  sendCommand(message_identifier, game_id, command) {
    check(message_identifier, String);
    check(game_id, String);
    check(command, String);

    const self = Meteor.user();
    check(self, Object);
  }

  moveToCMI(message_identifier, game_id, cmi) {
    check(game_id, String);
    check(cmi, Number);

    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({
      _id: game_id,
      status: "examining",
      "examiners.id": self._id
    });
    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (game.cmi === cmi) return;
    // if (cmi === 0) {
    //   if (game.tags && !!game.tags.FEN) active_games[game_id].load(game.tags.FEN);
    //   else active_games[game_id].load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    //
    //   this.GameCollection.update(
    //     { _id: game_id, status: "examining" },
    //     {
    //       $set: {
    //         "variations.cmi": 0,
    //         fen: active_games[game_id].fen(),
    //         tomove: active_games[game_id] === "w" ? "white" : "black"
    //       },
    //       $push: {
    //         actions: {
    //           type: "move_to_fen",
    //           issuer: self._id,
    //           parameter: { cmi: 0 }
    //         }
    //       }
    //     }
    //   );
    // }

    if (!active_games[game_id])
      throw new ICCMeteorError(
        message_identifier,
        "Unable to move forward",
        "Unable to find active game"
      );

    const chessObject = active_games[game_id];
    const variation = game.variations;

    //
    // First, get the entire list of CMI values up the tree
    // from the desired location. We do it this way because
    // when we find the matching spot, we will need to use
    // this to traverse back down.
    //
    let cmilist = [cmi];
    let current_cmi = cmi;
    while (!!current_cmi) {
      current_cmi = variation.movelist[current_cmi].prev;
      cmilist.unshift(current_cmi);
    }
    if (!cmilist.length) cmilist = [0];

    //
    // Now make current_cmi whatever value matches in both trees
    // It could go all the way back up to move zero, but it may not.
    //
    let backtrack_to_cmi = variation.cmi;
    while (!cmilist.some(pcmi => pcmi === backtrack_to_cmi))
      backtrack_to_cmi = variation.movelist[backtrack_to_cmi].prev;

    //
    // Remove all of the unnecesary cmi values from the traversal list.
    //
    const idx = cmilist.indexOf(backtrack_to_cmi);
    cmilist = cmilist.slice(idx + 1);

    //
    // Undo all of the moves to the shared node
    //
    current_cmi = variation.cmi;
    while (current_cmi !== backtrack_to_cmi) {
      chessObject.undo();
      current_cmi = variation.movelist[current_cmi].prev;
    }

    cmilist.forEach(new_cmi => {
      if (!new_cmi) return;
      const result = chessObject.move(variation.movelist[new_cmi].move);
      if (!result) {
        log.fatal("Unable to move to new CMI", {
          cmi: cmi,
          cmilist: cmilist,
          new_cmi: new_cmi,
          backtrack_to_cmi: backtrack_to_cmi,
          gamecmi: variation.cmi,
          move: variation.movelist[new_cmi].move
        });
        throw new ICCMeteorError(
          message_identifier,
          "Unable to move to new CMI",
          "Some move attempt failed",
          "Internal server error"
        );
      }
    });

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: {
          "variations.cmi": cmi,
          fen: chessObject.fen(),
          tomove: chessObject.turn() === "w" ? "white" : "black"
        },
        $push: {
          actions: {
            type: "move_to_fen",
            issuer: self._id,
            parameter: { cmi: cmi }
          }
        }
      }
    );
  }

  moveForward(message_identifier, game_id, move_count, variation_index) {
    const movecount = move_count || 1;
    check(game_id, String);
    check(movecount, Number);
    check(variation_index, Match.Maybe(Number));

    const self = Meteor.user();
    check(self, Object);

    let vi = variation_index;
    const game = this.GameCollection.findOne({
      _id: game_id,
      status: "examining",
      "examiners.id": self._id
    });
    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (!active_games[game_id])
      throw new ICCMeteorError(
        message_identifier,
        "Unable to move forward",
        "Unable to find active game"
      );

    const chessObject = active_games[game_id];
    const variation = game.variations;

    for (let x = 0; x < move_count; x++) {
      const move = variation.movelist[variation.cmi];
      if (!move.variations || !move.variations.length) {
        ClientMessages.sendMessageToClient(self, message_identifier, "END_OF_GAME");
        return;
      } else if (move.variations.length === 1 && !!vi) {
        ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_VARIATION");
        break;
      } else if (
        move.variations.length > 1 &&
        (vi === undefined || vi === null || vi >= move.variations.length)
      ) {
        ClientMessages.sendMessageToClient(self, message_identifier, "VARIATION_REQUIRED");
        break;
      } else {
        variation.cmi = variation.movelist[variation.cmi].variations[vi || 0];
        const forwardmove = variation.movelist[variation.cmi];
        const result = chessObject.move(forwardmove.move);
        if (!result)
          throw new ICCMeteorError(
            message_identifier,
            "Unable to movr forward",
            "Somehow we have an illegal move in the variation tree"
          );
      }
      vi = undefined;
    }

    // TODO: We had to update the fen, so now we are here.
    //       But, the actual forward move count is incorrect! We need to do what?
    //       Either record the requested AND actual move count, or
    //       just record the actual, throwing away the requested move count.
    //       OR, figure out how to undo what was done to the chess object
    //       and the variations.cmi
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: {
          "variations.cmi": variation.cmi,
          fen: chessObject.fen(),
          tomove: chessObject.turn() === "w" ? "white" : "black"
        },
        $push: {
          actions: {
            type: "move_forward",
            issuer: self._id,
            parameter: { movecount: movecount, variation: variation_index }
          }
        }
      }
    );
  }

  moveBackward(message_identifier, game_id, move_count) {
    check(message_identifier, String);
    check(game_id, String);
    check(move_count, Match.Maybe(Number));

    const movecount = move_count || 1;
    check(game_id, String);

    check(movecount, Number);
    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({
      _id: game_id,
      status: "examining",
      "examiners.id": self._id
    });

    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    if (!active_games[game_id])
      throw new ICCMeteorError(
        message_identifier,
        "Unable to move backwards",
        "Unable to find active game"
      );

    if (movecount > active_games[game_id].history().length) {
      ClientMessages.sendMessageToClient(self, message_identifier, "BEGINNING_OF_GAME");
      return;
    }

    const variation = game.variations;

    for (let x = 0; x < movecount; x++) {
      const undone = active_games[game_id].undo();
      const current = variation.movelist[variation.cmi];
      if (undone.san !== current.move)
        throw new ICCMeteorError(
          message_identifier,
          "Unable to move backward",
          "Mismatch between chess object and variation object"
        );
      variation.cmi = variation.movelist[variation.cmi].prev;
    }

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: {
          "variations.cmi": variation.cmi,
          fen: active_games[game_id].fen(),
          tomove: active_games[game_id].turn() === "w" ? "white" : "black"
        },
        $push: {
          actions: {
            type: "move_backward",
            issuer: self._id,
            parameter: movecount
          }
        }
      }
    );
  }

  //
  // Obviously, make sure you never expose "server_command" through any Meteor.method().
  // As of this writing, no Meteor.method() calls this.
  //
  localUnobserveAllGames(message_identifier, user_id, server_command, due_to_logout) {
    check(message_identifier, String);
    check(user_id, String);
    check(server_command, Match.Maybe(Boolean));
    check(due_to_logout, Match.Maybe(Boolean));
    this.GameCollection.find(
      { $or: [{ "observers.id": user_id }, { "requestors.id": user_id }] },
      { fields: { _id: 1 } }
    )
      .fetch()
      .forEach(game =>
        this.localRemoveObserver("server", game._id, user_id, server_command, due_to_logout)
      );
  }

  localResignAllGames(message_identifier, user_id, reason) {
    const playing = this.GameCollection.find({
      $and: [{ status: "playing" }, { $or: [{ "white.id": user_id }, { "black.id": user_id }] }]
    }).fetch();
    playing.forEach(game => this._resignLocalGame("server", game, user_id, reason));
  }

  exportToPGN(id) {
    check(id, String);

    const game = this.GameCollection.findOne({ _id: id });

    if (!game) return;
    return exportGameObjectToPGN(game);
  }

  findVariation(move, idx, movelist) {
    if (
      !move ||
      !movelist ||
      idx === undefined ||
      idx === null ||
      idx >= movelist.length ||
      !movelist[idx].variations
    )
      return;

    for (let x = 0; x < movelist[idx].variations.length; x++) {
      const vi = movelist[idx].variations[x];
      if (movelist[vi].move === move) return vi;
    }
  }

  addMoveToMoveList(variation_object, move, current, piece, color, from, to, promotion) {
    const exists = this.findVariation(move, variation_object.cmi, variation_object.movelist);

    if (exists) {
      variation_object.cmi = exists;
    } else {
      const newi = variation_object.movelist.length;
      variation_object.movelist.push({
        move: move,
        smith: { piece, color, from, to, promotion },
        prev: variation_object.cmi,
        current: current
      });

      if (!variation_object.movelist[variation_object.cmi].variations) {
        variation_object.movelist[variation_object.cmi].variations = [newi];
      } else {
        variation_object.movelist[variation_object.cmi].variations.push(newi);
      }
      variation_object.cmi = newi;

      this.update_eco(variation_object);
    }
    return !exists;
  }

  update_eco(variation_object) {
    if (!this.tree) return;
    console.log("here we are");
  }

  clearBoard(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    active_games[game_id].clear();
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: { actions: { type: "clearboard", issuer: self._id } }
        }
      );
    }
  }

  setStartingPosition(message_identifier, game_id) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    active_games[game_id].reset();
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: { actions: { type: "initialposition", issuer: self._id } }
        }
      );
    }
  }

  loadFen(message_identifier, game_id, fen_string) {
    check(message_identifier, String);
    check(game_id, String);
    check(fen_string, String);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    if (!active_games[game_id].load(fen_string)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_FEN");
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: { actions: { type: "loadfen", issuer: self._id, parameter: { fen: fen } } }
        }
      );
    }
  }

  addPiece(message_identifier, game_id, color, piece, where) {
    check(message_identifier, String);
    check(game_id, String);
    check(color, String);
    check(piece, String);
    check(where, String);
    if (color !== "w" && color !== "b") throw new Match.Error("color must be 'w' or 'b'");
    if (piece.length !== 1 || "rbnkqp".indexOf(piece) === -1)
      throw new Match.Error("piece must be one of: r, b, n, k, q, p");
    if (!this.isSquareValid(where)) throw new Match.Error("where is invalid: " + where);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const result = active_games[game_id].put({ type: piece, color: color }, where);
    if (!result) {
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: {
            actions: {
              type: "addpiece",
              issuer: self._id,
              parameter: { color: color, piece: piece, square: where }
            }
          }
        }
      );
    }
  }

  removePiece(message_identifier, game_id, where) {
    check(message_identifier, String);
    check(game_id, String);
    check(where, String);
    if (!this.isSquareValid(where)) throw new Match.Error("where is invalid: " + where);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const result = active_games[game_id].remove(where);
    if (!result) {
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: {
            actions: { type: "removepiece", issuer: self._id, parameter: { square: where } }
          }
        }
      );
    }
  }

  setToMove(message_identifier, game_id, color) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const fenarray = active_games[game_id].fen().split(" ");
    fenarray[1] = color;
    const newfen = fenarray.join(" ");
    const valid = active_games[game_id].validate_fen(newfen).valid;
    if (!valid) {
      return;
    }
    const result = active_games[game_id].load(newfen);
    if (!result) {
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            tomove: color === "w" ? "white" : "black",
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: { actions: { type: "settomove", issuer: self._id, parameter: { color: color } } }
        }
      );
    }
  }

  setCastling(message_identifier, game_id, white, black) {
    check(message_identifier, String);
    check(game_id, String);
    check(white, String);
    check(black, String);
    if (white.length !== 0 && ["k", "q", "kq"].indexOf(white) === -1)
      throw new Match.Error("castling must be empty (''), or 'k', 'q', 'kq'");
    if (black.length !== 0 && ["k", "q", "kq"].indexOf(black) === -1)
      throw new Match.Error("castling must be empty (''), or 'k', 'q', 'kq'");
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    const fenarray = active_games[game_id].fen().split(" ");
    fenarray[2] = white.toUpperCase() + black;
    const newfen = fenarray.join(" ");
    const valid = active_games[game_id].validate_fen(newfen).valid;
    if (!valid) {
      return;
    }
    const result = active_games[game_id].load(newfen);
    if (!result) {
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: {
            actions: { type: "setcastling", issuer: self._id, parameter: { castling: fenarray[2] } }
          }
        }
      );
    }
  }

  setEnPassant(message_identifier, game_id, where) {
    check(message_identifier, String);
    check(game_id, String);
    const self = Meteor.user();
    check(self, Object);

    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }
    if (!this.isSquareValid(where)) throw new Match.Error("where is invalid: " + where);

    const piece = active_games[game_id].get(where);
    if (!piece || piece.type !== "p") return;
    const newwhere = this.squareOffset(where, "rank", piece.color === "w" ? -1 : 1);
    if (!newwhere) return;
    const fenarray = active_games[game_id].fen().split(" ");
    fenarray[3] = newwhere;
    const newfen = fenarray.join(" ");
    const valid = active_games[game_id].validate_fen(newfen).valid;
    if (!valid) {
      return;
    }
    const result = active_games[game_id].load(newfen);
    if (!result) {
      return;
    }
    const fen = active_games[game_id].fen();
    if (game.fen !== fen) {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            fen: fen,
            variations: { cmi: 0, movelist: [{}], ecocodes: [] },
            "tags.FEN": fen
          },
          $push: {
            actions: { type: "setenpassant", issuer: self._id, parameter: { piece: where } }
          }
        }
      );
    }
  }

  setTag(message_identifier, game_id, tag, value) {
    check(message_identifier, String);
    check(game_id, String);
    check(tag, String);
    check(value, String);
    const self = Meteor.user();
    check(self, Object);
    const game = this.GameCollection.findOne({ _id: game_id, "examiners.id": self._id });
    if (!game || game.status !== "examining") {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AN_EXAMINER");
      return;
    }

    const setobject = {};
    switch (tag) {
      case "FEN":
        if (!active_games[game_id].validate_fen(value).valid) return;
        if (!active_games[game_id].load(value)) return;
        if (game.fen === active_games[game_id].fen()) return;
        setobject.fen = active_games[game_id].fen();
        setobject.tomove = active_games[game_id].turn() === "w" ? "white" : "black";
        setobject.variations = { cmi: 0, movelist: [{}], ecocodes: [] };
        break;
      case "White":
        if (game.white.name === value) return;
        setobject["white.name"] = value;
        break;
      case "Black":
        if (game.black.name === value) return;
        setobject["black.name"] = value;
        break;
      case "Result":
        if (game.result === value) return;
        setobject.result = value;
        break;
      case "WhiteUSCF":
      case "WhiteElo":
        if (game.white.rating === parseInt(value)) return;
        setobject["white.rating"] = parseInt(value);
        break;
      case "BlackUSCF":
      case "BlackElo":
        if (game.black.rating === parseInt(value)) return;
        setobject["black.rating"] = parseInt(value);
        break;
      default:
        break;
    }
    if (Object.entries(setobject).length === 0) {
      if (!!game.tags && tag in game.tags && game.tags[tag] === value) return;
      setobject["tags." + tag] = value;
    }
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      {
        $set: setobject,
        $push: {
          actions: { type: "settag", issuer: self._id, parameter: { tag: tag, value: value } }
        }
      }
    );
  }

  changeOwner(message_identifier, game_id, new_id) {
    check(message_identifier, String);
    check(game_id, String);
    check(new_id, Match.Maybe(String));

    const self = Meteor.user();
    check(self, Object);

    if (!Users.isAuthorized(self, "allow_change_owner")) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_CHANGE_OWNER");
      return;
    }

    if (new_id !== undefined && new_id !== null) {
      const other = Meteor.users.findOne({ _id: new_id });

      if (!other) {
        ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_CHANGE_OWNER");
        return;
      }
    }

    const game = this.GameCollection.findOne({ _id: game_id });

    if (!game || game.status !== "examining" || game.owner !== self._id) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_CHANGE_OWNER");
      return;
    }

    // For now anyway, a new owner must also be an observer at least
    if (!!new_id && !game.observers.some(e => e.id === new_id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_CHANGE_OWNER");
      return;
    }

    if (!new_id) {
      this.setPrivate(message_identifier, game_id, false);
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        { $unset: { owner: 1, deny_chat: 1 } }
      );
    } else {
      this.GameCollection.update(
        { _id: game_id, status: "examining" },
        { $set: { owner: new_id } }
      );
    }
  }

  setPrivate(message_identifier, game_id, is_private) {
    check(message_identifier, String);
    check(game_id, String);
    check(is_private, Match.Maybe(Boolean));

    const self = Meteor.user();
    check(self, Object);

    if (!Users.isAuthorized(self, "allow_private_games")) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PRIVATIZE");
      return;
    }

    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game || game.status !== "examining" || game.owner !== self._id) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_PRIVATIZE");
      return;
    }

    if (game.private === is_private) return;

    const updateobject = {};
    updateobject.$set = { private: is_private };

    if (!is_private) {
      if (game.requestors !== undefined)
        updateobject.$addToSet = { observers: { $each: game.requestors } };
      updateobject.$unset = { requestors: 1, deny_requests: 1 };
    } else {
      updateobject.$set.analysis = game.observers;
    }

    this.GameCollection.update({ _id: game_id, status: "examining" }, updateobject);
  }

  allowRequests(message_identifier, game_id, allow_requests) {
    check(message_identifier, String);
    check(game_id, String);
    check(allow_requests, Boolean);

    const self = Meteor.user();
    check(self, Object);

    if (!Users.isAuthorized(self, "allow_private_games")) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_AUTHORIZED");
      return;
    }

    const game = this.GameCollection.findOne({ _id: game_id });
    if (game && game.status === "examining") {
      if (game.owner !== self._id) {
        ClientMessages.sendMessageToClient(self, message_identifier, "NOT_THE_OWNER");
        return;
      } else if (!game.private) {
        ClientMessages.sendMessageToClient(
          self,
          message_identifier,
          "COMMAND_INVALID_ON_PUBLIC_GAME"
        );
        return;
      }
    } else {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_COMMAND");
      return;
    }

    if (game.deny_requests === !allow_requests) return;

    const updateobject = {};
    updateobject.$set = { deny_requests: !allow_requests };

    if (!allow_requests && game.requestors !== undefined) {
      updateobject.$unset = { requestors: 1 };
      game.requestors.forEach(req =>
        ClientMessages.sendMessageToClient(req.id, "server:privaterequest:" + game_id, "DENIED?")
      );
    }

    this.GameCollection.update({ _id: game_id, status: "examining" }, updateobject);
  }

  allowChat(message_identifier, game_id, allow_chat) {
    check(message_identifier, String);
    check(game_id, String);
    check(allow_chat, Boolean);

    const self = Meteor.user();
    check(self, Object);

    if (!Users.isAuthorized(self, "allow_restrict_chat")) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_RESTRICT_CHAT");
      return;
    }

    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game || game.status !== "examining" || game.owner !== self._id || !game.private) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_RESTRICT_CHAT");
      return;
    }

    if (game.deny_chat === !allow_chat) return;

    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      { $set: { deny_chat: !allow_chat } }
    );
  }

  allowAnalysis(message_identifier, game_id, user_id, allow_analysis) {
    check(message_identifier, String);
    check(game_id, String);
    check(user_id, String);
    check(allow_analysis, Boolean);

    const self = Meteor.user();
    check(self, Object);

    if (!Users.isAuthorized(self, "allow_restrict_analysis")) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_RESTRICT_ANALYSIS");
      return;
    }

    const otherguy = Meteor.users.findOne({ _id: user_id });
    check(otherguy, Object);

    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game || game.status !== "examining" || self._id !== game.owner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_THE_OWNER");
      return;
    }

    if (!game.private || user_id === game.owner || !game.observers.some(ob => ob.id === user_id)) {
      ClientMessages.sendMessageToClient(self, message_identifier, "UNABLE_TO_RESTRICT_ANALYSIS");
      return;
    }

    if (
      (!allow_analysis && !game.analysis) ||
      (!!game.analysis && allow_analysis === game.analysis.some(a => a.id === user_id))
    )
      return; // Already in or not

    const updateobject = {};
    if (game.analysis) {
      updateobject[allow_analysis ? "$addToSet" : "$pull"] = {
        analysis: { id: user_id, username: otherguy.username }
      };
    } else if (allow_analysis) {
      updateobject.$set = { analysis: [{ id: user_id, username: otherguy.username }] };
    }

    this.GameCollection.update({ _id: game_id, status: "examining" }, updateobject);
  }

  localDenyObserver(message_identifier, game_id, requestor_id) {
    check(message_identifier, String);
    check(game_id, String);
    check(requestor_id, String);

    const self = Meteor.user();
    check(self, Object);

    if (self._id === requestor_id)
      throw new ICCMeteorError(
        message_identifier,
        "Unable to deny observer",
        "Cannot deny yourself"
      );

    const game = this.GameCollection.findOne({ _id: game_id });
    if (!game || game.status !== "examining" || self._id !== game.owner) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_THE_OWNER");
      return;
    }

    let requestor;
    if (game.requestors) requestor = game.requestors.find(r => r.id === requestor_id);
    if (!requestor) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NO_REQUESTOR");
      return;
    }

    ClientMessages.sendMessageToClient(requestor_id, requestor.mid, "PRIVATE_ENTRY_DENIED");
    this.GameCollection.update(
      { _id: game_id, status: "examining" },
      { $pull: { requestors: { id: requestor_id } } }
    );
  }

  observeUser(message_identifier, user_id) {
    check(message_identifier, String);
    check(user_id, String);
    const self = Meteor.user();
    check(self, Object);

    const user = Meteor.users.findOne({ _id: user_id, isolation_group: self.isolation_group });
    if (!user) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_USER");
      return;
    }

    const game = this.GameCollection.findOne({
      $or: [{ "white.id": user_id }, { "black.id": user_id }, { "examiners.id": user_id }]
    });

    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_OR_EXAMINING");
      return;
    }

    if (game.private) {
      ClientMessages.sendMessageToClient(self, message_identifier, "PRIVATE_GAME");
      return;
    }

    this.localAddObserver(message_identifier, game._id, self._id);
  }

  unObserveUser(message_identifier, user_id, game_id) {
    check(message_identifier, String);
    check(user_id, String);
    const self = Meteor.user();
    check(self, Object);

    const user = Meteor.users.findOne({ _id: user_id, isolation_group: self.isolation_group });
    if (!user) {
      ClientMessages.sendMessageToClient(self, message_identifier, "INVALID_USER");
      return;
    }

    const game = this.GameCollection.findOne({ _id: game_id });

    if (!game) {
      ClientMessages.sendMessageToClient(self, message_identifier, "NOT_PLAYING_OR_EXAMINING");
      return;
    }

    if (game.private) {
      ClientMessages.sendMessageToClient(self, message_identifier, "PRIVATE_GAME");
      return;
    }

    this.localRemoveObserver(message_identifier, game._id, self._id);
  }

  startGamePing(game_id, computer_color) {
    if (computer_color !== "white") this._startGamePing(game_id, "white");
    if (computer_color !== "black") this._startGamePing(game_id, "black");
  }

  _startGamePing(game_id, color) {
    if (!game_pings[game_id]) game_pings[game_id] = {};
    game_pings[game_id][color] = new TimestampServer(
      (key, msg) => {
        if (key === "ping") {
          const pushobject = {};
          pushobject["lag." + color + ".active"] = msg;
          this.GameCollection.update({ _id: game_id, status: "playing" }, { $push: pushobject });
        } else {
          //pingresult
          const game = this.GameCollection.findOne({
            _id: game_id,
            status: "playing"
          });
          if (!game)
            throw new ICCMeteorError("server", "Unable to set ping information", "game not found");

          const item = game.lag[color].active.find(ping => ping.id === msg.id);
          if (!item) return;

          const pushobject = {};
          const pullobject = {};

          pullobject["lag." + color + ".active"] = item;
          pushobject["lag." + color + ".pings"] = msg.delay;

          this.GameCollection.update(
            { _id: game._id, status: game.status },
            { $pull: pullobject, $push: pushobject }
          );
        }
      },
      () => {}
    );
  }

  endGamePing(game_id) {
    if (!game_pings[game_id]) {
      pinglog.error("Unable to locate game to ping (1)");
      return;
    }
    if (!!game_pings[game_id].white) game_pings[game_id].white.end();
    if (!!game_pings[game_id].black) game_pings[game_id].black.end();
    delete game_pings[game_id];
  }

  //
  // This is for simple US delay and not Bronstein delay
  // In US delay, we delay countdown for the delay
  // In Bronstein delay, we count down, but then add the delay back in when they make their move
  //
  startDelayTimer(game_id, color, delay_milliseconds, actual_milliseconds) {
    if (!!move_timers[game_id]) Meteor.clearInterval(move_timers[game_id]);

    move_timers[game_id] = Meteor.setInterval(() => {
      Meteor.clearInterval(move_timers[game_id]);
      delete move_timers[game_id];
      this.startMoveTimer(game_id, color, 0, "", actual_milliseconds);
    }, delay_milliseconds);
  }

  startMoveTimer(game_id, color, delay_milliseconds, delaytype, actual_milliseconds) {
    if (!!move_timers[game_id]) Meteor.clearInterval(move_timers[game_id]);

    if (delay_milliseconds && delaytype === "us") {
      this.startDelayTimer(game_id, color, delay_milliseconds, actual_milliseconds);
      return;
    }

    move_timers[game_id] = Meteor.setInterval(() => {
      Meteor.clearInterval(move_timers[game_id]);
      delete move_timers[game_id];
      const game = this.GameCollection.findOne({ _id: game_id, status: "playing" });
      if (!game) {
        log.error("Unable to find a game to expire time on");
        return;
      }
      const setobject = {};
      const addtosetobject = {};
      setobject.result = color === "white" ? "0-1" : "1-0";
      setobject.status2 = 2;
      setobject.status = "examining";

      this.endGamePing(game_id);

      setobject.examiners = [];
      if (game.white.id !== "computer")
        setobject.examiners.push({ id: game.white.id, username: game.white.name });
      if (game.black.id !== "computer")
        setobject.examiners.push({ id: game.black.id, username: game.black.name });
      addtosetobject.observers = { $each: setobject.examiners };
      this.GameCollection.update(
        { _id: game_id },
        {
          $set: setobject,
          $addToSet: addtosetobject,
          $unset: { pending: 1, "clocks.white.current": 1, "clocks.black.current": 1 }
        }
      );
      if (game.white.id !== "computer") Users.setGameStatus("server", game.white.id, "examining");
      if (game.black.id !== "computer") Users.setGameStatus("server", game.black.id, "examining");
      this.updateUserRatings(game, setobject.result, 2);
      GameHistory.savePlayedGame("server", game_id);
      this.sendGameStatus(game_id, game.white.id, game.black.id, color, setobject.result, 2);
    }, actual_milliseconds);
  }

  endMoveTimer(game_id) {
    const interval_id = move_timers[game_id];
    if (!interval_id) return;
    Meteor.clearInterval(interval_id);
    delete move_timers[game_id];
  }

  testingCleanupMoveTimers() {
    Object.keys(move_timers).forEach(game_id => {
      Meteor.clearInterval(move_timers[game_id]);
      delete move_timers[game_id];
    });
  }

  getStatusFromGameCollection(userId) {
    if (
      !!this.GameCollection.find({
        $and: [{ status: "playing" }, { $or: [{ "white.id": userId }, { "black.id": userId }] }]
      }).count()
    )
      return "playing";

    if (
      !!this.GameCollection.find({
        $and: [{ status: "examining" }, { $or: [{ owner: userId }, { "examiners.id": userId }] }]
      }).count()
    )
      return "examining";

    if (!!this.GameCollection.find({ "observers.id": userId }).count()) return "observing";

    return "none";
  }

  updateUserRatings(game, result, reason) {
    if (!game.rated) return;

    const white = Meteor.users.findOne({ _id: game.white.id });
    const black = Meteor.users.findOne({ _id: game.black.id });

    const whiteupdate = !!white ? white.ratings[game.rating_type] : null;
    const blackupdate = !!black ? black.ratings[game.rating_type] : null;

    if (!whiteupdate || !blackupdate)
      throw new ICCMeteorError(
        "server",
        "Unable to update ratings",
        "A rated game has ended, but I cannot find two players"
      );

    const wassess = SystemConfiguration.winDrawLossAssessValues(whiteupdate, blackupdate);
    const bassess = SystemConfiguration.winDrawLossAssessValues(blackupdate, whiteupdate);

    // reason = 0-12, a win and loss
    // reason = 13-23 is a draw
    // reason = 24-42 is abort/adjourn/etc. no update
    if (reason >= 24) return;

    if (reason < 13) {
      // somebody won
      if (result === "1-0") {
        whiteupdate.won++;
        blackupdate.lost++;
        whiteupdate.rating = wassess.win;
        blackupdate.rating = bassess.loss;
      } else {
        whiteupdate.lost++;
        blackupdate.won++;
        whiteupdate.rating = wassess.loss;
        blackupdate.rating = bassess.win;
      }
    } else {
      // they both drew
      whiteupdate.draw++;
      blackupdate.draw++;
      whiteupdate.rating = wassess.draw;
      blackupdate.rating = bassess.draw;
    }

    const wg = whiteupdate.won + whiteupdate.draw + whiteupdate.lost >= 20;
    const bg = blackupdate.won + blackupdate.draw + blackupdate.lost >= 20;

    if (wg && whiteupdate.rating > whiteupdate.best) whiteupdate.best = whiteupdate.rating;
    if (bg && blackupdate.rating > blackupdate.best) blackupdate.best = blackupdate.rating;

    const setobject = { $set: {} };
    setobject.$set["ratings." + game.rating_type] = whiteupdate;
    Meteor.users.update({ _id: white._id }, setobject);
    setobject.$set["ratings." + game.rating_type] = blackupdate;
    Meteor.users.update({ _id: black._id }, setobject);
  }

  sendGameStatus(game_id, white_id, black_id, tomove, result, status) {
    const message_identifier = "server:game:" + game_id;
    let color = tomove === "white" ? "w" : "b";
    switch (result) {
      case "1-0":
        color = "w";
        break;
      case "0-1":
        color = "b";
        break;
      default:
        break;
    }
    if (!!white_id && white_id !== "computer")
      ClientMessages.sendMessageToClient(
        white_id,
        message_identifier,
        "GAME_STATUS_" + color + status
      );
    if (!!black_id && black_id !== "computer")
      ClientMessages.sendMessageToClient(
        black_id,
        message_identifier,
        "GAME_STATUS_" + color + status
      );
  }
}

if (!global._gameObject) {
  global._gameObject = new Game();
}

module.exports.Game = global._gameObject;

GameHistory.savePlayedGame = function(message_identifier, game_id) {
  check(message_identifier, String);
  check(game_id, String);
  const game = global._gameObject.GameCollection.findOne(game_id);
  if (!game)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to save game to game history",
      "Unable to find game to save"
    );
  delete game.variations.hmtb;
  delete game.variations.cmi;
  return GameHistoryCollection.insert(game);
};

GameHistory.examineGame = function(message_identifier, game_id, is_imported_game) {
  check(message_identifier, String);
  //check(game_id, Match.OneOf(String, Object));
  check(is_imported_game, Match.Maybe(Boolean));
  const self = Meteor.user();
  check(self, Object);
  let hist;
  if (!!is_imported_game) {
    hist = ImportedGameCollection.findOne({ _id: game_id });
  } else {
    hist = GameHistoryCollection.findOne({ _id: game_id });
  }
  if (!hist)
    throw new ICCMeteorError(
      message_identifier,
      "Unable to examine saved game",
      "Unable to find game"
    );

  if (global._gameObject.isPlayingGame(self._id)) {
    ClientMessages.sendMessageToClient(self, message_identifier, "ALREADY_PLAYING");
    return;
  }

  global._gameObject.localUnobserveAllGames(message_identifier, self._id);
  return global._gameObject.startLocalExaminedGameWithObject(message_identifier, hist);
};

GameHistory.exportToPGN = function(id) {
  check(id, String);
  const game = GameHistoryCollection.findOne({ _id: id });
  if (!game) return;
  return exportGameObjectToPGN(game);
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

Meteor.publish("game_history", function() {
  return GameHistoryCollection.find(
    {
      $or: [{ "white.id": this.userId }, { "black.id": this.userId }]
    },
    { sort: { startTime: -1 }, limit: SystemConfiguration.gameHistoryCount() }
  );
});

GameHistory.collection = GameHistoryCollection;

Meteor.startup(() => {
  function initialLoad() {
    let line_number = 0;
    const content = Assets.getText("eco.txt");
    const variations = { cmi: 0, movelist: [] };

    content.split("\n").forEach(line => {
      line_number++;
      if (line.trim().length) {
        const pieces = line.split(": ");
        if (pieces.length !== 3)
          throw new Meteor.Error(
            "Unable to load ECO codes",
            "Line " + line_number + " has a syntax error"
          );
        const eco = pieces[0];
        const name = pieces[1];
        try {
          const moves = parseMoves(pieces[2]);
          variations.cmi = 0;
          moves.forEach(move => {
            global._gameObject.addMoveToMoveList(variations, move);
          });
          variations.movelist[variations.cmi].eco = eco;
          variations.movelist[variations.cmi].name = name;
        } catch (e) {
          throw new Meteor.Error(
            "Unable to load ECO codes",
            "Line " + line_number + " has an error: " + e.toString()
          );
        }
      }
    });

    variations.movelist.forEach(m => delete m.current);
    delete variations.cmi;

    global._gameObject.ecoCollection.insert(variations);
    return variations;
  }

  function trim_whitespace(object) {
    if (!object.move_string || !object.move_string.length) return false;
    object.move_string = object.move_string.trim();
    return true;
  }

  function trim_move_number(object) {
    if (!object.move_string || !object.move_string.length) return false;
    object.move_sring = object.move_string.replace("\\d+.s*(.*)", "$1");
    return true;
  }

  function get_move(object) {
    if (!object.move_string || !object.move_string.length) return false;
    const found = object.move_string.match(
      "((([RQKBN]?[a-h]?[1-8]?x?[a-h][1-8](=[RQBN])?)|O-O(?:-O)?)[+#]?)(.*)"
    );
    object.moves.push(found[1]);
    object.move_string = found[5];
    return true;
  }

  function parseMoves(move_string) {
    const object = {
      moves: [],
      move_string: move_string
    };
    while (true) {
      if (!trim_whitespace(object)) return object.moves;
      if (!trim_move_number(object)) return object.moves;
      if (!get_move(object)) return object.moves;
      if (!trim_whitespace(object)) return object.moves;
      if (!get_move(object)) return object.moves;
    }
  }

  this.tree = global._gameObject.ecoCollection.findOne();
  if (!this.tree) this.tree = initialLoad();
});

Meteor.methods({
  gamepong(game_id, pong) {
    const user = Meteor.user();
    check(game_id, String);
    check(pong, Object);
    check(user, Object);
    if (!game_pings[game_id]) return;
    const game = global._gameObject.GameCollection.findOne(
      { _id: game_id, status: "playing" },
      { fields: { "white.id": 1 } }
    );
    if (!game) {
      log.error("Unable to locate game to ping (3)");
      return;
    }
    const color = game.white.id === user._id ? "white" : "black";
    game_pings[game_id][color].pongArrived(pong);
  },
  // eslint-disable-next-line meteor/audit-argument-checks
  requestTakeback: (message_identifier, game_id, number) =>
    LegacyUser.requestTakeback(message_identifier, game_id, number),
  // global._gameObject.requestLocalTakeback(message_identifier, game_id, number),
  // eslint-disable-next-line meteor/audit-argument-checks
  acceptTakeBack: (message_identifier, game_id) =>
    LegacyUser.acceptTakeback(message_identifier, game_id),
  // global._gameObject.acceptLocalTakeback(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  declineTakeback: (message_identifier, game_id) =>
    LegacyUser.declineTakeback(message_identifier, game_id),
  // global._gameObject.declineLocalTakeback(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  resignGame: (message_identifier, game_id) => LegacyUser.resignGame(message_identifier, game_id),
  // global._gameObject.resignLocalGame(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  requestToDraw: (message_identifier, game_id) =>
    LegacyUser.requestToDraw(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  acceptDraw: (message_identifier, game_id) => LegacyUser.acceptDraw(message_identifier, game_id),
  // global._gameObject.acceptLocalDraw(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  declineDraw: (message_identifier, game_id) => LegacyUser.declineDraw(message_identifier, game_id),
  // global._gameObject.declineLocalDraw(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  requestToAbort: (message_identifier, game_id) =>
    LegacyUser.requestToAbort(message_identifier, game_id),
  // global._gameObject.requestLocalAbort(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  acceptAbort: (message_identifier, game_id) => LegacyUser.acceptAbort(message_identifier, game_id),
  // global._gameObject.acceptLocalAbort(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  declineAbort: (message_identifier, game_id) =>
    global._gameObject.declineLocalAbort(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  requestToAdjourn: (message_identifier, game_id) =>
    LegacyUser.requestToAdjourn(message_identifier, game_id),
  //  global._gameObject.requestLocalAdjourn(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  acceptAdjourn: (message_identifier, game_id) =>
    LegacyUser.acceptAdjourn(message_identifier, game_id),
  // global._gameObject.acceptLocalAdjourn(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  declineAdjourn: (message_identifier, game_id) =>
    LegacyUser.declineAdjourn(message_identifier, game_id),
  // global._gameObject.declineLocalAdjourn(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  drawCircle: (message_identifier, game_id, square, color, size) =>
    global._gameObject.drawCircle(message_identifier, game_id, square, color, size),
  // eslint-disable-next-line meteor/audit-argument-checks
  removeCircle: (message_identifier, game_id, square) =>
    global._gameObject.removeCircle(message_identifier, game_id, square),
  // eslint-disable-next-line meteor/audit-argument-checks
  startBotGame: (
    // eslint-disable-next-line meteor/audit-argument-checks
    message_identifier,
    // eslint-disable-next-line meteor/audit-argument-checks
    wild_number,
    // eslint-disable-next-line meteor/audit-argument-checks
    rating_type,
    // eslint-disable-next-line meteor/audit-argument-checks
    white_initial,
    // eslint-disable-next-line meteor/audit-argument-checks
    white_increment_or_delay,
    // eslint-disable-next-line meteor/audit-argument-checks
    white_increment_or_delay_type,
    // eslint-disable-next-line meteor/audit-argument-checks
    black_initial,
    // eslint-disable-next-line meteor/audit-argument-checks
    black_increment_or_delay,
    // eslint-disable-next-line meteor/audit-argument-checks
    black_increment_or_delay_type,
    // eslint-disable-next-line meteor/audit-argument-checks
    skill_level,
    // eslint-disable-next-line meteor/audit-argument-checks
    color,
    // eslint-disable-next-line meteor/audit-argument-checks
    examined_game_id
  ) =>
    global._gameObject.startBotGame(
      message_identifier,
      wild_number,
      rating_type,
      white_initial,
      white_increment_or_delay,
      white_increment_or_delay_type,
      black_initial,
      black_increment_or_delay,
      black_increment_or_delay_type,
      color,
      skill_level,
      examined_game_id
    ),
  // eslint-disable-next-line meteor/audit-argument-checks
  startLocalExaminedGame: (message_identifier, white_name, black_name, wild_number) =>
    global._gameObject.startLocalExaminedGame(
      message_identifier,
      white_name,
      black_name,
      wild_number
    ),
  // eslint-disable-next-line meteor/audit-argument-checks
  importPGNIntoExaminedGame: (message_identifier, game_id, pgntext) =>
    global._gameObject.importPGNIntoExaminedGame(message_identifier, game_id, pgntext),
  // eslint-disable-next-line meteor/audit-argument-checks
  moveBackward: (message_identifier, game_id, move_count) =>
    global._gameObject.moveBackward(message_identifier, game_id, move_count),
  // eslint-disable-next-line meteor/audit-argument-checks
  moveForward: (message_identifier, game_id, move_count, variation_index) =>
    global._gameObject.moveForward(message_identifier, game_id, move_count, variation_index),
  // eslint-disable-next-line meteor/audit-argument-checks
  searchGameHistory: (message_identifier, game_id, offset, count) =>
    GameHistory.search(message_identifier, game_id, offset, count),
  // eslint-disable-next-line meteor/audit-argument-checks
  examineGame: (message_identifier, game_id, is_imported_game) =>
    GameHistory.examineGame(message_identifier, game_id, is_imported_game),
  // eslint-disable-next-line meteor/audit-argument-checks
  clearBoard: (message_identifier, game_id) =>
    global._gameObject.clearBoard(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  setStartingPosition: (message_identifier, game_id) =>
    global._gameObject.setStartingPosition(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  loadFen: (message_identifier, game_id, fen_string) =>
    global._gameObject.loadFen(message_identifier, game_id, fen_string),
  // eslint-disable-next-line meteor/audit-argument-checks
  addPiece: (message_identifier, game_id, color, piece, where) =>
    global._gameObject.addPiece(message_identifier, game_id, color, piece, where),
  // eslint-disable-next-line meteor/audit-argument-checks
  removePiece: (message_identifier, game_id, where) =>
    global._gameObject.removePiece(message_identifier, game_id, where),
  // eslint-disable-next-line meteor/audit-argument-checks
  setToMove: (message_identifier, game_id, color) =>
    global._gameObject.setToMove(message_identifier, game_id, color),
  // eslint-disable-next-line meteor/audit-argument-checks
  setCastling: (message_identifier, game_id, white, black) =>
    global._gameObject.setCastling(message_identifier, game_id, white, black),
  // eslint-disable-next-line meteor/audit-argument-checks
  setEnPassant: (message_identifier, game_id, where) =>
    global._gameObject.setEnPassant(message_identifier, game_id, where),
  // eslint-disable-next-line meteor/audit-argument-checks
  setTag: (message_identifier, game_id, tag, value) =>
    global._gameObject.setTag(message_identifier, game_id, tag, value),
  // eslint-disable-next-line meteor/audit-argument-checks
  changeOwner: (message_identifier, game_id, new_id) =>
    global._gameObject.changeOwner(message_identifier, game_id, new_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  setPrivate: (message_identifier, game_id, is_private) =>
    global._gameObject.setPrivate(message_identifier, game_id, is_private),
  // eslint-disable-next-line meteor/audit-argument-checks
  allowRequests: (message_identifier, game_id, allow_requests) =>
    global._gameObject.allowRequests(message_identifier, game_id, allow_requests),
  // eslint-disable-next-line meteor/audit-argument-checks
  allowChat: (message_identifier, game_id, allow_chat) =>
    global._gameObject.allowChat(message_identifier, game_id, allow_chat),
  // eslint-disable-next-line meteor/audit-argument-checks
  allowAnalysis: (message_identifier, game_id, user_id, allow_analysis) =>
    global._gameObject.allowAnalysis(message_identifier, game_id, user_id, allow_analysis),
  // eslint-disable-next-line meteor/audit-argument-checks
  localDenyObserver: (message_identifier, game_id, requestor_id) =>
    global._gameObject.localDenyObserver(message_identifier, game_id, requestor_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  localAddExaminer: (message_identifier, game_id, id_to_add) =>
    global._gameObject.localAddExaminer(message_identifier, game_id, id_to_add),
  // eslint-disable-next-line meteor/audit-argument-checks
  localRemoveExaminer: (message_identifier, game_id, id_to_remove) =>
    global._gameObject.localAddExaminer(message_identifier, game_id, id_to_remove),
  // eslint-disable-next-line meteor/audit-argument-checks
  localAddObserver: (message_identifier, game_id, id_to_add) =>
    global._gameObject.localAddObserver(message_identifier, game_id, id_to_add),
  // eslint-disable-next-line meteor/audit-argument-checks
  localUnobserveAllGames: (message_identifier, user_id) =>
    global._gameObject.localUnobserveAllGames(message_identifier, user_id, false, false),
  // eslint-disable-next-line meteor/audit-argument-checks
  observeUser: (message_identifier, user_id) =>
    global._gameObject.observeUser(message_identifier, user_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  unObserveUser: (message_identifier, user_id, game_id) =>
    global._gameObject.unObserveUser(message_identifier, user_id, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  exportToPGN: (message_identifier, game_id) => global._gameObject.exportToPGN(game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  drawArrow: (message_identifier, game_id, from, to, color, size) =>
    global._gameObject.drawArrow(message_identifier, game_id, from, to, color, size),
  // eslint-disable-next-line meteor/audit-argument-checks
  removeArrow: (message_identifier, game_id, from, to) =>
    global._gameObject.removeArrow(message_identifier, game_id, from, to),
  // eslint-disable-next-line meteor/audit-argument-checks
  moveToCMI: (message_identifier, game_id, cmi) =>
    global._gameObject.moveToCMI(message_identifier, game_id, cmi),
  // eslint-disable-next-line meteor/audit-argument-checks
  sendCommand: (message_identifier, game_id, command) =>
    global._gameObject.sendCommand(message_identifier, game_id, command)
});
