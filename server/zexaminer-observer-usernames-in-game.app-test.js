import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe("Game", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have username as well as id in observers and examiners collection in an examined game", function() {
    const me = TestHelpers.createUser();
    self.loggedonuser = me;
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.isDefined(game.observers);
    chai.assert.isDefined(game.examiners);
    chai.assert.isDefined(game.observers[0]);
    chai.assert.isDefined(game.examiners[0]);
    chai.assert.equal(game.observers[0].id, me._id);
    chai.assert.equal(game.examiners[0].username, me.username);
    chai.assert.equal(game.observers[0].id, me._id);
    chai.assert.equal(game.examiners[0].username, me.username);
  });

  it("should have username as well as id in observers collection in a played game", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");

    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game);
    chai.assert.isDefined(game.observers);
    chai.assert.isDefined(game.observers[0]);
    chai.assert.equal(game.observers[0].id, observer._id);
    chai.assert.equal(game.observers[0].id, observer._id);
  });
});
