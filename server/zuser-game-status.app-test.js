import chai from "chai";
import { Meteor } from "meteor/meteor";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe("Game status field in user record", function() {
  const self = TestHelpers.setupDescribe.call(this, { timer: true });

  const statii = ["none", "playing_local", "playing_legacy", "observing", "examining"];
  const gameends = ["draw", "adjourn", "abort", "resign", "checkmate", "stalemate", "material", "repetition", "time"];

  function setupCondition(user, condition, fromcondition) {
    switch (condition) {
      case "none":
        self.loggedonuser = user;
        break;
      case "playing_local":
        self.loggedonuser = user;
        Game.startLocalGame("mi1", TestHelpers.createUser(), 0, "standard", true, 1, 0, "none", 1, 0, "none");
        break;
      case "playing_legacy":
        self.loggedonuser = user;
        Game.startLegacyGame("mi1", 123, user.profile.legacy.username, "dood", 0, "Standard", true, 15, 0, 15, 0, true, 1600, 1600, "x", [], [], "");
        break;
      case "observing":
        self.loggedonuser = TestHelpers.createUser();
        const game_id = Game.startLocalGame("mi1", TestHelpers.createUser(), 0, "standard", true, 1, 0, "none", 1, 0, "none");
        self.loggedonuser = user;
        Game.localAddObserver("mi2", game_id, user._id);
        break;
      case "examining":
        const game = Game.collection.findOne({
          $or: [{ "white.id": user._id }, { "black.id": user._id }, { "observers.id": user._id }]
        });
        if (!!game && (game.white.id === user._id || game.black.id === user._id)) {
          if (!!game.legacy_game_number) Game.legacyGameEnded("mi4", game.legacy_game_number, true, "grc", "0-1");
          else Game.resignLocalGame("mi5", game._id);
          return;
        }
        const owner = TestHelpers.createUser();
        self.loggedonuser = owner;
        const game_id2 = Game.startLocalExaminedGame("mi2", "white", "black", 0);
        self.loggedonuser = user;
        Game.localAddObserver("mi2", game_id2, user._id);
        self.loggedonuser = owner;
        Game.localAddExaminer("mi3", game_id2, user._id);
        self.loggedonuser = user;
        break;
      default:
        throw new Error("Unknown condition");
    }
  }

  function transitionToCondition(user, condition) {
    switch (condition) {
      case "none":
        const game = Game.collection.findOne({
          $or: [{ "white.id": user._id }, { "black.id": user._id }, { "observers.id": user._id }]
        });
        if (game && game.legacy_game_id) {
          Game.legacyGameEnded("mi2", game.legacy_game_number, false, "x", "x");
        } else if (game && game.status === "playing") {
          Game.resignLocalGame("mi1", game._id);
          Game.localRemoveObserver("mi2", game._id, user._id);
        } else if (game && game.status === "examining") {
          Game.localRemoveObserver("mi2", game._id, user._id);
        } else if (game) {
          throw new Error("Unknown condition");
        } else {
          // We are already doing nothing
        }
        break;
      case "playing_local":
      case "playing_legacy":
      case "observing":
      case "examining":
        return setupCondition(user, condition);
      default:
        throw new Error("Unknown condition");
    }
  }

  function playMoves(game, moves) {
    const white = Meteor.users.findOne({ _id: game.white.id });
    const black = Meteor.users.findOne({ _id: game.black.id });
    const tomove = [white, black];
    let tm = 0;
    moves.forEach(move => {
      self.loggedonuser = tomove[tm];
      Game.saveLocalMove(move, game._id, move);
      tm = !tm ? 1 : 0;
    });
  }

  function endGame(user, gameend) {
    const game = Game.collection.findOne({
      $or: [{ "white.id": user._id }, { "black.id": user._id }]
    });
    if (!game || game.status !== "playing") throw new Error("Game is not being played");
    const otherid = game.white.id === user._id ? game.black.id : game.white.id;
    const other = Meteor.users.findOne({ _id: otherid });
    switch (gameend) {
      case "draw":
        self.loggedonuser = other;
        Game.requestLocalDraw("mi1", game._id);
        self.loggedonuser = user;
        Game.acceptLocalDraw("mi2", game._id);
        break;
      case "adjourn":
        self.loggedonuser = other;
        Game.requestLocalAdjourn("mi1", game._id);
        self.loggedonuser = user;
        Game.acceptLocalAdjourn("mi2", game._id);
        break;
      case "abort":
        self.loggedonuser = other;
        Game.requestLocalAbort("mi1", game._id);
        self.loggedonuser = user;
        Game.acceptLocalAbort("mi2", game._id);
        break;
      case "resign":
        self.loggedonuser = user;
        Game.resignLocalGame("mi2", game._id);
        break;
      case "checkmate":
        playMoves(game, ["f4", "e6", "g4", "Qh4"]);
        break;
      case "stalemate":
        playMoves(game, ["e3", "a5", "Qh5", "Ra6", "Qxa5", "h5", "h4", "Rah6", "Qxc7", "f6", "Qxd7", "Kf7", "Qxb7", "Qd3", "Qxb8", "Qh7", "Qxc8", "Kg6", "Qe6"]);
        break;
      case "repetition":
        playMoves(game, ["e4", "e5", "Be2", "Be7", "Bf1", "Bf8", "Be2", "Be7", "Bf1", "Bf8", "Be2"]);
        self.loggedonuser = user;
        Game.requestLocalDraw("mi3", game._id); // Should be automatic since we have a draw by repetition
        break;
      case "material":
        playMoves(game, ["e4", "e5", "f4", "exf4", "g3", "fxg3", "Nf3", "gxh2", "Rxh2", "f5", "exf5", "d5", "d4", "c5", "dxc5", "b6", "cxb6", "Nc6", "bxa7", "Rxa7", "Qxd5", "Bxf5", "Rxh7", "Rxa2", "Rxh8", "Rxa1", "Rxg8", "Rxb1", "Rxf8", "Kxf8", "Qxc6", "Rxb2", "Qc8", "Rxc2", "Qxd8", "Kf7", "Nd4", "Rxc1", "Kd2", "Rxf1", "Nxf5", "Rxf5", "Qd7", "Kf6", "Qxg7", "Ke6", "Qg6", "Rf6", "Qxf6", "Kxf6"]);
        break;
      case "time":
        self.clock.tick(1 * 60 * 1000); // Let the 15 minutes expire. The game should end
        break;
      default:
        break;
    }
    self.loggedonuser = user;
  }

  function doit(from, to) {
    it("should correctly set user status when transitioning from " + from + " to " + to, function() {
      this.timeout(62000);
      const user = TestHelpers.createUser();
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, "none");
      setupCondition(user, from);
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, from.indexOf("playing") ? from : "playing");
      transitionToCondition(user, to);
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, to.indexOf("playing") ? to : "playing");
    });
  }

  for (let x = 0; x < statii.length; x++) {
    for (let y = x + 1; y < statii.length; y++) {
      if (statii[x] === "playing_local" && statii[y] === "playing_legacy") continue;
      if (statii[x] === "playing_local" && statii[y] === "observing") continue;
      if (statii[x] === "playing_legacy" && statii[y] === "observing") continue;
      if (statii[x] !== "playing_local" || statii[y] !== "examining") doit(statii[x], statii[y]);
      doit(statii[y], statii[x]);
    }
  }

  gameends.forEach(ge => {
    it("should correctly set status to examining when game ends by " + ge, function(done) {
      const user = TestHelpers.createUser();
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, "none");
      setupCondition(user, "playing_local");
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, "playing");
      endGame(user, ge);
      chai.assert.equal(Meteor.users.findOne({ _id: user._id }).status.game, "examining");
      done();
    });
  });
});
