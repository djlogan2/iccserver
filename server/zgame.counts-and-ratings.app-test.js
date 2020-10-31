//    ratingobject[rr.rating_type] = {
//       rating: rr.default_rating,
//       need: 0,
//       won: 0,
//       draw: 0,
//       lost: 0,
//       best: 0
//     };
import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";

describe("Game counts and ratings", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("Winning an unrated game in a category updates rating object correctly", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user2;
    const game = Game.startLocalGame(
      "mi1",
      user1,
      0,
      "standard",
      false,
      15,
      15,
      "none",
      15,
      15,
      "none"
    );
    Game.resignLocalGame("mi2", game);
    const u1 = Meteor.users.findOne({ _id: user1._id });
    const u2 = Meteor.users.findOne({ _id: user2._id });
    chai.assert.equal(u1.ratings.standard.won, 0);
    chai.assert.equal(u1.ratings.standard.draw, 0);
    chai.assert.equal(u1.ratings.standard.lost, 0);
    chai.assert.equal(u2.ratings.standard.won, 0);
    chai.assert.equal(u2.ratings.standard.draw, 0);
    chai.assert.equal(u2.ratings.standard.lost, 0);
    chai.assert.equal(u1.ratings.standard.rating, user1.ratings.standard.rating);
    chai.assert.equal(u2.ratings.standard.rating, user2.ratings.standard.rating);
  });

  it("Drawing an unrated game in a category updates rating object correctly", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user2;
    const game = Game.startLocalGame(
      "mi1",
      user1,
      0,
      "standard",
      false,
      15,
      15,
      "none",
      15,
      15,
      "none"
    );

    ["a3", "a6", "b3", "b6", "c3", "c6", "d3", "d6", "e3", "e6", "f3", "f6"].forEach(move => {
      Game.saveLocalMove(move, game, move);
      self.loggedonuser = self.loggedonuser._id === user1._id ? user2 : user1;
    });

    Game.requestLocalDraw("draw", game);
    self.loggedonuser = user2;
    Game.acceptLocalDraw("accept", game);

    const u1 = Meteor.users.findOne({ _id: user1._id });
    const u2 = Meteor.users.findOne({ _id: user2._id });
    chai.assert.equal(u1.ratings.standard.won, 0);
    chai.assert.equal(u1.ratings.standard.draw, 0);
    chai.assert.equal(u1.ratings.standard.lost, 0);
    chai.assert.equal(u2.ratings.standard.won, 0);
    chai.assert.equal(u2.ratings.standard.draw, 0);
    chai.assert.equal(u2.ratings.standard.lost, 0);
    chai.assert.equal(u1.ratings.standard.rating, user1.ratings.standard.rating);
    chai.assert.equal(u2.ratings.standard.rating, user2.ratings.standard.rating);
  });

  it("Winning a rated game in a category updates rating object correctly", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    self.loggedonuser = user2;
    const game = Game.startLocalGame(
      "mi1",
      user1,
      0,
      "standard",
      true,
      15,
      15,
      "none",
      15,
      15,
      "none"
    );
    Game.resignLocalGame("mi2", game);
    const u1 = Meteor.users.findOne({ _id: user1._id });
    const u2 = Meteor.users.findOne({ _id: user2._id });
    chai.assert.equal(u1.ratings.standard.won, 1);
    chai.assert.equal(u1.ratings.standard.draw, 0);
    chai.assert.equal(u1.ratings.standard.lost, 0);
    chai.assert.equal(u2.ratings.standard.won, 0);
    chai.assert.equal(u2.ratings.standard.draw, 0);
    chai.assert.equal(u2.ratings.standard.lost, 1);
    chai.assert.notEqual(u1.ratings.standard.rating, user1.ratings.standard.rating);
    chai.assert.notEqual(u2.ratings.standard.rating, user2.ratings.standard.rating);
  });

  it("Drawing a rated game in a category updates rating object correctly", function() {
    const user1 = TestHelpers.createUser();
    const user2 = TestHelpers.createUser();
    Meteor.users.update(
      { _id: user1._id },
      { $set: { "ratings.standard.rating": 1900, "ratings.standard.won": 5 } }
    );
    self.loggedonuser = user2;
    const game = Game.startLocalGame(
      "mi1",
      user1,
      0,
      "standard",
      true,
      15,
      15,
      "none",
      15,
      15,
      "none"
    );

    ["a3", "a6", "b3", "b6", "c3", "c6", "d3", "d6", "e3", "e6", "f3", "f6"].forEach(move => {
      Game.saveLocalMove(move, game, move);
      self.loggedonuser = self.loggedonuser._id === user1._id ? user2 : user1;
    });

    Game.requestLocalDraw("draw", game);
    self.loggedonuser = user2;
    Game.acceptLocalDraw("accept", game);

    const u1 = Meteor.users.findOne({ _id: user1._id });
    const u2 = Meteor.users.findOne({ _id: user2._id });
    chai.assert.equal(u1.ratings.standard.won, 5);
    chai.assert.equal(u1.ratings.standard.draw, 1);
    chai.assert.equal(u1.ratings.standard.lost, 0);
    chai.assert.equal(u2.ratings.standard.won, 0);
    chai.assert.equal(u2.ratings.standard.draw, 1);
    chai.assert.equal(u2.ratings.standard.lost, 0);
    chai.assert.notEqual(u1.ratings.standard.rating, user1.ratings.standard.rating);
    chai.assert.notEqual(u2.ratings.standard.rating, user2.ratings.standard.rating);
  });
});
