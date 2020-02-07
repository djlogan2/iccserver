//clearboard, initial_position, add_piece, remove_piece, move_piece, change_tomove, castling, en_passant, white/black_names, setting pgn tags
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import chai from "chai";

describe.only("clearboard", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "8/8/8/8/8/8/8/8 w - - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Setting the initial position", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Adding a piece", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/5B2/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Removing a piece", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
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
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Changing side to move", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    Game.setToMove("mi2", game_id, "b");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setToMove("mi2", game_id, "b");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    chai.assert.equal(game.tomove, "black");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Setting castling", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    Game.setCastling("mi2", game_id, "kq", "kq");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setCastling("mi2", game_id, "q", "q");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should fail to set kingside castling for white if rook isn't on h1", function() {
    chai.assert.fail("do me");
  });
  it("should fail to set queenside castling for white if rook isn't on a1", function() {
    chai.assert.fail("do me");
  });
  it("should fail to set kingside castling for black if rook isn't on h8", function() {
    chai.assert.fail("do me");
  });
  it("should fail to set queenside castling for black if rook isn't on a8", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Setting en passant", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
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
    Game.removePiece("mi2", game_id, "e2");
    Game.addPiece("mi3", game_id, "w", "p", "e4");
    Game.setToMove("mi4", game_id, "b");
    Game.setEnPassant("mi5", game_id, "e4");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
    chai.assert.deepEqual(game.variations, { cmi: 0, movelist: [{}] });
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

  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should fail to set en passant if the pawn is missing, or if it's not the opposite sides turn to move", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN tag", function() {
    chai.assert.fail("do me");
  });
});

describe.only("Setting PGN tags", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should return a client message if done on a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    Game.saveLocalMove("mi2", game_id, "e4");
    Game.setTag("mi3", game_id, "White", "Guy, Some");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi3");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });

  it("should succeed on an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setTag("mi2", game_id, "White", "Guy, Some");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.collection.findOne();
    chai.assert.equal("Guy, Some", game.white.name);
  });

  //TODO: Check all special tags one by one
  //TODO: Check Date/Time tags (yea, I know it's above), but we have to specifically check:
  //      (1) Date w/o Time
  //      (2) Time w/o Date
  //      (3) The stupid question marks all over, and decide what to do with them
  //          My cursory thought is to write them into the tags object, and IF they are completely valid, only
  //          then update startTime. Otherwise startTime is just when the examined game started. Maybe we should
  //          be doing that anyway! Thought #2 :)
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

  it("should set whites name correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set blacks name correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set 'Date' and 'Time' correctly by setting startTime", function() {
    chai.assert.fail("do me");
  });
  it("should set 'Result' correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set 'WhiteUSCF' correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set 'WhiteElo' correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set 'BlackUSCF' correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set 'BlackElo' correctly", function() {
    chai.assert.fail("do me");
  });
  it("should set all other tags in the tag object", function() {
    chai.assert.fail("do me");
  });
  it("should write the appropriate action when a tag change occurs", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
  it("should set the FEN key and update chess when FEN tag is set", function() {
    chai.assert.fail("do me");
  });
});
