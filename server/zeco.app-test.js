import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import chai from "chai";

describe.only("ECO codes", function(done) {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should add eco index and associated eco information to each new move in game play", function() {
    this.timeout(500000);
    Game.waitForECOCodes(() => {
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
      // eslint-disable-next-line prettier/prettier
      const moves1 = ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "Nf3", "Bg7"];
      // eslint-disable-next-line prettier/prettier
      const moves2 = ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Bc4", "c5", "Ne2", "O-O", "O-O", "Nc6", "Be3", "cxd4", "cxd4", "Bg4", "f3", "Na5", "Bd3"];

      const tomove = [us, them];
      let tm = 0;

      moves1.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        tm = !tm ? 1 : 0;
      });

      self.loggedonuser = tomove[tm];
      Game.requestLocalTakeback("mi2", game_id, 2);
      tm = !tm ? 1 : 0;

      self.loggedonuser = tomove[tm];
      Game.acceptLocalTakeback("mi2", game_id);
      tm = !tm ? 1 : 0;

      moves2.forEach(move => {
        self.loggedonuser = tomove[tm];
        Game.saveLocalMove(move, game_id, move);
        tm = !tm ? 1 : 0;
      });

      const game = Game.collection.findOne();
      done();
    });
  });

  it("should add eco index and associated eco information to each new move in an examined game", function() {});
});
