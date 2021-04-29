import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";

//
// player_1 = player, played game, not to move
// player_2 = player, played game, to move
// observer_1 = observer, played game
// observer_2 = observer, public examine
// observer_3 = observer, private with analysis
// observer_4 = observer, private without analysis
// owner = owner
// all = anyone not in the above categories
//

describe("setflags", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should mark both players a player, and their color, and their tomove, when the game starts", function() {
    const p1 = self.createUser();
    const p2 = self.createUser();
    const o1 = self.createUser();
    const o2 = self.createUser();
    Game.start
    chai.assert.fail("do me");
  });
  it("should set a user as an observer when they are added to the observers list", function() {
    chai.assert.fail("do me");
  });
  it("should unset a user as an observer when they are removed to the observers list", function() {
    chai.assert.fail("do me");
  });
  it("should alter 'tomove' appropriately as the moves are made", function() {
    chai.assert.fail("do me");
  });
});
