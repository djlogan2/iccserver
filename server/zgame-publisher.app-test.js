import chai from "chai";

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

const fields = {
  analysis: ["observer_3", "owner"],
  arrows: ["observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  black: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  circles: ["observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  clocks: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  computer_variations: ["observer_1", "observer_2", "owner"],
  deny_chat: ["observer_3", "observer_4", "owner"],
  deny_requests: ["observer_3", "observer_4", "owner"],
  examiners: ["observer_2", "observer_3", "observer_4", "owner"],
  fen: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  isolation_group: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  legacy_game_id: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  legacy_game_number: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  observers: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  owner: ["owner"],
  pending: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  premove: ["player_2", "observer_1"],
  private: ["owner"],
  rated: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  rating_type: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  requestors: ["owner"],
  result: ["observer_2", "observer_3", "observer_4", "owner", "all"],
  skill_level: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  startingfen: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  startTime: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  status: ["observer_2", "observer_3", "observer_4", "owner", "all"],
  status2: ["observer_2", "observer_3", "observer_4", "owner", "all"],
  tags: ["observer_2", "observer_3", "observer_4", "owner"],
  tomove: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  variations: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"],
  white: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner", "all"],
  wild: ["player_1", "player_2", "observer_1", "observer_2", "observer_3", "observer_4", "owner"]
};

const types = [
  "player",
  "tomove",
  "observer (played)",
  "observer (public or private with analysis)",
  "observer (private without analysis)",
  "owner",
  "otherwise"
];
describe("setflags", function() {
  it("should mark both players a player, and their color, and their tomove, when the game starts", function() {
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
