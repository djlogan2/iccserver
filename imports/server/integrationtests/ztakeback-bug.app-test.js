import chai from "chai";
import { TestHelpers } from "../TestHelpers";
////import { Game } from "./Game";

describe("To fix a bug in reconnecting with a game in progress", function() {
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

    const move_game = Game.collection.findOne();
    Game.collection.remove({});
    delete move_game._id;
    const new_game_id = Game.collection.insert(move_game);

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
