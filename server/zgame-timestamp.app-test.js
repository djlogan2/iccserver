import chai from "chai";

import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe("Game timestamp", function() {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  it.only("should write a unique ping to active for white once a second", function() {
    this.timeout(500000);
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    self.clock.tick(60 * 1000); // 1 minute
    const game = Game.collection.findOne();
    chai.assert.fail("do me ");
  });
  it("should write a unique ping to active for black once a second", function() {
    chai.assert.fail("do me ");
  });
  it("should write the lag time to pings and delete the active ping on a pong all to meteor method", function() {
    chai.assert.fail("do me ");
  });
  it("should subtract the average lag time, minus the system configured minimum lag, from a players movetime", function() {
    chai.assert.fail("do me ");
  });
  it("should calculate the average lag time from the last X pings, X being from the system configuration", function() {
    chai.assert.fail("do me ");
  });
  it("should, when pings have not been responded to, add in the differencd in MS from the start of that ping to current time, without adding to the count (for the average.)", function() {
    // For example, if we have pings of 4,4,4 (sys configured 3 pings for average), this would normally indicate a lag of 4ms
    // But we have two unanswered pings, one 3000ms ago, and one 800ms ago
    // The lag should be calculated as (3000+800+4+4+4) / 3, or 1270
    chai.assert.fail("do me ");
  });
  it("should not add in a ping if only one is active and it's less than what would be the average lag of the last X pings", function() {
    chai.assert.fail("do me ");
  });
});
