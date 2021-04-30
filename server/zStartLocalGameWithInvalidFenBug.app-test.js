import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "../server/Game";
import chai from "chai";

describe.skip("Starting a game with an valid fen (bug found 4/29/21)", function() {
  this.timeout(500000);
  const self = TestHelpers.setupDescribe.apply(this);
  it("should not allow the game to be started", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    Game.loadFen("mi2", game_id, "rnbqKbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQ1BNR w KQkq - 0");
    Game.startLocalGame(
      "mi3",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc",
      "white",
      null,
      game_id
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
    const games = Game.GameCollection.find().fetch();
    chai.assert.equal(games.length, 1);
    chai.assert.equal(games[0]._id, game_id);
    chai.assert.equal(games[0].status, "examining");
  });
});
