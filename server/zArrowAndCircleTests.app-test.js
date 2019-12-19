import chai from "chai";
import { Game } from "../server/Game";
import { TestHelpers } from "../imports/server/TestHelpers";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { GameRequests } from "./GameRequest";
import { Match } from "meteor/check";

describe("Draw Methods", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  describe.only("Game.drawCircle", function() {
    const self = TestHelpers.setupDescribe(this);
    it("should have a function called drawCircle", function() {
      chai.assert.isFunction(Game.drawCircle, "Failed to identify Game.drawCircle as a function");
    });
    it("should fail if game does not exist", function() {
      chai.assert.throws(() => {
        Game.drawCircle("invalid_id", "invalid", "Dave", "C1");
      });
    });

    it("should return client message if game is not examined", function() {
      self.loggedonuser = TestHelpers.createUser();
      const game = Game.startLocalExaminedGame(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        "inc",
        "something",
        null,
        null,
        null,
        true
      );
      Game.drawCircle("test_identifier", game, "", "C1");
      chai.assert.equal("a", "?");

      chai.assert.fail("do me");
    });
    it("should return client message if user is not an examiner", function() {
      chai.assert.fail("do me");
    });
    it("should return client message if square is invalid", function() {
      chai.assert.fail("do me");
    });
    it("should not add the same square multiple times", function() {
      chai.assert.fail("do me");
    });
    it("should add the square to the game record if all is well", function() {
      chai.assert.fail("do me");
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
});
