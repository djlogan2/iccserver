import chai from "chai";
import { TestHelpers } from "../TestHelpers";

describe("When making a move on a board that will be, or cause, a variation", function() {
  const self = TestHelpers.setupDescribe.call(this);

  it("should make the latest move main line if the game is being played", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p2;
    const game_id = Game.startLocalGame("mi1", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.saveLocalMove("e4", game_id, "e4");
    Game.requestLocalTakeback("mi2", game_id, 1);
    self.loggedonuser = p1;
    Game.acceptLocalTakeback("mi3", game_id);
    self.loggedonuser = p2;
    Game.saveLocalMove("d4", game_id, "d4");
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [2, 1] }, {
      move: "e4",
      prev: 0
    }, { move: "d4", prev: 0 }]);
  });

  function cleanup(movelist) {
    return movelist.map(ml => {
      const rml = {};
      if (ml.variations !== undefined) rml.variations = ml.variations;
      if (ml.move !== undefined) rml.move = ml.move;
      if (ml.prev !== undefined) rml.prev = ml.prev;
      return rml;
    });
  }

  it("should raise an error if 'variation' is specified when playing a game. (New main line is the only option)", function() {
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    chai.assert.throws(() => {
      Game.saveLocalMove("e4", game_id, "e4", { type: "insert", index: 1 });
    });
  });

  it("should raise an error if 'index' is specified when playing a game. (New main line is the only option)", function() {
    const p1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalGame("mi1", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    chai.assert.throws(() => {
      Game.saveLocalMove("e4", game_id, "e4", { index: 1 });
    });
  });

  it("should return a client message if 'variation' is NOT specified when examining a game.", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_ACTION");
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [1] }, {
      move: "e4",
      prev: 0
    }]);
  });

  // "insert #", "append", "replace #" are the options
  //  saveLocalMove(message_identifier, game_id, move, variation) { variation = { type: "insert", index: 3 }
  //                                                                            { type: "append" }
  it("should raise an error if type is not 'insert', 'replace' or 'append", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "bogus", index: 0 });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_ACTION");
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [1] }, {
      move: "e4",
      prev: 0
    }]);
  });

  // insert
  it("should raise an error if insert index is missing", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "insert" });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_INDEX");
  });

  it("should raise an error if insert index is out of bounds", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "insert", index: -1 });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_INDEX");
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [1] }, {
      move: "e4",
      prev: 0
    }]);
  });

  it("should move all variations down and insert new one at index", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "insert", index: 0 });
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [2, 1] }, {
      move: "e4",
      prev: 0
    }, { move: "d4", prev: 0 }]);
  });

  // append
  it("should raise an error if index is defined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "append", index: 0 });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_INDEX");
  });

  it("should append the new move to the end", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "append" });
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [1, 2] }, {
      move: "e4",
      prev: 0
    }, { move: "d4", prev: 0 }]);
  });

  // replace
  it("should raise an error if index is missing", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "replace" });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_INDEX");
  });

  it("should raise an error if index is out of bounds", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "replace", index: -1 });
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_VARIATION_INDEX");
    const game = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game.variations.movelist), [{ variations: [1] }, {
      move: "e4",
      prev: 0
    }]);
  });

  it("should update the entire tree by removing all of the moves in that branch and then insert the new move into that branch", function() {
    const moves = ["e4", "e5", "Nc3", "Nf6", 3,
      "e6", "c4", "c5", 2,
      "c3", "c6", 1,
      "d6", 3,
      "d5"
    ];
    const movelist_before_replace = [
      { variations: [1] },
      { move: "e4", prev: 0, variations: [2, 5, 11] },
      { move: "e5", prev: 1, variations: [3] },
      { move: "Nc3", prev: 2, variations: [4] },
      { move: "Nf6", prev: 3 },
      { move: "e6", prev: 1, variations: [6, 8] },
      { move: "c4", prev: 5, variations: [7] },
      { move: "c5", prev: 6 },
      { move: "c3", prev: 5, variations: [9, 10] },
      { move: "c6", prev: 8 },
      { move: "d6", prev: 8 },
      { move: "d5", prev: 1 }
    ];

    const movelist_after_replace = [
      { variations: [1] },
      { move: "e4", prev: 0, variations: [2, 6, 5] },
      { move: "e5", prev: 1, variations: [3] },
      { move: "Nc3", prev: 2, variations: [4] },
      { move: "Nf6", prev: 3 },
      { move: "d5", prev: 1 },
      { move: "c5", prev: 1 }
    ];

    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    moves.forEach(move => {
      if (typeof move === "string")
        Game.saveLocalMove(move, game_id, move, { type: "append" });
      else
        Game.moveBackward("backward " + move, game_id, move);
    });
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game1 = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game1.variations.movelist), movelist_before_replace);

    Game.moveBackward("mi2", game_id, 1);
    Game.saveLocalMove("mi3", game_id, "c5", { type: "replace", index: 1 });

    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.GameCollection.findOne();
    chai.assert.sameDeepOrderedMembers(cleanup(game2.variations.movelist), movelist_after_replace);
  });

  // delete variation
  it("should raise an error on delete if index is missing", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "append" });
    Game.moveBackward("mi4", game_id, 1);
    Game.saveLocalMove("c4", game_id, "c4", { type: "append" });
    const game = Game.GameCollection.findOne();
    chai.assert.throws(() => {
      Game.deleteVariationNode(game.variations.movelist);
    });
  });

  it("should raise an error on delete if index is out of bounds", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "append" });
    Game.moveBackward("mi4", game_id, 1);
    Game.saveLocalMove("c4", game_id, "c4", { type: "append" });
    const game = Game.GameCollection.findOne();
    chai.assert.throws(() => {
      Game.deleteVariationNode(game.variations.movelist, 4);
    });
    chai.assert.throws(() => {
      Game.deleteVariationNode(game.variations.movelist, -1);
    });
  });

  it("should update the entire tree on delete by removing all of the moves in that branch", function() {
    chai.assert.fail("do me");
  });

  it("should properly add the move to the action array with 'insert' and the index'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "insert", index: 0 });
    const game = Game.GameCollection.findOne();
    chai.assert.equal(game.actions[2].type, "move");
    chai.assert.equal(game.actions[2].parameter.variationtype, "insert");
    chai.assert.equal(game.actions[2].parameter.variationindex, 0);
  });

  it("should properly add the move to the action array with 'replace' and the index'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "replace", index: 0 });
    const game = Game.GameCollection.findOne();
    chai.assert.equal(game.actions[2].type, "move");
    chai.assert.equal(game.actions[2].parameter.variationtype, "replace");
    chai.assert.equal(game.actions[2].parameter.variationindex, 0);
  });

  it("should properly add the move to the action array with 'append'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("e4", game_id, "e4");
    Game.moveBackward("mi3", game_id, 1);
    Game.saveLocalMove("d4", game_id, "d4", { type: "append" });
    const game = Game.GameCollection.findOne();
    chai.assert.equal(game.actions[2].type, "move");
    chai.assert.equal(game.actions[2].parameter.variationtype, "append");
    chai.assert.isUndefined(game.actions[2].parameter.variationindex);
  });
  //
  // it.only("should not have any variation information if it's a normal new move", function() {
  //   self.loggedonuser = TestHelpers.createUser();
  //   const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
  //   Game.saveLocalMove("e4", game_id, "e4", {type: "replace", index: 0});
  //   const game = Game.GameCollection.findOne();
  //   chai.assert.equal(game.actions[0].type, "move");
  //   chai.assert.isUndefined(game.actions[0].parameter.variationtype);
  //   chai.assert.isUndefined(game.actions[0].parameter.variationindex);
  // });
});
