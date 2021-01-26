import chai from "chai";
import { Random } from "meteor/random";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe.only("To fix a bug in reconnecting with a game in progress", function() {
  this.timeout(5000000);
  const self = TestHelpers.setupDescribe.apply(this);
  it("should rebuild the chess_js move list upon reconnect so that takebacks continue to work", function() {
    const players = [TestHelpers.createUser(), TestHelpers.createUser()];
    const moves = ["e4", "e5", "Nc3", "Nc6", "Nf3", "Nf6"];
    self.loggedonuser = players[0];

    const game_id = Game.startLocalGame(
      "mi1",
      players[1],
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc",
      "white"
    );

    moves.forEach(move => {
      self.loggedonuser = players.shift();
      players.push(self.loggedonuser);
      Game.saveLocalMove(move, game_id, move);
    });

    const new_game_id = Random.id();
    Game.collection.update({ _id: game_id, status: "playing" }, { $set: { _id: new_game_id } });

    // Game.gameLogoutHook(players[0]._id);
    // Game.gameLoginHook(players[0]._id);
    // Game.gameLogoutHook(players[1]._id);
    // Game.gameLoginHook(players[1]._id);

    self.loggedonuser = players[0];
    Game.requestLocalTakeback("tb1", new_game_id, 1);

    self.loggedonuser = players[1];
    Game.acceptLocalTakeback("tb2", new_game_id);
    Game.requestLocalTakeback("tb3", new_game_id, 1);

    self.loggedonuser = players[0];
    Game.acceptLocalTakeback("tb4", new_game_id);

    const game = Game.collection.findOne();
    chai.assert.equal(game.fen, "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 3");
  });
});
