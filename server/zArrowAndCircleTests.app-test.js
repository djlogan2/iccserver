import chai from "chai";
import { Game } from "../server/Game";
import { TestHelpers } from "../imports/server/TestHelpers";

describe("Game.drawCircle", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called drawCircle", function() {
    chai.assert.isFunction(Game.drawCircle, "Failed to identify Game.drawCircle as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.drawCircle("invalid_id", "invalid", "Dave", "c1");
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
    Game.drawCircle("test_identifier2", game, "c1");
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
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
    Game.drawCircle("test_identifier2", game, "c1");
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if square is invalid", function() {
    const newguy = TestHelpers.createUser({ _id: "whiteguy" });
    self.loggedonuser = newguy;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "za"); // illegal row and collumn
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_SQUARE");
    Game.drawCircle("mi1", game_id, "c9"); // illegal collumn
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[1][3], "c9");
    Game.drawCircle("mi1", game_id, "c0"); // illegal collumn
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[2][3], "c0");
    Game.drawCircle("mi1", game_id, "h1"); // illegal row
    chai.assert.equal(self.clientMessagesSpy.args[3][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[3][3], "h1");
  });
  it("should not add the same square multiple times", function() {
    const newguy = TestHelpers.createUser({ _id: "whiteguy" });
    self.loggedonuser = newguy;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1");
    Game.drawCircle("mi2", game_id, "c1");
    //chai.assert.equal(Game.collection.find({_id: game_id}).circles[0], "c1");
    //chai.assert.notEqual(Game.collection.find({_id: game_id}).circles[1], "c1");
    chai.assert.fail("Add a way to look up collection");
  });
  it("should add the square to the game record if all is well", function() {
    const newguy = TestHelpers.createUser({ _id: "whiteguy" });
    self.loggedonuser = newguy;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1");
    // chai.assert.equal(Game.collection.find({_id: game_id}).circles[0], "c1");
    chai.assert.fail("add a way to look up record");
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
