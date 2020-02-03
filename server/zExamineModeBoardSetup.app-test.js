//clearboard, initial_position, add_piece, remove_piece, move_piece, change_tomove, castling, en_passant, white/black_names, setting pgn tags
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import chai from "chai";

describe("clearboard", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
  });
  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
});

describe("Setting the initial position", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
  });
  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
});

describe("Adding a piace", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
  });
  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
});

describe("Removing a piece", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
  });
  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
});

describe("Changing side to move", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
  });
  it("should add the action to the action array", function() {
    chai.assert.fail("do me");
  });
  it("should  not add an action to the action array if this fails to cause a change to the fen", function() {
    chai.assert.fail("do me");
  });
});

describe("Setting castling", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
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
});

describe("Setting en passant", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
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
});

describe("Setting PGN tags", function() {
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
    chai.assert.fail("do me");
  });
  it("should only be doable by an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should not be doable by an observer", function() {
    chai.assert.fail("do me");
  });
  it("should update chess.js, and set the fen in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should clear the movelist, since it's no longer valid", function() {
    chai.assert.fail("do me");
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
});
