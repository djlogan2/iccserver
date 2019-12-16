import chai from "chai";
import { Game } from "../server/Game";
describe.only("Game.drawCircle", function() {
  it("should have a function called drawCircle", function() {
    chai.assert.isFunction(Game.drawCircle, "Failed to recognize Game.drawCircle as a function");
  });
  it("should fail if Game.drawCircle is called with wrong arguments", function() {
    chai.assert.throws(() => {
      Game.drawCircle();
    }, "Passed incorrect arguments to Game.drawCircle");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.drawCircle("invalid_id", "C1");
    });
  });
  //FIXME: have to add a way to insert records and check records
  it("should return client message if game is not examined", function() {
    chai.assert.equal(Game.drawCircle("current_game", "C1"), "Game is not examined");
  });
  it("should return client message if user is not an examiner", function() {
    chai.assert.equal(Game.drawCircle("current_game", "C1"), "User drawing is not an examiner");
  });
  it("should return client message if square is invalid", function() {
    chai.assert.equal(Game.drawCircle("current_game", "X1"), "Square is invalid");
  });
  it("should not add the same square multiple times", function() {
    chai.assert.fail("do me");
  });
  it("should add the square to the game record if all is well", function() {
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
});
