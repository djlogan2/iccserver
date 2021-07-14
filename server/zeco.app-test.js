import { TestHelpers } from "../imports/server/TestHelpers";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import Chess from "chess.js"
import { GameHistory} from "./Game";
import { buildPgnFromMovelist } from "../lib/exportpgn";

describe("ecocodes", function(){
  const self = TestHelpers.setupDescribe.apply(this);

  describe("recursive_eco", function() {
    it("should return an eco code if the node already has one", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["g3", "d5", "Nf3", "g6", "Nf6"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      let eco = Game.recursive_eco(chess_obj, game.variations.movelist, game.variations.cmi);
      chai.assert.deepEqual(eco, game.variations.movelist[game.variations.cmi].eco);
    });
    it("should return if we are on the root node", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["g3", "d5", "Nf3", "g6", "Nf6"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.getAndCheck(us, "mi1", game_id);
      if(!game) {
        chai.assert.fail("Game does not exist");
      }
      let eco = Game.recursive_eco(chess_obj, game.variations.movelist, 0);
      chai.assert.deepEqual(eco, {name: "NO_ECO", code: "NO_ECO"});
    });
    it("should return the ecorecord from the database if one exists", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.getAndCheck(us, "mi1", game_id);
      if(!game) {
        chai.assert.fail("Game does not exist");
      }


      game.variations.movelist[game.variations.cmi].eco = Game.recursive_eco(chess_obj, game.variations.movelist, game.variations.cmi);
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: name2, code: code2 });
      Game.saveLocalMove("b3", game_id, "b3");
      chess_obj.move("b3");
      game.variations.movelist[game.variations.cmi].eco = {
        name: "",
        code: "",
      };
      game.variations.movelist[game.variations.cmi].eco = Game.recursive_eco(chess_obj, game.variations.movelist, game.variations.cmi);
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: name2, code: code2 });

      game.variations.movelist.forEach((move, index) => {
          chai.assert.notEqual(move.eco.name, "");
          chai.assert.notEqual(move.eco.code, "");
      });
    });
  });
  describe("load_eco", function() {
    it("should return an eco code if the node already has one", function () {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }
      game.variations.movelist[game.variations.cmi].eco = {
        name: "",
        code: "",
      };
      Game.load_eco(chess_obj, game.variations);
      let eco = {
        name: "King's Indian Attack",
        code: "A08",
      };
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, eco);
    });
    it("should return if we are on the root node", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      let chess_obj = new Chess.Chess();
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }
      Game.load_eco(chess_obj, game.variations);
      chai.assert.deepEqual(game.variations.movelist[0].eco, {name:"NO_ECO", code: "NO_ECO"});
    });
    it("should return the ecorecord from the database if one exists", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }
      game.variations.movelist[game.variations.cmi].eco = {
        name: "",
        code: "",
      };
      Game.load_eco(chess_obj, game.variations);
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, {name: "King's Indian Attack", code:"A08"});
      Game.saveLocalMove("b3", game_id, "b3");
      chess_obj.move("b3");
      game.variations.movelist[game.variations.cmi].eco = {
        name: "",
        code: "",
      };
      Game.load_eco(chess_obj, game.variations);
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, {name:"King's Indian Attack", code:"A08"});
    })
  });
  describe("moveForward", function(){
    it("should load an eco code with an eco entry for each node visited by moveForward", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];

      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        tm = !tm ? 1 : 0;
      });

      Game.resignLocalGame("moveForwardTestGameEnd", game_id);

      const game = Game.getAndCheck(us, "mi1", game_id);
      if (!game) {
        chai.assert.fail("Game does not exist");
      }

      Game.moveBackward("mi1", game_id, 5);

      game.variations.movelist.forEach((move) => {
        move.eco = { name: "", code: "" };
      })
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            "variations.movelist": game.variations.movelist,
          },
        }
      );
      Game.moveForward("mi1", game_id, 5);

      let game2 = Game.GameCollection.findOne({game_id: this.game_id});
      if (!game2) {
        chai.assert.fail("Game collection doesn't exist");
      }

      // Check if moveForward loads eco information into each node since all nodes should have been visited.
      game2.variations.movelist.forEach((move) => {
        chai.assert.isDefined(move.eco, "movelist.eco should be saved to the database");
        chai.assert.isDefined(move.eco.name, "movelist.eco.name should be saved to the database");
        chai.assert.isDefined(move.eco.code, "movelist.eco.code should be saved to the database");
      });
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, { name: "King's Indian Attack", code: "A08" });

      Game.moveBackward("mi1", game_id, 3);

      game.variations.movelist.forEach((move) => {
        move.eco = { name: "", code: "" };
      })
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set: {
            "variations.movelist": game.variations.movelist,
          },
        }
      );
      Game.moveForward("mi1", game_id, 3);

      // Check if moveForward loaded eco information ONLY in the last 3 nodes of the movelist tree.
      let game3 = Game.GameCollection.findOne({game_id: this.game_id});
      game3.variations.movelist.forEach((move, index) => {
        chai.assert.isDefined(move.eco);
        if (index < 3) {
          chai.assert.isUndefined(move.eco.name);
          chai.assert.isUndefined(move.eco.code);
        } else {
          chai.assert.isDefined(move.eco.name);
          chai.assert.isDefined(move.eco.code);
        }
      });
      chai.assert.deepEqual(game3.variations.movelist[game3.variations.cmi].eco, { name: "King's Indian Attack", code: "A08" });
    });
    it("should not load an eco code without an eco entry for each node visited by moveForward", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      Game.moveBackward("mi1", game_id, 5);
      Game.moveForward("mi1", game_id, 5);

      game.variations.movelist.forEach((move) => {
        chai.assert.deepEqual(move.eco, {name: "NO_ECO", code: "NO_ECO"});
      })
    });
  });
  describe("moveBackward", function() {
    it("should load an eco code with an eco entry for each node visited by moveBackward", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];

      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        tm = !tm ? 1 : 0;
      });

      Game.resignLocalGame("moveForwardTestGameEnd", game_id);

      const game = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
      if (!game) {
        chai.assert.fail("Game does not exist");
      }
      const cmi = game.variations.cmi;
      // Check that moveBackward works for all moves in movelist
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set:
            {
              "variations.movelist": game.variations.movelist,
            }
        }
      );
      Game.moveBackward("mi1", game_id, moves1.length);
      const game2 = Game.GameCollection.findOne({ _id: game_id, status: "examining" });

      game2.variations.movelist.forEach((move) => {
        chai.assert.isDefined(move.eco);
        chai.assert.isDefined(move.eco.name);
        chai.assert.isDefined(move.eco.code);
      });
      chai.assert.deepEqual(game2.variations.movelist[cmi].eco, { name: "King's Indian Attack", code: "A08" });
      Game.moveForward("mi1", game_id, moves1.length);
      // Check that moveBackward works for some moves in movelist
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set:
            {
              "variations.movelist": game.variations.movelist,
            }
        }
      );
      Game.moveBackward("mi1", game_id, 3);
      const game3 = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
      chai.assert.deepEqual(game3.variations.movelist[cmi - 2].eco, { name: "King's Indian Attack", code: "A07" });
      chai.assert.deepEqual(game3.variations.movelist[cmi - 1].eco, { name: "King's Indian Attack", code: "A07" });
      chai.assert.deepEqual(game3.variations.movelist[cmi].eco, { name: "King's Indian Attack", code: "A08" });
    });
    it("should not load an eco code without an eco entry for each node visited by moveBackward", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];

      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        tm = !tm ? 1 : 0;
      });

      Game.resignLocalGame("moveForwardTestGameEnd", game_id);

      const game = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
      if (!game) {
        chai.assert.fail("Game does not exist");
      }
      const cmi = game.variations.cmi;
      // Check that moveBackward works for all moves in movelist
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set:
            {
              "variations.movelist": game.variations.movelist,
            }
        }
      );
      Game.moveBackward("mi1", game_id, moves1.length);
      const game2 = Game.GameCollection.findOne({ _id: game_id, status: "examining" });

      game2.variations.movelist.forEach((move) => {
        chai.assert.isDefined(move.eco);
        chai.assert.isDefined(move.eco.name);
        chai.assert.isDefined(move.eco.code);
      });
      chai.assert.deepEqual(game2.variations.movelist[cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      Game.moveForward("mi1", game_id, moves1.length);
      // Check that moveBackward works for some moves in movelist
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        { _id: game_id, status: "examining" },
        {
          $set:
            {
              "variations.movelist": game.variations.movelist,
            }
        }
      );
      Game.moveBackward("mi1", game_id, 3);
      const game3 = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
      game3.variations.movelist.forEach((move) => {
        chai.assert.deepEqual(move.eco, { name: "NO_ECO", code: "NO_ECO" });
      })
    });
  });
  describe("loadFen", function() {
    it("should not load an eco code for a starting board fen for a game with no moves", function() {
      // Create game with new board
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const player = TestHelpers.createUser();
      self.loggedonuser = player
      const game_id = Game.startLocalGame("loadFen_test1_startGame", player, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // check node
      Game.resignLocalGame("loadFen_test1_resignGame", game_id);
      const game = Game.GameCollection.findOne({status: "examining", _id: game_id});
      if (!game) {
        chai.assert.fail("Game does not exist");
      }

      chai.assert.isUndefined(game.variations.movelist[0].eco);

      // load fen
      const fen_string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      Game.loadFen("loadFen_test1", game_id, fen_string);
      // check node again
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.isUndefined(game2.variations.movelist[0].eco);

    });
    it("should not load an eco code for a starting board fen for a game with moves and ECO", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "loadFen_test2_startGame",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("loadFen_test2_resignGame", game_id);
      const game = Game.getAndCheck(us, "mi1", game_id);
      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      const fen_string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      Game.loadFen("loadFen_test2", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });
    it("should not load an eco code for a starting board fen for a game with moves and no ECO", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");

      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("mi2", game_id);
      const game = Game.getAndCheck(self.loggedonuser,"mi1", game_id);
      if (!game) {
        chai.assert.fail("Game does not exist");
      }
      // load fen

      const fen_string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      Game.loadFen("loadFen_test3", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });

    it("should not load an eco code for a fen without an eco entry for a game with no moves", function() {
      // Create game with new board
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");

      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("mi2", game_id);
      const game = Game.getAndCheck(self.loggedonuser,"mi1", game_id);
      // load fen
      const fen_string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 16 9";
      Game.loadFen("mi1", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      // check node again
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });
    it("should not load an eco code for a fen without an eco entry for a game with moves and ECO", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "loadFen_test2_startGame",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("loadFen_test2_resignGame", game_id);
      const game = Game.getAndCheck(us, "mi1", game_id);
      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      const fen_string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 16 9";
      Game.loadFen("loadFen_test2", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });
    it("should not load an eco code for a fen without an eco entry for a game with moves and no ECO", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "loadFen_test2_startGame",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("loadFen_test2_resignGame", game_id);
      const game = Game.getAndCheck(us, "mi1", game_id);
      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      const fen_string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 16 9";
      Game.loadFen("loadFen_test2", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });

    it("should load an eco for a fen with an eco entry for a game with no moves", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame("loadFen_test1_startGame", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("loadFen_test1_resignGame", game_id);
      const game = Game.GameCollection.findOne({status: "examining", _id: game_id});
      if (!game) {
        chai.assert.fail("Game does not exist");
      }

      Game.loadFen("loadFen_test1", game_id, fen);
      // check node again
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      let eco = {
        name: "King's Indian Attack",
        code: "A07",
      };
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, eco);
    });
    it("should load an eco for a fen with an eco entry for a game with moves and ECO", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const player = TestHelpers.createUser();
      self.loggedonuser = player
      const game_id = Game.startLocalGame("loadFen_test1_startGame", player, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // check node
      Game.resignLocalGame("loadFen_test1_resignGame", game_id);
      const game = Game.GameCollection.findOne({status: "examining", _id: game_id});
      if (!game) {
        chai.assert.fail("Game does not exist");
      }

      chai.assert.isUndefined(game.variations.movelist[0].eco);

      Game.loadFen("loadFen_test1", game_id, fen);
      // check node again
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      let eco = {
        name: "King's Indian Attack",
        code: "A07",
      };
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, eco);
    });
    it("should load an eco for a fen with an eco entry for a game with moves and no ECO", function() {
      // Create game with new board
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");

      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("mi2", game_id);
      const game = Game.getAndCheck(self.loggedonuser,"mi1", game_id);
      if (!game) {
        chai.assert.fail("Game does not exist");
      }
      // load fen

      Game.loadFen("mi1", game_id, fen);
      const collection = Game.GameCollection.findOne({_id: game_id});
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0], collection.variations.movelist[0]);
      // check node again
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "King's Indian Attack", code: "A07" });
    });
  });
  describe("moveToCMI", function() {
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      // Update ECO code collection for later
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      const our_eco = {name: name, code: code};
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      // Create a game
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us
      const game_id = Game.startLocalGame("moveToCMI_test1_startGame", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      let game  = Game.GameCollection.findOne({ _id: game_id });
      Game.resignLocalGame("moveToCMI_test1_resignGame", game_id);

      // Assume we start with undefined eco info
      chai.assert.isUndefined(game.variations.movelist[0].eco, "Game doesn't start with undefined  eco");
      chai.assert.equal(game.variations.movelist.length,1, "Game doesn't start with undefined  eco");

      // make moves to a nearby eco code
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"]; // name: "King's Indian Attack | code: "A08"
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      game = Game.GameCollection.findOne({ _id: game_id, status: "examining" });
      // remove automatically updated movecodes
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        {_id: game_id, status: "examining"},
        { $set:
            { "variations.movelist" : game.variations.movelist },
        });

      // check that eco code and name changed
      const collection = Game.GameCollection.findOne({_id: game_id});
      chai.assert.equal(collection.variations.movelist.length, 6, "movelist isn't 6 long after moves");
      chai.assert.isUndefined(collection.variations.movelist[4].eco);
      // do moveToCMI and check lookup
      Game.moveToCMI("mi1", game_id, 4);
      const collection2 = Game.GameCollection.findOne({_id: game_id});
      chai.assert.equal(collection2.variations.movelist.length, 6, "movelist failed to update to opening");
      chai.assert.deepEqual(collection2.variations.movelist[4].eco,our_eco, "eco code wasn't specified eco on move 3");
    });
    it("should NOT perform a lookup if there IS eco information", function() {
      // Update ECO code collection for later
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      const our_eco = {name: name, code: code};
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      // Create a game
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us
      const game_id = Game.startLocalGame("loadFen_test1_startGame", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc","white");
      let game  = Game.getAndCheck(self.loggedonuser, "mi1", game_id);
      Game.resignLocalGame("mi1", game_id);

      // assume starts with undefined eco info
      chai.assert.isUndefined(game.variations.movelist[0].eco, "Game doesn't start with undefined  eco");
      chai.assert.equal(game.variations.movelist.length,1, "Game doesn't start with undefined  eco");

      // make moves to a nearby eco code
      const moves1 = ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"];

      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });

      // check that eco code didn't change
      game = Game.GameCollection.findOne({_id: game_id});
      game.variations.movelist.forEach((move) => {
        delete move.eco;
      });
      Game.GameCollection.update(
        {_id: game_id, status: "examining"},
        { $set:
            { "variations.movelist" : game.variations.movelist },
        });

      Game.moveToCMI("mi1", game_id, 4);
      //check that new eco is updated
      const game2 = Game.GameCollection.findOne({_id: game_id});
      for(let i = 0; i < 5; i++) {
        chai.assert.deepEqual(game2.variations.movelist[i].eco, { name: "NO_ECO", code: "NO_ECO" });
      }
    });
  });
  describe("saveLocalMove", function() {
    it("should not save a code/name until it gets its first eco match in any node", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );

      // eslint-disable-next-line prettier/prettier
      let chess_obj = new Chess.Chess();
      let result = chess_obj.move("Nf3");
      chai.assert.isDefined(result, "Move should be legal");
      Game.saveLocalMove("mi1", game_id, "Nf3");
      let game = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("d5");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = them;
      Game.saveLocalMove("mi2", game_id, "d5");
      let game2 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("g3");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = us;
      Game.saveLocalMove("mi2", game_id, "g3");
      let game3 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game3.variations.movelist[game3.variations.cmi].eco, { name: "King's Indian Attack", code: "A07" });
    });
    it("should store the same code/name as previous node if there is no match", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );

      // eslint-disable-next-line prettier/prettier
      let chess_obj = new Chess.Chess();
      let result = chess_obj.move("Nf3");
      chai.assert.isDefined(result, "Move should be legal");
      Game.saveLocalMove("mi1", game_id, "Nf3");
      let game = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("d5");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = them;
      Game.saveLocalMove("mi2", game_id, "d5");
      let game2 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("g3");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = us;
      Game.saveLocalMove("mi3", game_id, "g3");
      let game3 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game3.variations.movelist[game3.variations.cmi].eco, { name: "King's Indian Attack", code: "A07" });

      result = chess_obj.move("c5");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = them;
      Game.saveLocalMove("mi4", game_id, "c5");
      let game4 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game4.variations.movelist[game4.variations.cmi].eco, { name: "King's Indian Attack", code: "A07" });
    });
    it("should store new code/name when it gets a new match", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );

      // eslint-disable-next-line prettier/prettier
      let chess_obj = new Chess.Chess();
      let result = chess_obj.move("Nf3");
      chai.assert.isDefined(result, "Move should be legal");
      Game.saveLocalMove("mi1", game_id, "Nf3");
      let game = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("d5");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = them;
      Game.saveLocalMove("mi2", game_id, "d5");
      let game2 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game2.variations.movelist[game2.variations.cmi].eco, { name: "NO_ECO", code: "NO_ECO" });

      result = chess_obj.move("g3");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = us;
      Game.saveLocalMove("mi3", game_id, "g3");
      let game3 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game3.variations.movelist[game3.variations.cmi].eco, { name: "King's Indian Attack", code: "A07" });

      result = chess_obj.move("c5");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = them;
      Game.saveLocalMove("mi4", game_id, "c5");
      let game4 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game4.variations.movelist[game4.variations.cmi].eco, { name: "King's Indian Attack", code: "A07" });

      result = chess_obj.move("Bg2");
      chai.assert.isDefined(result, "Move should be legal");
      self.loggedonuser = us;
      Game.saveLocalMove("mi5", game_id, "Bg2");
      let game5 = Game.GameCollection.findOne( { _id: game_id });
      chai.assert.deepEqual(game5.variations.movelist[game5.variations.cmi].eco, { name: "King's Indian Attack", code: "A08" });
    });
    it("should arrive at the same code/name with transposed moves", function() {
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id);
      const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

      if(!game) {
        chai.assert.fail("Game does not exist");
      }

      self.loggedonuser = us;
      const game_id2 = Game.startLocalGame(
        "moveForwardTestGameStart",
        them,
        0,
        "standard",
        true,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      // eslint-disable-next-line prettier/prettier
      const moves2 = ["g3", "c5", "Nf3", "d5", "Bg2"];
      chess_obj.reset();
      tm = 0;
      moves2.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id2, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      Game.resignLocalGame("moveForwardTestGameEnd", game_id2);
      const transposedGame = Game.GameCollection.findOne({ status: "examining", _id: game_id2 });

      if(!transposedGame) {
        chai.assert.fail("Game does not exist");
      }

        chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, transposedGame.variations.movelist[transposedGame.variations.cmi].eco);
    });
  });
  describe("exportToPGN", function() {
    it("Should promote pgn variations properly", function(){
      this.timeout(100000);
      // Create a game
      const player = {
        white: TestHelpers.createUser(),
        black: TestHelpers.createUser(),
      };
      const us = player.white;
      const them = player.black;
      self.loggedonuser = us;
      let game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // Apply moves up to promotion
      const actions = [
        { type: "move", parameter: "c4" },
        { type: "move", parameter: "c5" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "e4" },
        { type: "move", parameter: "e5" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
      ];

      actions.forEach((action) => {
        const tomove = Game.collection.findOne({}).tomove;
        switch (action.type) {
          case "move":
            self.loggedonuser = player[tomove];
            Game.saveLocalMove(action.parameter, game_id, action.parameter);
            break;
          case "takeback_requested":
            self.loggedonuser = player[tomove];
            Game.requestLocalTakeback("request takeback", game_id, action.parameter);
            break;
          case "takeback_accepted":
            const tbcolor = tomove === "white" ? "black" : "white";
            self.loggedonuser = player[tbcolor];
            Game.acceptLocalTakeback("accept takeback", game_id);
            break;
          default:
            chai.assert.fail("Unknown action: " + action);
        }
      });
      // Check pgn
      const game = Game.collection.findOne({});

      const pgn = buildPgnFromMovelist(game.variations.movelist);
      const expected_pgn_1 = "1. e4 (1. c4 c5) 1. ... e5";
      const expected_pgn_2 = "1. Nf3 (1. e4 e5)(1. c4 c5) 1. ... Nc6";
      const expected_pgn_3 = "1. Nf3 (1. e4 e5)(1. c4 c5) 1. ... d5 (1. ... e5)(1. ... Nc6)";
      const expected_pgn_4 = "1. Nf3 (1. e4 e5)(1. c4 c5) 1. ... Nc6 (1. ... d5)(1. ... e5)";
      chai.assert.equal(pgn, expected_pgn_1, "pgn creation failed to be correct before promotion");
      // apply takeback promotion
      const actions2 = [
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
      ];

      actions2.forEach((action) => {
        const tomove = Game.collection.findOne({}).tomove;
        switch (action.type) {
          case "move":
            self.loggedonuser = player[tomove];
            Game.saveLocalMove(action.parameter, game_id, action.parameter);
            break;
          case "takeback_requested":
            self.loggedonuser = player[tomove];
            Game.requestLocalTakeback("request takeback", game_id, action.parameter);
            break;
          case "takeback_accepted":
            const tbcolor = tomove === "white" ? "black" : "white";
            self.loggedonuser = player[tbcolor];
            Game.acceptLocalTakeback("accept takeback", game_id);
            break;
          default:
            chai.assert.fail("Unknown action: " + action);
        }
      });
      // check pgn
      const game2 = Game.collection.findOne({});

      const pgn2 = buildPgnFromMovelist(game2.variations.movelist);
      chai.assert.equal(pgn2, expected_pgn_2, "produced duplicates in pgn, redoing mainling shouldn't");

      const actions3 = [
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "takeback_requested", parameter: 1 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "e5" },
        { type: "takeback_requested", parameter: 1 },
        { type: "takeback_accepted" },
        { type: "move", parameter: "d5" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
      ];

      actions3.forEach((action) => {
        const tomove = Game.collection.findOne({}).tomove;
        switch (action.type) {
          case "move":
            self.loggedonuser = player[tomove];
            Game.saveLocalMove(action.parameter, game_id, action.parameter);
            break;
          case "takeback_requested":
            self.loggedonuser = player[tomove];
            Game.requestLocalTakeback("request takeback", game_id, action.parameter);
            break;
          case "takeback_accepted":
            const tbcolor = tomove === "white" ? "black" : "white";
            self.loggedonuser = player[tbcolor];
            Game.acceptLocalTakeback("accept takeback", game_id);
            break;
          default:
            chai.assert.fail("Unknown action: " + action);
        }
      });
      // check pgn
      const game3 = Game.collection.findOne({});

      const pgn3 = buildPgnFromMovelist(game3.variations.movelist);
      chai.assert.equal(pgn3, expected_pgn_3, "produced duplicates in pgn, redoing mainline shouldn't");

      const actions4 = [
        { type: "move", parameter: "Nf3" },
        { type: "move", parameter: "Nc6" },
        { type: "takeback_requested", parameter: 2 },
        { type: "takeback_accepted" },
      ];

      actions4.forEach((action) => {
        const tomove = Game.collection.findOne({}).tomove;
        switch (action.type) {
          case "move":
            self.loggedonuser = player[tomove];
            Game.saveLocalMove(action.parameter, game_id, action.parameter);
            break;
          case "takeback_requested":
            self.loggedonuser = player[tomove];
            Game.requestLocalTakeback("request takeback", game_id, action.parameter);
            break;
          case "takeback_accepted":
            const tbcolor = tomove === "white" ? "black" : "white";
            self.loggedonuser = player[tbcolor];
            Game.acceptLocalTakeback("accept takeback", game_id);
            break;
          default:
            chai.assert.fail("Unknown action: " + action);
        }
      });
      // check pgn
      const game4 = Game.collection.findOne({});

      const pgn4 = buildPgnFromMovelist(game4.variations.movelist);
      chai.assert.equal(pgn4, expected_pgn_4, "produced duplicates in pgn, redoing mainling shouldn't");


    });
    it("should export eco code and name of mainline instead of a variation", function() {
      this.timeout(5000000);
      // Provide a game instance
      // we add an eco code entry
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });
      const other_fen = "rnbqkbnr/1pp1pppp/8/p2p4/8/2N2NP1/PPPPPP1P/R1BQKB1R b KQkq - 1 3";
      const other_name = "something else";
      const other_code = "some code";
      Game.ecoCollection.insert({name: other_name, eco: other_code, fen: other_fen, wild:0});
      const our_eco = {name: name2, code: code2};
      const wrong_eco = {name: other_name, code: other_code};

      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      // Actually create the game of a large tree
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      let game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // Have a given eco code
      const moves1 = ["Nf3", "d5", "g3"];
      const main_moves = ["c5", "Bg2"];
      const other_moves = ["a5", "Nc3"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      // make moves to the given eco code
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      other_moves.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      let our_pgn = Game.exportToPGN(game_id).pgn.split('\n');
      let eco_name_index = our_pgn.findIndex(element => element.includes("[Opening"));
      let eco_index = our_pgn.findIndex(element => element.includes("[ECO"));
      chai.assert.equal(our_pgn[eco_name_index], "[Opening " + other_name + "]", "eco name wasn't variation before takeback");
      chai.assert.equal(our_pgn[eco_index], "[ECO " + other_code + "]", "eco code wasn't variation before takeback");
      self.loggedonuser = us;
      Game.requestLocalTakeback("mi1", game_id, 1);
      self.loggedonuser = them;
      Game.acceptLocalTakeback("mi1", game_id);
      Game.requestLocalTakeback("mi1", game_id, 1);
      self.loggedonuser = us;
      Game.acceptLocalTakeback("mi1", game_id);
      main_moves.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
      });
      // Produce a PGN with mainline eco name and code
      our_pgn = Game.exportToPGN(game_id).pgn.split('\n');
      eco_name_index = our_pgn.findIndex(element => element.includes("[Opening"));
      eco_index = our_pgn.findIndex(element => element.includes("[ECO"));
      // Check that mainline was used
      chai.assert.notDeepEqual(our_pgn[eco_name_index], "[Opening " + wrong_eco.name + "]", "Export pgn gave variation, not mainline econame");
      chai.assert.notDeepEqual(our_pgn[eco_index], "[ECO " + wrong_eco.code + "]", "Export pgn gave variation, not mainline eco code");
      chai.assert.equal(our_pgn[eco_name_index], "[Opening " + our_eco.name + "]", "eco name wasn't in pgn string");
      chai.assert.equal(our_pgn[eco_index], "[ECO " + our_eco.code + "]", "eco code wasn't in pgn string");
    });
    it("should send the eco code if we have an eco code already defined", function() {
      this.timeout(5000000);
      // Provide a game instance
      // we add an eco code entry
      if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
      let name = "King's Indian Attack";
      let code = "A07";
      let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
      Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
      let name2 = "King's Indian Attack";
      let code2 = "A08";
      let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
      const our_eco = {name: name2, code: code2};
      Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

      // Actually create the game
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      let game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // Have a given eco code
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      // make moves to the nearby eco code
      let index = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
        index += 1;
      });
      // Produce a PGN with given eco name and code

      const our_pgn = Game.exportToPGN(game_id).pgn.split('\n');
      const eco_name_index = our_pgn.findIndex(element => element.includes("[Opening"));
      const eco_index = our_pgn.findIndex(element => element.includes("[ECO"));
      chai.assert.equal(our_pgn[eco_name_index], "[Opening " + our_eco.name + "]", "eco name wasn't in pgn string");
      chai.assert.equal(our_pgn[eco_index], "[ECO " + our_eco.code + "]", "eco code wasn't in pgn string");
    });
    it("should not send an eco code if we don't have eco defined", function(){
      this.timeout(500000);
      // we DO NOT add an eco code entry
      // Actually create the game
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      let game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
      // Have a given eco code
      const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
      let chess_obj = new Chess.Chess();
      const tomove = [us, them];
      let tm = 0;
      // make moves for test
      let index = 0;
      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        chess_obj.move(move);
        tm = !tm ? 1 : 0;
        index += 1;
      });
      // Produce a PGN WITHOUT ANY given eco name and code
      const our_pgn = Game.exportToPGN(game_id).pgn.split('\n');
      const eco_name_index = our_pgn.findIndex(element => element.includes("[Opening"));
      const eco_index = our_pgn.findIndex(element => element.includes("[ECO"));
      chai.assert.equal(eco_name_index,-1, "opening name format found for no eco code in pgn");
      chai.assert.equal(eco_index,-1, "eco code format found for no eco code in pgn");
      chai.assert.isDefined(our_pgn, "pgn wasn't even provided as a text");
      //pgn doesn't include eco AT ALL
    })
  it("should not be saved to the game_history collection", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;

    if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
    let name = "King's Indian Attack";
    let code = "A07";
    let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
    Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
    let name2 = "King's Indian Attack";
    let code2 = "A08";
    let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
    Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

    const game_id = Game.startLocalGame(
      "moveForwardTestGameStart",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    // eslint-disable-next-line prettier/prettier
    const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
    let chess_obj = new Chess.Chess();
    const tomove = [us, them];
    let tm = 0;
    moves1.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      chess_obj.move(move);
      tm = !tm ? 1 : 0;
    });
    Game.resignLocalGame("moveForwardTestGameEnd", game_id);

    const game = GameHistory.collection.findOne({ _id: game_id });
    if (!game) {
      chai.assert.fail("No game record in game history collection");
    }
    game.variations.movelist.forEach((move) => {
      chai.assert.isUndefined(move.eco);
    })
  });
  it("should be publish the ecocodes", function(done) {

    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;

    if (!Game.ecoCollection) Game.ecoCollection = new Mongo.Collection("ecocodes");
    let name = "King's Indian Attack";
    let code = "A07";
    let fen = "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2";
    Game.ecoCollection.insert({ name: name, eco: code, fen: fen, wild: 0 });
    let name2 = "King's Indian Attack";
    let code2 = "A08";
    let fen2 = "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 1 3";
    Game.ecoCollection.insert({ name: name2, eco: code2, fen: fen2, wild: 0 });

    const game_id = Game.startLocalGame(
      "moveForwardTestGameStart",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    // eslint-disable-next-line prettier/prettier
    const moves1 = ["Nf3", "d5", "g3", "c5", "Bg2"];
    let chess_obj = new Chess.Chess();
    const tomove = [us, them];
    let tm = 0;
    moves1.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      chess_obj.move(move);
      tm = !tm ? 1 : 0;
    });
    Game.resignLocalGame("moveForwardTestGameEnd", game_id);
    const game = Game.GameCollection.findOne({ status: "examining", _id: game_id });

    if(!game) {
      chai.assert.fail("Game does not exist");
    }
    const collector = new PublicationCollector({ userId: us._id });
    collector.collect("games", collections => {
      collections.game.forEach((game) => {
        chai.assert.deepEqual(game.variations.movelist[game.variations.cmi].eco, { name: "King's Indian Attack", code: "A08" });
      })
      done();
    });
  });
  });
});