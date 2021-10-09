import chai from "chai";
import { TestHelpers } from "../TestHelpers";
import { GameHistory } from "../Game";

describe("Starting fen", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should be present when starting a game with an examined game id", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user2;
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.loadFen("mi1", game_id, "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPP2PB1/R1B1R1K1 w kq - 0 13");
    const game2_id = Game.startLocalGame(
      "mi2",
      user1,
      0,
      "standard",
      false,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white",
      null,
      game_id
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    const game1 = Game.collection.findOne();
    chai.assert.equal("playing", game1.status);
    chai.assert.equal(game1.white.id, user2._id);
    chai.assert.equal(game1.black.id, user1._id);
    chai.assert.isDefined(game1.tags);
    chai.assert.equal(
      game1.tags.FEN,
      "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPP2PB1/R1B1R1K1 w kq - 0 13"
    );
    chai.assert.equal(game1.fen, "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPP2PB1/R1B1R1K1 w kq - 0 13");
    Game.saveLocalMove("mi?", game2_id, "Bd2");
    Game.resignLocalGame("mi3", game2_id);
    chai.assert.equal(1, Game.collection.find().count());
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.fen, "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPPB1PB1/R3R1K1 b kq - 1 13");
    chai.assert.isDefined(game2.tags);
    chai.assert.equal(
      game2.tags.FEN,
      "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPP2PB1/R1B1R1K1 w kq - 0 13"
    );
    chai.assert.equal(1, GameHistory.collection.find().count());
    const gamehistory = GameHistory.collection.findOne();
    chai.assert.isDefined(gamehistory.tags);
    chai.assert.equal(
      gamehistory.tags.FEN,
      "r3k2r/ppqn1ppp/3bpn2/3p4/8/2N2QPP/PPP2PB1/R1B1R1K1 w kq - 0 13"
    );
  });

  it("should be allow a game to be started with two players with an examined game id", function() {
    // handled above
  });
  it("should be allow a game to be started with ta player and computer with an examined game id", function() {
    //chai.assert.fail("do me");
  });
  it.skip("should be present when starting a game with a game history id", function() {
    chai.assert.fail("do me");
  });
  it.skip("should be allow a game to be started with two players with a game history id", function() {
    chai.assert.fail("do me");
  });
  it.skip("should be allow a game to be started with ta player and computer with a game history id", function() {
    chai.assert.fail("do me");
  });
  it.skip("should be present when starting a game with an imported ame id", function() {
    chai.assert.fail("do me");
  });
  it.skip("should be allow a game to be started with two players with an imported game id", function() {
    chai.assert.fail("do me");
  });
  it.skip("should be allow a game to be started with player and computer with an imported game id", function() {
    chai.assert.fail("do me");
  });
  it("should save the game to game history with the [Fen] tag at game end", function() {
    // handled above
  });
  // it("should be marked in the game as a wild 22", function(){chai.assert.fail("do me")});
  // it("should be marked in the game history as a wild 22", function(){chai.assert.fail("do me")});
  it("should send a client message if the fen is already in checkmate", function() {
    const user1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.loadFen("mi1", game_id, "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
    const game0 = Game.collection.findOne();
    chai.assert.isDefined(game0.tags);
    chai.assert.equal(
      game0.tags.FEN,
      "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3"
    );
    chai.assert.equal(game0.fen, "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
    Game.startLocalGame(
      "mi2",
      user1,
      0,
      "standard",
      false,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white",
      null,
      game_id
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_FEN");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.status, "examining");
  });
  it("should send a client message if the fen is already in stalemate", function() {
    const user1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.loadFen("mi1", game_id, "6rk/8/8/8/5r2/7K/7P/8 w - - 0 1");
    const game0 = Game.collection.findOne();
    chai.assert.isDefined(game0.tags);
    chai.assert.equal(game0.tags.FEN, "6rk/8/8/8/5r2/7K/7P/8 w - - 0 1");
    chai.assert.equal(game0.fen, "6rk/8/8/8/5r2/7K/7P/8 w - - 0 1");
    Game.startLocalGame(
      "mi2",
      user1,
      0,
      "standard",
      false,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white",
      null,
      game_id
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_FEN");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.status, "examining");
  });
  it.skip("should send a client message if the fen is invalid", function() {
    //
    // welp, Chess_js currently does not return invalid fen information. Pretty much anything goes.
    // When they fix this, or if we want to write our own checker, then put this back in.
    const user1 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.loadFen("mi1", game_id, "8/8/2K5/8/8/8/2q2k2/8 b KQkq - 0 1");
    const game0 = Game.collection.findOne();
    chai.assert.isDefined(game0.tags);
    chai.assert.equal(game0.tags.FEN, "8/8/2K5/8/8/8/2q2k2/8 b KQkq - 0 1");
    chai.assert.equal(game0.fen, "8/8/2K5/8/8/8/2q2k2/8 b KQkq - 0 1");
    Game.startLocalGame(
      "mi2",
      user1,
      0,
      "standard",
      false,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white",
      null,
      game_id
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_FEN");
    const game1 = Game.collection.findOne();
    chai.assert.equal(game1.status, "examining");
  });
});
