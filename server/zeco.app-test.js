import { TestHelpers } from "../imports/server/TestHelpers";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import chai from "chai";
import Chess from "chess.js"
import { GameHistory} from "./Game";

describe.only("ecocodes", function(){
  this.timeout(50000000000);
  const self = TestHelpers.setupDescribe.apply(this);

  describe.skip("recursive_eco", function() {


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
  describe.skip("load_eco", function() {
    this.timeout(5000000000);

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
  describe.only("moveForward", function(){
    it.only("should load an eco code with an eco entry for each node visited by moveForward", function() {
      this.timeout(500000000);

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
    it.only("should not load an eco code without an eco entry for each node visited by moveForward", function() {
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
  describe.skip("moveBackward", function() {
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      chai.assert.fail("do me");
    });
    it("should NOT perform a lookup if there IS eco information", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("loadFen", function() {
    this.timeout(50000000000);
    // const self = TestHelpers.setupDescribe.call(this);

    it.only("should not load an eco code for a starting board fen for a game with no moves", function() {
      this.timeout(500000000);
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
      const game_id = Game.startLocalGame("loadFen_test1_startGame", player, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
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
    it.only("should not load an eco code for a starting board fen for a game with moves and ECO", function() {
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
    it.only("should not load an eco code for a starting board fen for a game with moves and no ECO", function() {
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
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");

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
        chai.asset.fail("Game does not exist");
      }
      // load fen

      const fen_string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      Game.loadFen("loadFen_test3", game_id, fen_string);
      const game2 = Game.GameCollection.findOne({status: "examining", _id: game_id});
      chai.assert.deepEqual(game2.variations.movelist[0].eco, { name: "NO_ECO", code: "NO_ECO" });
    });

    it.only("should not load an eco code for a fen without an eco entry for a game with no moves", function() {
      // Create game with new board
      const us = TestHelpers.createUser();
      const them = TestHelpers.createUser();
      self.loggedonuser = us;
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");

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
    it.only("should not load an eco code for a fen without an eco entry for a game with moves and ECO", function() {
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
    it.only("should not load an eco code for a fen without an eco entry for a game with moves and no ECO", function() {
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

    it.only("should load an eco for a fen with an eco entry for a game with no moves", function() {
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
      const game_id = Game.startLocalGame("loadFen_test1_startGame", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
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
    it.only("should load an eco for a fen with an eco entry for a game with moves and ECO", function() {
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
      const game_id = Game.startLocalGame("loadFen_test1_startGame", player, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
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
    it.only("should load an eco for a fen with an eco entry for a game with moves and no ECO", function() {
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
      const game_id = Game.startLocalGame("mi1", them, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");

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
        chai.asset.fail("Game does not exist");
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
  describe.skip("setTag", function() {
    it("should do stuff", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("moveToCMI", function() {
    it("should perform a lookup if there is no eco information (and save it if it exists)", function() {
      chai.assert.fail("do me");
    })
    it("should NOT perform a lookup if there IS eco information", function() {
      chai.assert.fail("do me");
    })
  });
  describe.skip("saveLocalMove", function() {
    it("should not save a code/name until it gets its first eco match in any node", function() {
      chai.assert.fail("do me");
    });
    it("should store the same code/name as previous node if there is no match", function() {
      chai.assert.fail("do me");
    });
    it("should store new code/name when it gets a new match", function() {
      chai.assert.fail("do me");
    });
    it("should arrive at the same code/name with transposed moves", function() {
      chai.assert.fail("do me");
    });
  });
  describe.skip("exportToPGN", function() {
    it("should do stuff", function() {
      chai.assert.fail("do me");
    });
  });
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


