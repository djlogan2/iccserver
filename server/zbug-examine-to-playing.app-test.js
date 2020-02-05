import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe("When two players are examining a game", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should remove both players as observers from the examined game when they begin a new game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      let pp1, pp2;
      if (x % 2 === 0) {
        pp1 = p1;
        pp2 = p2;
      } else {
        pp1 = p2;
        pp2 = p1;
      }
      self.loggedonuser = pp1;
      const game_id = Game.startLocalGame(
        "mi1",
        pp2,
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
      chai.assert.equal(Game.collection.find().count(), 1);
      Game.resignLocalGame("mi2", game_id);
      chai.assert.equal(Game.collection.find().count(), 1);
    }
  });
});
