import chai from "chai";

import { Game, GameHistory } from "./Game";
import { TestHelpers, compare } from "../imports/server/TestHelpers";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

const examined_game_fields = {
  startTime: 1,
  result: 1,
  fen: 1,
  tomove: 1,
  wild: 1,
  rating_type: 1,
  rated: 1,
  status: 1,
  clocks: {
    white: {
      initial: 1,
      inc_or_delay: 1,
      delaytype: 1
    },
    black: {
      initial: 1,
      inc_or_delay: 1,
      delaytype: 1
    }
  },
  white: {
    name: 1,
    id: 1,
    rating: 1
  },
  black: {
    name: 1,
    id: 1,
    rating: 1
  },
  tags: 1,
  actions: 1,
  observers: 1,
  examiners: 1,
  variations: {
    cmi: 1,
    variations: 1
  }
};

const game_history_fields = {
  startTime: 1,
  result: 1,
  wild: 1,
  rating_type: 1,
  rated: 1,
  clocks: {
    white: {
      initial: 1,
      inc_or_delay: 1,
      delaytype: 1
    },
    black: {
      initial: 1,
      inc_or_delay: 1,
      delaytype: 1
    }
  },
  white: {
    name: 1,
    id: 1,
    rating: 1
  },
  black: {
    name: 1,
    id: 1,
    rating: 1
  },
  actions: 1,
  variations: { variations: 1 }
};

