//clearboard, initial_position, add_piece, remove_piece, move_piece, change_tomove, castling, en_passant, white/black_names, setting pgn tags
import { TestHelpers } from "../imports/server/TestHelpers";
//import { Game } from "./Game";
import chai from "chai";

function checkLastAction(gamerecord, reverse_index, type, issuer, parameter) {
  const action = gamerecord.actions[gamerecord.actions.length - 1 - reverse_index];
  if (type) chai.assert.equal(action.type, type);
  if (issuer) chai.assert.equal(action.issuer, issuer);
  if (parameter) {
    if (typeof parameter === "object") chai.assert.deepEqual(action.parameter, parameter);
  }
}

//describe("Board Setup", function() {
describe("clearboard", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.clearBoard("mi2", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.clearBoard("mi2", game_id);
    Game.clearBoard("mi2b", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "8/8/8/8/8/8/8/8 w - - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "8/8/8/8/8/8/8/8 w - - 0 1");
    checkLastAction(game, 0, "clearboard", self.loggedonuser._id);
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.clearBoard("mi3", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Setting the initial position", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.setStartingPosition("mi2", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.clearBoard("mi2", game_id);
    Game.setStartingPosition("mi3", game_id);
    Game.setStartingPosition("mi3b", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    checkLastAction(game, 0, "initialposition", self.loggedonuser._id);
    checkLastAction(game, 1, "clearboard", self.loggedonuser._id);
    chai.assert.equal(game.actions.length, 2);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.setStartingPosition("mi3", game_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Adding a piece", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.addPiece("mi2", game_id, "w", "p", "e4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.addPiece("mi2", game_id, "w", "b", "f4");
    Game.addPiece("mi2b", game_id, "w", "b", "f4");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/5B2/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/5B2/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    checkLastAction(game, 0, "addpiece", self.loggedonuser._id, {
      color: "w",
      piece: "b",
      square: "f4"
    });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.addPiece("mi3", game_id, "w", "b", "f4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Removing a piece", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.removePiece("mi2", game_id, "e2");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.removePiece("mi2", game_id, "e2");
    Game.removePiece("mi2b", game_id, "e2");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1");
    checkLastAction(game, 0, "removepiece", self.loggedonuser._id, { square: "e2" });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.removePiece("mi3", game_id, "e2");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Changing side to move", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.setToMove("mi2", game_id, "b");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setToMove("mi2b", game_id, "w");
    Game.setToMove("mi2", game_id, "b");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    chai.assert.equal(game.tomove, "black");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    checkLastAction(game, 0, "settomove", self.loggedonuser._id, { color: "b" });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.setToMove("mi3", game_id, "b");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Setting castling", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.setCastling("mi2", game_id, "kq", "kq");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setCastling("mi2", game_id, "kq", "kq");
    Game.setCastling("mi2", game_id, "q", "q");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1");
    checkLastAction(game, 0, "setcastling", self.loggedonuser._id, { castling: "Qq" });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.setCastling("mi3", game_id, "q", "q");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Setting en passant", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.setEnPassant("mi3", game_id, "e4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setEnPassant("mi5b", game_id, "e4");
    Game.removePiece("mi2", game_id, "e2");
    Game.addPiece("mi3", game_id, "w", "p", "e4");
    Game.setToMove("mi4", game_id, "b");
    Game.setEnPassant("mi5", game_id, "e4");
    Game.setEnPassant("mi5c", game_id, "e4");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.isDefined(game.tags);
    chai.assert.equal(game.tags.FEN, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
    checkLastAction(game, 0, "setenpassant", self.loggedonuser._id, { piece: "e4" });
    chai.assert.equal(game.actions.length, 4);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.removePiece("mi2", game_id, "e2");
    Game.addPiece("mi3", game_id, "w", "p", "e4");
    Game.setToMove("mi4", game_id, "b");
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.setEnPassant("mi5", game_id, "e4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi5");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});

describe("Setting PGN tags", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.setTag("mi3", game_id, "White", "Guy, Some");
    Game.collection.findOne({ _id: game_id });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "White", "Guy, Some");
    Game.setTag("mi2b", game_id, "White", "Guy, Some");
    Game.setTag("mi2v", game_id, "Black", "black");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("Guy, Some", game.white.name);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "White",
      value: "Guy, Some"
    });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.setTag("mi3", game_id, "White", "Guy, Some");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should set blacks name correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "Black", "Guy, Some");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("Guy, Some", game.black.name);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "Black",
      value: "Guy, Some"
    });
  });

  it("should set 'Result' correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "Result", "1/2-1/2");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("1/2-1/2", game.result);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "Result",
      value: "1/2-1/2"
    });
  });

  it("should set 'WhiteUSCF' correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "WhiteUSCF", "1234");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(1234, game.white.rating);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "WhiteUSCF",
      value: "1234"
    });
  });
  it("should set 'WhiteElo' correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "WhiteElo", "1234");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(1234, game.white.rating);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, { tag: "WhiteElo", value: "1234" });
  });
  it("should set 'BlackUSCF' correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "BlackUSCF", "1234");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(1234, game.black.rating);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "BlackUSCF",
      value: "1234"
    });
  });
  it("should set 'BlackElo' correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "BlackElo", "1234");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(1234, game.black.rating);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, { tag: "BlackElo", value: "1234" });
  });

  it("should set all other tags in the tag object", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "Doofus", "goofus today");
    Game.setTag("mi2b", game_id, "Doofus", "goofus today");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("goofus today", game.tags.Doofus);
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "Doofus",
      value: "goofus today"
    });
    chai.assert.equal(game.actions.length, 1);
    Game.setTag("mi3", game_id, "Doofus", "goofus tomorrow");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("goofus tomorrow", game2.tags.Doofus);
    checkLastAction(game2, 0, "settag", self.loggedonuser._id, {
      tag: "Doofus",
      value: "goofus tomorrow"
    });
    chai.assert.equal(game2.actions.length, 2);
  });

  it("should set the FEN key and update chess and remove the movelist when FEN tag is set", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.setTag("mi2", game_id, "FEN", "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR b Qq - 0 1");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR b Qq - 0 1");
    chai.assert.equal(game.tomove, "black");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    checkLastAction(game, 0, "settag", self.loggedonuser._id, {
      tag: "FEN",
      value: "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR b Qq - 0 1"
    });
  });
});

describe("Setting a fen string", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    Game.loadFen("mi2", game_id, "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.loadFen("mi2", game_id, "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(game.fen, "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}], ecocodes: [] });
    chai.assert.equal(game.tags.FEN, "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4");
    checkLastAction(game, 0, "loadfen", self.loggedonuser._id, {
      fen: "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4"
    });
    chai.assert.equal(game.actions.length, 1);
  });

  it("should not be doable by an observer", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = TestHelpers.createUser();
    Game.localAddObserver("mi2", game_id, self.loggedonuser._id);
    Game.loadFen("mi3", game_id, "4rrk1/1b4p1/2p4p/p2pP1q1/Pp1P4/1P2P1PP/4Q1BK/2R1R3 b - - 1 4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
});
//});
