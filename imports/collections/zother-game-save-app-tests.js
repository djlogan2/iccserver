import { TestHelpers } from "../imports/server/TestHelpers";
import chai from "chai";

describe("stripGameForSave", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should remove useless fields from a played game", function() {
    chai.assert.fail("do me");
  });
  it("should remove useless fields from an examined game", function() {
    chai.assert.fail("do me");
  });
});

describe("startGameFromGameRecord", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  const game_record = {
    white: {
      id: white._id,
      name: white.username,
      rating: white.ratings[rating_type].rating
    },
    black: {
      id: black._id,
      name: black.username,
      rating: black.ratings[rating_type].rating
    },
    wild: wild_number,
    rating_type: rating_type,
    rated: rated,
    clocks: {
      white: {
        initial: white_initial,
        inc_or_delay: white_increment_or_delay,
        delaytype: white_increment_or_delay_type,
        current: white_initial * 60 * 1000 // milliseconds
      },
      black: {
        initial: black_initial,
        inc_or_delay: black_increment_or_delay,
        delaytype: black_increment_or_delay_type,
        current: black_initial * 60 * 1000 //milliseconds
      }
    },
    actions: [],
    variations: { movelist: [{}] }
  };
  it("should fail if black or white isn't logged on", function() {
    chai.assert.fail("do me");
  });
  it("should fail if either player fails time/inc rules", function() {
    chai.assert.fail("do me");
  });
  it("should fail if either player fails rating type/time/inc rules", function() {
    chai.assert.fail("do me");
  });
  it("should set current time if it's not already in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should use existing current time if it is already in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should fail if either users current time <= 0", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the game is in a forced checkmate or stalemate position", function() {
    chai.assert.fail("do me");
  });
  it("should fail if whites username does not match id, or blacks username does not match id", function() {
    chai.assert.fail("do me");
  });
  it("should set starttime if it does not exist", function() {
    chai.assert.fail("do me");
  });
  it("should use the existing starttime if it does exist", function() {
    chai.assert.fail("do me");
  });
  it("should set the game only fields correctly", function() {
    // result, fen, tomove, pending, lag
    chai.assert.fail("do me");
  });
  it("should set an empty array for observers if it doesn't exist", function() {
    chai.assert.fail("do me");
  });
  it("should use existing observers if it does exist", function() {
    chai.assert.fail("do me");
  });
  it("should delete examiners if it exists", function() {
    chai.assert.fail("do me");
  });
  it("should fail if any existing observer ids are incorrect", function() {
    chai.assert.fail("do me");
  });
  it("should set the fen if specified in the tags game", function() {
    chai.assert.fail("do me");
  });
  it("should re-make all moves to current when starting the game", function() {
    chai.assert.fail("do me");
  });
  it("should start the timers when starting the game", function() {
    chai.assert.fail("do me");
  });
});
