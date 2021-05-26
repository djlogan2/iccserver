import chai from "chai";
//import { Game } from "./Game";
import { TestHelpers } from "../imports/server/TestHelpers";

describe("Starting new games", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should delete an examined game if two players begin another game with the same color", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.resignLocalGame("mi2", game_id);
    Game.startLocalGame("mi3", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    const games = Game.collection.find().fetch();
    chai.assert.equal(games.length, 1);
  });

  it("should delete an examined game if two players begin another game with opposite colors", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.resignLocalGame("mi2", game_id);
    Game.startLocalGame("mi3", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "black");
    const games = Game.collection.find().fetch();
    chai.assert.equal(games.length, 1);
  });

  it("should delete an examined game if two players (other player) begin another game with the same color", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.resignLocalGame("mi2", game_id);
    self.loggedonuser = p2;
    Game.startLocalGame("mi3", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "black");
    const games = Game.collection.find().fetch();
    chai.assert.equal(games.length, 1);
  });

  it("should delete an examined game if two players (other player) begin another game with opposite colors", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    Game.resignLocalGame("mi2", game_id);
    self.loggedonuser = p2;
    Game.startLocalGame("mi3", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc", "white");
    const games = Game.collection.find().fetch();
    chai.assert.equal(games.length, 1);
  });
});
