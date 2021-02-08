import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { Users } from "../imports/collections/users";

describe("Expanded game status codes", function() {
  this.timeout(10000);
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  function playGame(moves) {
    const ret = {
      p1: TestHelpers.createUser(),
      p2: TestHelpers.createUser()
    };
    self.loggedonuser = ret.p1;
    ret.game_id = Game.startLocalGame(
      "mi1",
      ret.p2,
      0,
      "standard",
      true,
      1,
      0,
      "none",
      1,
      0,
      "none",
      "white"
    );
    moves.forEach(move => {
      Game.saveLocalMove("mi2-" + move, ret.game_id, move);
      if (self.loggedonuser._id === ret.p1._id) self.loggedonuser = ret.p2;
      else self.loggedonuser = ret.p1;
    });

    return ret;
  }

  //   [0, "Res", "<color> resigns"],
  it("should record status2 of zero when white resigns", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4","h5"]);
    Game.resignLocalGame("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "0-1");
    chai.assert.equal(game.status2, 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b0");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b0");
  });

  it("should record status2 of zero when black resigns", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4","h5","Ra2"]);
    Game.resignLocalGame("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1-0");
    chai.assert.equal(game.status2, 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w0");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w0");
  });

  //   [1, "Mat", "<color> checkmated"],
  it("should record status2 of 1 when black is checkmated", function() {
    const result = playGame(["e4", "f6", "d4", "g5", "Qh5"]);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1-0");
    chai.assert.equal(game.status2, 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w1");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w1");
  });

  it("should record status2 of 1 when white is checkmated", function() {
    const result = playGame(["f4", "e6", "g4", "Qh4"]);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "0-1");
    chai.assert.equal(game.status2, 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b1");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b1");
  });

  //   [2, "Fla", "<color> forfeits on time."],
  it("should record status2 of 2 when white runs out of time", function() {
    this.timeout(60 * 1000 + 3000); // 1m timeout plus default of 3000ms
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4","h5"]);
    self.clock.tick(60 * 1000); // Let the 15 minutes expire. The game should end
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "0-1");
    chai.assert.equal(game.status2, 2);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b2");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b2");
  });

  it("should record status2 of 2 when black runs out of time", function() {
    this.timeout(60 * 1000 + 3000); // 1m timeout plus default of 3000ms
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4","h5","Ra2"]);
    self.clock.tick(60 * 1000); // Let the 15 minutes expire. The game should end
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1-0");
    chai.assert.equal(game.status2, 2);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w2");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w2");
  });

  //   [3, "Adj", "<opposite-color> declared the winner by adjudication"],
  it.skip("should record status2 of 3 when the game is adjudicated for white", function() {
    chai.assert.fail("do me");
  });

  it.skip("should record status2 of 3 when the game is adjudicated for black", function() {
    chai.assert.fail("do me");
  });

  //   [4, "?Q", "<color> disconnected and forfeits"],
  it("should record status2 of 4 when white disconnects and forfeits", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4"]);
    Users.events.emit("userLogout", { userId: result.p1._id });
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "0-1");
    chai.assert.equal(game.status2, 4);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b4");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b4");
  });

  it("should record status2 of 4 when black disconnects and forfeits", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4","h5"]);
    Users.events.emit("userLogout", { userId: result.p2._id });
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1-0");
    chai.assert.equal(game.status2, 4);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w4");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w4");
  });

  //   [5, "?Q", "<color> got disconnected and forfeits"],
  it.skip("should record status2 of 5 when white gets disconnected and forfeits", function() {
    chai.assert.fail("do me");
  });

  it.skip("should record status2 of 5 when black gets disconnected and forfeits", function() {
    chai.assert.fail("do me");
  });
  //   [6, "?Q", "Unregistered player <color> disconnected and forfeits"],
  // TODO: What condition(s) is this exactly?
  //
  //   [7, "Res", "<color>'s partner resigns"],
  //   [8, "Mat", "<color>'s partner checkmated"],
  //   [9, "Fla", "<color>'s partner forfeits on time"],
  //   [10, "?Q", "<color>'s partner disconnected and forfeits"],
  //   [11, "?Q", "<color> disconnected and forfeits [obsolete?]"],
  //   [12, "1-0", "<opposite-color> wins [specific reason unknown]"],
  //   [13, "Agr", "Game drawn by mutual agreement"],
  it("should record status2 of 13 when the game is drawn by mutual agreement", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4"]);
    Game.requestLocalDraw("mi2", result.game_id);
    self.loggedonuser = result.p2;
    Game.acceptLocalDraw("mi3", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 13);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b13");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b13");
  });

  //   [14, "Sta", "<color> stalemated"],
  it("should record status2 of 14 when white gets stalemated", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e3","a5","Qh5","Ra6","Qxa5","h5","Qxc7","Rah6","h4","f6","Qxd7","Kf7","Qxb7","Qd3","Qxb8","Qh7","Qxc8","Kg6","Qe6"]);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 14);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b14");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b14");
  });

  it("should record status2 of 14 when black gets stalemated", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["d4","d6","Qd2","e5","a4","e4","Qf4","f5","h3","Be7","Qh2","Be6","Ra3","c5","Rg3","Qa5","Nd2","Bh4","f3","Bb3","d5","e3","c4","f4"]);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 14);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w14");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w14");
  });

  //   [15, "Rep", "Game drawn by repetition"],
  it("should record status2 of 15 when there is a draw by repetition", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6"]);
    Game.requestLocalDraw("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 15);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w15");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w15");
  });

  //   [16, "50", "Game drawn by the 50 move rule"],
  it("should record status2 of 16 when white draws by the 50 move rule", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e3","e6","Be2","Be7","Bd3","Bd6","Bc4","Bc5","Bb5","Bb4","Ba6","Ba3","Nc3","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","Be7","Be2","Bf8","Bf1","Nc6","Be2","Be7","Bd3","Bd6","Bc4","Bc5","Bb5","Bb4","Ba6","Ba3","Nge2","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","Be7","Ng3","Bf8","Be2","Be7","Bf1","Bd6","Be2","Bc5","Bd3","Bb4","Bc4","Ba3","Bb5","Bb4","Ba6","Bc5","Bb5","Bd6","Bc4","Be7","Bd3","Bf8","Be2","Be7","Bf1","Bd6","Be2","Nge7","Bd3","Bc5","Bc4","Bb4","Bb5","Ba3","Ba6","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","O-O","Be2","Bc5","O-O","Bb4","Bd3","Ba3","Bc4","Bb4","Bb5","Bc5","Ba6","Bd6","Bb5","Bc5","Bc4","Bd6","Re1","Re8"]);
    Game.requestLocalDraw("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 16);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w16");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w16");
  });

  it("should record status2 of 16 when black draws by the 50 move rule", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e3","e6","Be2","Be7","Bd3","Bd6","Bc4","Bc5","Bb5","Bb4","Ba6","Ba3","Nc3","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","Be7","Be2","Bf8","Bf1","Nc6","Be2","Be7","Bd3","Bd6","Bc4","Bc5","Bb5","Bb4","Ba6","Ba3","Nge2","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","Be7","Ng3","Bf8","Be2","Be7","Bf1","Bd6","Be2","Bc5","Bd3","Bb4","Bc4","Ba3","Bb5","Bb4","Ba6","Bc5","Bb5","Bd6","Bc4","Be7","Bd3","Bf8","Be2","Be7","Bf1","Bd6","Be2","Nge7","Bd3","Bc5","Bc4","Bb4","Bb5","Ba3","Ba6","Bb4","Bb5","Bc5","Bc4","Bd6","Bd3","O-O","Be2","Bc5","O-O","Bb4","Bd3","Ba3","Bc4","Bb4","Bb5","Bc5","Ba6","Bd6","Bb5","Bc5","Bc4","Bd6","Bd3","Re8","Re1"]);
    Game.requestLocalDraw("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 16);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b16");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b16");
  });

  //   [17, "TM", "<color> ran out of time and <opposite-color> has no material to mate"],
  it.skip("should record status2 of 17 when white ran out of time without black having mating material", function() {
    // TODO: chess.js does not have this ability...What do we want to do here?
    this.timeout(60 * 1000 + 3000); // 1m timeout plus default of 3000ms
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e4","d5","exd5","c6","dxc6","Qxd2+","Qxd2","e5","f4","exf4","g3","fxg3","cxb7","Bxb7","Qd8+","Kxd8","b4","gxh2","Rxh2","a5","bxa5","Rxa5","Rxh7","Rxa2","Rxh8","Rxa1","Rxg8","Rxb1","Rxf8+","Ke7","Rxb8","Rxc1+","Kd2","Rxf1","Rxb7+","Kd8","Rxf7","Rxg1","Rxg7","Rg2+","Kd3","Rxc2","Kxc2"]);
    self.clock.tick(60 * 1000); // Let the 15 minutes expire. The game should end
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 17);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w17");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w17");
  });

  it.skip("should record status2 of 17 when black ran out of time without white having mating material", function() {
    // TODO: chess.js does not have this ability...What do we want to do here?
    this.timeout(60 * 1000 + 3000); // 1m timeout plus default of 3000ms
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e4","d5","exd5","c6","dxc6","Qxd2+","Qxd2","e5","f4","exf4","g3","fxg3","cxb7","Bxb7","Qd8+","Kxd8","b4","gxh2","Rxh2","a5","bxa5","Rxa5","Rxh7","Rxa2","Rxh8","Rxa1","Rxg8","Rxb1","Rxf8+","Ke7","Rxb8","Rxc1+","Kd2","Rxf1","Rxb7+","Kd8","Rxf7","Rxg1","Rxg7","Rg2+","Kd3","Rxc2","Rg2","Rxg2"]);
    self.clock.tick(60 * 1000); // Let the 15 minutes expire. The game should end
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 17);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w17");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w17");
  });

  //   [18, "NM", "Game drawn because neither player has mating material"],
  it("should record status2 of 18 when neither player has mating material", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e4","d5","exd5","c6","dxc6","Qxd2+","Qxd2","e5","f4","exf4","g3","fxg3","cxb7","Bxb7","Qd8+","Kxd8","b4","gxh2","Rxh2","a5","bxa5","Rxa5","Rxh7","Rxa2","Rxh8","Rxa1","Rxg8","Rxb1","Rxf8+","Ke7","Rxb8","Rxc1+","Kd2","Rxf1","Rxb7+","Kd8","Rxf7","Rxg1","Rxg7","Rg2+","Kd3","Rxc2","Rc7","Kxc7","Kxc2"]);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "1/2-1/2");
    chai.assert.equal(game.status2, 18);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b18");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b18");
  });
  //   [19, "NT", "Game drawn because both players ran out of time"],
  //   [20, "Adj", "Game drawn by adjudication"],
  it.skip("should record status2 of 20 when game is drawn by adjudication", function() {
    chai.assert.fail("do me");
  });
  //   [21, "Agr", "Partner's game drawn by mutual agreement"],
  //   [22, "NT", " Partner's game drawn because both players ran"],
  //   [23, "1/2", "Game drawn [specific reason unknown]"],
  //   [24, "?", "Game adjourned by mutual agreement"],
  it("should record status2 of 24 when game is adjourned by mutual agreement", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4"]);
    Game.requestLocalAdjourn("mi2", result.game_id);
    self.loggedonuser = result.p2;
    Game.acceptLocalAdjourn("mi3", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "*");
    chai.assert.equal(game.status2, 24);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b24");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b24");
  });
  //   [25, "?", "Game adjourned when <color> disconnected"],
  //   [26, "?", "Game adjourned by system shutdown"],
  it.skip("should record status2 of 26 when game is adjourned by sytem shutdown", function() {
    chai.assert.fail("do me");
  });
  //   [27, "?", "Game courtesyadjourned by <color>"],
  //   [28, "?", "Game adjourned by an administrator"],
  //   [29, "?", "Game adjourned when <color> got disconnected"],
  //   [30, "Agr", "Game aborted by mutual agreement"],
  it("should record status2 of 30 when game is aborted by mutual agreement", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["a4","a5","b4","b5","c4","c5","d4","d5","e4","e5","f4","f5","g4","g5","h4"]);
    Game.requestLocalAbort("mi2", result.game_id);
    self.loggedonuser = result.p2;
    Game.acceptLocalAbort("mi3", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "*");
    chai.assert.equal(game.status2, 30);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b30");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b30");
  });
  //   [31, "?Q", "Game aborted when <color> disconnected"],
  it.skip("should record status2 of 31 when white disconnected and game was aborted", function() {
    chai.assert.fail("do me");
  });
  it.skip("should record status2 of 31 when black disconnected and game was aborted", function() {
    chai.assert.fail("do me");
  });
  //   [32, "SD", "Game aborted by system shutdown"],
  it.skip("should record status2 of 32 game aborted by system shutdown (in game_history, not game)", function() {
    chai.assert.fail("do me");
  });
  //   [33, "?A", "Game courtesyaborted by <color>"],
  //   [34, "Adj", "Game aborted by an administrator"],
  it.skip("should record status2 of 34 when game is aborted by administrator", function() {
    chai.assert.fail("do me");
  });
  //   [35, "Sho", "Game aborted because it's too short to adjourn"],
  it.skip("should record status2 of 35 when game is aborted because it's too short to adjourn", function() {
    chai.assert.fail("do me");
  });
  //   [36, "?Q", " Game aborted when <color>'s partner disconnected"],
  //   [37, "Sho", "Game aborted by <color> at move 1"],
  it("should record status2 of 37 when white aborted at move 1", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame([]);
    Game.requestLocalAbort("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "*");
    chai.assert.equal(game.status2, 37);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_w37");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_w37");
  });

  it("should record status2 of 37 when black aborted at move 1", function() {
    // eslint-disable-next-line prettier/prettier
    const result = playGame(["e4"]);
    Game.requestLocalAbort("mi2", result.game_id);
    const game = Game.collection.findOne({ _id: result.game_id });
    chai.assert.equal(game.status, "examining");
    chai.assert.equal(game.result, "*");
    chai.assert.equal(game.status2, 37);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][0], result.p1._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_STATUS_b37");
    chai.assert.equal(self.clientMessagesSpy.args[1][0], result.p2._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][1], "server:game:" + game._id);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "GAME_STATUS_b37");
  });
  //   [38, "Sho", "Game aborted by <color>'s partner at move 1"],
  //   [39, "Sho", "Game aborted because it's too short"],
  //   [40, "Adj", "Game aborted because <color>'s account expired"],
  //   [41, "?Q", "Game aborted when <color> got disconnected"],
  it.skip("should record status2 of 41 when white got disconnected and game was aborted", function() {
    chai.assert.fail("do me");
  });
  it.skip("should record status2 of 41 when black got disconnected and game was aborted", function() {
    chai.assert.fail("do me");
  });
  //   [42, "?", "No result [specific reason unknown]"]
  // ];
});