describe("Game history", function() {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });
  it("copies to game_history when a game is resigned", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("copies to game_history when a game is aborted", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    Game.requestLocalAbort("mi2", game_id);
    self.loggedonuser = p2;
    Game.acceptLocalAbort("mi3", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("copies to game_history when a game is drawn", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    Game.requestLocalDraw("mi2", game_id);
    self.loggedonuser = p2;
    Game.acceptLocalDraw("mi3", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("copies to game_history when a game is ended by out of time", function() {
    this.timeout(60 * 1000 * 2); // 2 minute timeout
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    self.clock.tick(60 * 1000); // 1 minute
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("copies to game_history when a game is ended by checkmate", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);

    const moves = ["f4", "e6", "g4", "Qh4"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });

    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });
  it("copies to game_history when a game is ended by stalemate", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    // eslint-disable-next-line prettier/prettier
      const moves = ["e3", "a5", "Qh5", "Ra6", "Qxa5", "h5", "h4", "Rah6", "Qxc7", "f6", "Qxd7", "Kf7", "Qxb7", "Qd3", "Qxb8", "Qh7", "Qxc8", "Kg6", "Qe6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("copies to game_history when a game is ended by draw by insufficient material", function() {
    this.timeout(5000);
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    // Yea, I had to do this one manually, so it's a zillion moves. Feel free to shorten!
    // eslint-disable-next-line prettier/prettier
      const moves = ["e4", "e5", "f4", "exf4", "g3", "fxg3", "Nf3", "gxh2", "Rxh2", "f5", "exf5", "d5", "d4", "c5", "dxc5", "b6", "cxb6", "Nc6", "bxa7", "Rxa7", "Qxd5", "Bxf5", "Rxh7", "Rxa2", "Rxh8", "Rxa1", "Rxg8", "Rxb1", "Rxf8", "Kxf8", "Qxc6", "Rxb2", "Qc8", "Rxc2", "Qxd8", "Kf7", "Nd4", "Rxc1", "Kd2", "Rxf1", "Nxf5", "Rxf5", "Qd7", "Kf6", "Qxg7", "Ke6", "Qg6", "Rf6", "Qxf6", "Kxf6"];
    const tomove = [us, them];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game_id, move);
      tm = !tm ? 1 : 0;
    });
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("must fail if trying to copy an examined game to game history", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    // It won't save an examained game because white.id and black.id don't exist if a game is just examined.
    // There is no other good way to really know if a game is examined, so sure, I'll let this one go. If you try to save
    // a non-played game, you will get the error: Error: ID is required (white.id) in game_history insert
    chai.assert.throws(() => GameHistory.savePlayedGame("mi2", game_id), Error);
  });
  it("must fail if trying to copy a legacy game to game history", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLegacyGame(
      "mi2",
      123,
      self.loggedonuser.profile.legacy.username,
      "blackdood",
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      true,
      1600,
      1600,
      "x",
      [],
      [],
      ""
    );
    chai.assert.throws(() => GameHistory.savePlayedGame("mi2", game_id), Error);
  });

  it("must fail if trying to copy the same game to game history more than once", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    Game.resignLocalGame("mi2", game_id);
    chai.assert.throws(() => GameHistory.savePlayedGame("mi3", game_id));
  });

  function createHistoryGame() {
    const save = self.loggedonuser;
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    Game.resignLocalGame("mi2", game_id);
    Game.localRemoveObserver("mi3", game_id, p1._id);
    self.loggedonuser = p2;
    Game.localRemoveObserver("mi4", game_id, p2._id);
    self.loggedonuser = save;
    return GameHistory.collection.findOne({ _id: game_id });
  }

  it("needs to copy a history game to the game collection when examining a game history game", function() {
    const hgame = createHistoryGame();
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.equal(Game.collection.find().count(), 0);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
    chai.assert.doesNotThrow(() => GameHistory.examineGame("mi1", hgame._id));
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
  });

  it("needs to remove all of the unnecessary game collection fields when copying to history", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);

    const game = GameHistory.collection.findOne();
    compare(game_history_fields, game);
  });

  it("needs to add/create all of the necessary game collection fields when copying to game/examine", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 0);
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);

    const hist = GameHistory.collection.findOne();

    self.loggedonuser = p3;
    const game2_id = GameHistory.examineGame("mi3", hist._id);
    chai.assert.isDefined(game2_id);
    const game = Game.collection.findOne({ _id: game2_id });
    chai.assert.isDefined(game);
    compare(examined_game_fields, game);
  });

  it("needs to write a client message if the user is playing a game and tries to examine a game", function() {
    const hgame = createHistoryGame();
    chai.assert.equal(Game.collection.find().count(), 0);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
    self.loggedonuser = p2;
    GameHistory.examineGame("mi2", hgame._id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 1);
    chai.assert.isTrue(self.clientMessagesSpy.calledThrice);
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "ALREADY_PLAYING");
  });

  it("needs to unobserve all other games if a user examines a game history game", function() {
    this.timeout(30000);
    const hgame = createHistoryGame();

    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    Game.resignLocalGame("mi2", game_id);
    chai.assert.equal(Game.collection.find().count(), 1);
    chai.assert.equal(GameHistory.collection.find().count(), 2);
    self.loggedonuser = p2;
    const game2_id = GameHistory.examineGame("mi2", hgame._id);
    chai.assert.equal(Game.collection.find().count(), 2);
    chai.assert.equal(GameHistory.collection.find().count(), 2);
    const p1examined = Game.collection.findOne({ _id: game_id });
    const p2examined = Game.collection.findOne({ _id: game2_id });
    chai.assert.sameMembers(p1examined.examiners.map(ex => ex.id), [p1._id]);
    chai.assert.sameMembers(p2examined.examiners.map(ex => ex.id), [p2._id]);
  });

  it("needs to have a search method anyone can use, with pagination", function() {
    this.timeout(60000); // creating the 100 games takes 30s on my machine - djl

    const games = [];
    for (let x = 0; x < 100; x++) games.push(createHistoryGame()._id);
    self.loggedonuser = TestHelpers.createUser({
      roles: ["search_game_history"]
    });
    for (let x = 0; x < 10; x++) {
      const cursor = GameHistory.search("mi1", {}, x * 10, 10);
      const searchgames = cursor.fetch();
      const ids = searchgames.map(g => g._id);
      chai.assert.equal(searchgames.length, 10);
      chai.assert.sameMembers(ids, games.slice(x * 10, x * 10 + 10));
    }
  });

  it("needs to fail if a user does not have the 'search_game_history' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => GameHistory.search("mi1", {}, 10, 10), ICCMeteorError);
  });
});
