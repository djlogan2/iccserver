import chai from "chai";

describe("stripGameForSave", function () {
  it("should remove useless fields from a played game", function () {
    chai.assert.fail("do me");
  });
  it("should remove useless fields from an examined game", function () {
    chai.assert.fail("do me");
  });
});

describe("startGameFromGameRecord", function () {
  it("should fail if black or white isn't logged on", function () {
    chai.assert.fail("do me");
  });
  it("should fail if either player fails time/inc rules", function () {
    chai.assert.fail("do me");
  });
  it("should fail if either player fails rating type/time/inc rules", function () {
    chai.assert.fail("do me");
  });
  it("should set current time if it's not already in the game record", function () {
    chai.assert.fail("do me");
  });
  it("should use existing current time if it is already in the game record", function () {
    chai.assert.fail("do me");
  });
  it("should fail if either users current time <= 0", function () {
    chai.assert.fail("do me");
  });
  it("should fail if the game is in a forced checkmate or stalemate position", function () {
    chai.assert.fail("do me");
  });
  it("should fail if whites username does not match id, or blacks username does not match id", function () {
    chai.assert.fail("do me");
  });
  it("should set starttime if it does not exist", function () {
    chai.assert.fail("do me");
  });
  it("should use the existing starttime if it does exist", function () {
    chai.assert.fail("do me");
  });
  it("should set the game only fields correctly", function () {
    // result, fen, tomove, pending, lag
    chai.assert.fail("do me");
  });
  it("should set an empty array for observers if it doesn't exist", function () {
    chai.assert.fail("do me");
  });
  it("should use existing observers if it does exist", function () {
    chai.assert.fail("do me");
  });
  it("should delete examiners if it exists", function () {
    chai.assert.fail("do me");
  });
  it("should fail if any existing observer ids are incorrect", function () {
    chai.assert.fail("do me");
  });
  it("should set the fen if specified in the tags game", function () {
    chai.assert.fail("do me");
  });
  it("should re-make all moves to current when starting the game", function () {
    chai.assert.fail("do me");
  });
  it("should start the timers when starting the game", function () {
    chai.assert.fail("do me");
  });
});
