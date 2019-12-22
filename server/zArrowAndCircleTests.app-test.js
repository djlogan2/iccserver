import chai from "chai";
import { Game } from "../server/Game";
import { TestHelpers } from "../imports/server/TestHelpers";

describe.only("Game.drawCircle", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called drawCircle", function() {
    chai.assert.isFunction(Game.drawCircle, "Failed to identify Game.drawCircle as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.drawCircle("invalid_id", "invalid", "Dave", "c1", "red", 3);
    });
  });

  it("should return client message if game is not examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalGame(
      "test_identifier",
      other,
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
    self.loggedonuser = other;
    Game.drawCircle("test_identifier2", game, "c1", "red", 3);
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("test_identifier", "w", "b", 0);
    self.loggedonuser = other;
    Game.drawCircle("test_identifier2", game, "c1", "red", 3);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
  it("should return client message if square is invalid", function() {
    const newguy = TestHelpers.createUser({ _id: "whiteguy" });
    self.loggedonuser = newguy;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "za", "red", 3); // illegal row and column
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_SQUARE");
    Game.drawCircle("mi1", game_id, "c9", "red", 3); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[1][3], "c9");
    Game.drawCircle("mi1", game_id, "c0", "red", 3); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[2][3], "c0");
    Game.drawCircle("mi1", game_id, "i1", "red", 3); // illegal row
    chai.assert.equal(self.clientMessagesSpy.args[3][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[3][3], "i1");
  });
  it("should not add the same square multiple times", function() {
    self.loggedonuser = TestHelpers.createUser({ _id: "whiteguy" });
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    Game.drawCircle("mi2", game_id, "c1", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 1);
    chai.assert.deepEqual(record.circles[0], { square: 'c1', color: 'red', size: 3 });
  });
  it("should add the square to the game record if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 1);
    chai.assert.deepEqual(record.circles[0], { square: 'c1', color: 'red', size: 3 });
  });
  it("should write an action", function() {
    chai.assert.fail("do me");
  });
});
describe("Game.removeCircle", function() {
  it("should fail if game does not exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if game is not examined exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if user is not an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if square is invalid", function() {
    chai.assert.fail("do me");
  });
  it("should not have to remove the same square multiple times", function() {
    chai.assert.fail("do me");
  });
  it("should remove the square to the game record if all is well", function() {
    chai.assert.fail("do me");
  });
  it("should write an action", function() {
    chai.assert.fail("do me");
  });
});
describe("Game.drawArrow", function() {
  it("should fail if game does not exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if game is not examined exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if user is not an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if arrow parameters are invalid", function() {
    chai.assert.fail("do me");
  });
  it("should not add the same arrow multiple times (different directions are NOT the same arrow)", function() {
    chai.assert.fail("do me");
  });
  it("should add the arrow to the game record if all is well", function() {
    chai.assert.fail("do me");
  });
  it("should write an action", function() {
    chai.assert.fail("do me");
  });
});
describe("Game.removeArrow", function() {
  it("should fail if game does not exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if game is not examined exist", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if user is not an examiner", function() {
    chai.assert.fail("do me");
  });
  it("should return client message if arrow parameters are invalid", function() {
    chai.assert.fail("do me");
  });
  it("should not need to remove the same arrow multiple times (different directions are NOT the same arrow)", function() {
    chai.assert.fail("do me");
  });
  it("should remove the arrow from the game record if all is well", function() {
    chai.assert.fail("do me");
  });
  it("should write an action", function() {
    chai.assert.fail("do me");
  });
});
