import { TestHelpers } from "../TestHelpers";

describe("Game analysis", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  describe("starting and stopping", function() {
    it("should start automatically when a played game starts", function() {
      self.startDelayTimer = self.sandbox.stub(Game.__proto__, "startDelayTimer");
      self.startMoveTimer = self.sandbox.stub(Game.__proto__, "startMoveTimer");

      const p1 = TestHelpers.createUser();
      const p2 = TestHelpers.createUser();
      self.loggedonuser = p1;
      const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    });
    it("should end automatically when a played game ends", function() {chai.assert.fail("do me");});
    it("should start when analysis is turned on in an examined game", function() {chai.assert.fail("do me");});
    it("should NOT start when an examined game is loaded", function() {chai.assert.fail("do me");});
    it("should end when analysis is turned off in an examined game", function() {chai.assert.fail("do me");});
    it("should end automatically when a played game ends", function() {chai.assert.fail("do me");});
    it("should end automatically when an examined game ends", function() {chai.assert.fail("do me");});
    it("should start an 'analysis' operation when the board changes", function() {chai.assert.fail("do me");});
    it("should stop a current 'analysis' operation, and start a new operation, when the board changes", function() {chai.assert.fail("do me");});
  });
  describe("analysis operations", function(){
    it("should not start an engine, but use a book move, when a book move is found", function() {chai.assert.fail("do me");});
    it("should not start an engine, but use a tablebase move, when a tablebase move is found", function() {chai.assert.fail("do me");});
    it("should otherwise start an engine in analysis mode", function() {chai.assert.fail("do me");});
    it("should otherwise start an engine in analysis mode", function() {chai.assert.fail("do me");});
  });
});
