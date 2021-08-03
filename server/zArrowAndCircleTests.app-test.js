import chai from "chai";
//import { Game } from "./Game";
import { TestHelpers } from "../imports/server/TestHelpers";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

describe("Game.drawCircle", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called drawCircle", function() {
    chai.assert.isFunction(Game.drawCircle, "Failed to identify Game.drawCircle as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.drawCircle("invalid_id", "invalid", "c1", "red", 3);
    });
  });

  it("should return client message if game is not examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalGame(
      "test_identifier",
      other,
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
    self.loggedonuser = other;
    Game.drawCircle("test_identifier2", game, "c1", "red", 3);
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("test_identifier", "w", "b", 0);
    self.loggedonuser = other;
    Game.drawCircle("test_identifier2", game, "c1", "red", 3);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
  it("should return client message if square is invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "za", "red", 3); // illegal row and column
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_SQUARE");
    Game.drawCircle("mi1", game_id, "c9", "red", 3); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[1][3], "c9");
    Game.drawCircle("mi1", game_id, "c0", "red", 3); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[2][3], "c0");
    Game.drawCircle("mi1", game_id, "i1", "red", 3); // illegal row
    chai.assert.equal(self.clientMessagesSpy.args[3][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[3][3], "i1");
  });
  it("should not add the same square multiple times", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    Game.drawCircle("mi2", game_id, "c1", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 1);
    chai.assert.deepEqual(record.circles[0], { square: "c1", color: "red", size: 3 });
  });
  it("should add the square to the game record if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 1);
    chai.assert.deepEqual(record.circles[0], { square: "c1", color: "red", size: 3 });
  });
  it("should write an action", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("draw_circle", record.actions[0].type, "Failed to record a draw in actions");
    chai.assert.deepEqual(
      { square: "c1", color: "red", size: 3 },
      record.actions[0].parameter,
      "Failed to record a draw in actions"
    );
  });
  it("Should change color of circle if already existing, valid and drawn again with changed color", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    Game.drawCircle("mi2", game_id, "c1", "blue", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles[0].color, "blue", "failed to change color of existing circle");
  });

  it("Should change the size of circle if already existing, valid and drawn again with changed size", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    Game.drawCircle("mi2", game_id, "c1", "red", 5);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles[0].size, 5, "failed to change size of circle");
  });
});
describe("Game.removeCircle", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called removeCircle", function() {
    chai.assert.isFunction(Game.removeCircle, "Failed to identify Game.removeCircle as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.removeCircle("invalid_id", "invalid", "c1");
    });
  });
  it("should return client message if game is not examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalGame(
      "test_identifier",
      other,
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
    self.loggedonuser = other;
    Game.removeCircle("test_identifier2", game, "c1");
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("test_identifier", "w", "b", 0);
    self.loggedonuser = other;
    Game.removeCircle("test_identifier2", game, "c1");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
  it("should return client message if square is invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.removeCircle("mi1", game_id, "za"); // illegal row and column
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_SQUARE");
    Game.removeCircle("mi1", game_id, "c9"); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[1][3], "c9");
    Game.removeCircle("mi1", game_id, "c0"); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[2][3], "c0");
    Game.removeCircle("mi1", game_id, "i1"); // illegal row
    chai.assert.equal(self.clientMessagesSpy.args[3][2], "INVALID_SQUARE");
    chai.assert.equal(self.clientMessagesSpy.args[3][3], "i1");
  });
  it("should not have to remove the same square multiple times", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.removeCircle("mi1", game_id, "c1");
    Game.removeCircle("mi2", game_id, "c1");
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 0);
  });
  it("should remove the square from the game record if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    var record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 1);
    chai.assert.deepEqual(record.circles[0], { square: "c1", color: "red", size: 3 });
    Game.removeCircle("mi1", game_id, "c1");
    record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 0);
  });
  it("should write an action", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawCircle("mi1", game_id, "c1", "red", 3);
    Game.removeCircle("mi1", game_id, "c1");
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(
      "remove_circle",
      record.actions[1].type,
      "Failed to record a draw in actions"
    );
    chai.assert.equal(
      "c1",
      record.actions[1].parameter.square,
      "Failed to record a draw in actions"
    );
  });
});
describe("Game.drawArrow", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called drawArrow", function() {
    chai.assert.isFunction(Game.drawArrow, "Failed to identify Game.drawCircle as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      Game.drawArrow("invalid_id", "invalid", "Dave", "c1", "d2", "red", 3);
    });
  });
  it("should return client message if game is not examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalGame(
      "test_identifier",
      other,
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
    self.loggedonuser = other;
    Game.drawArrow("test_identifier2", game, "c1", "d2", "red", 3);
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("test_identifier", "w", "b", 0);
    self.loggedonuser = other;
    Game.drawArrow("test_identifier2", game, "c1", "d2", "red", 3);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
  it("Should change color of arrow if it already exists", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    Game.drawArrow("mi2", game_id, "c1", "d2", "blue", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows[0].color, "blue", "failed to change color of existing arrow");
  });

  it("Should change the size of arrow if it already exists", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    Game.drawArrow("mi2", game_id, "c1", "d2", "red", 5);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows[0].size, 5, "failed to change size of circle");
  });
  it("should return client message if arrow parameters are invalid", function() {
    chai.assert.throws(() => {
      Game.drawArrow("c2");
    });
  });
  it("should not add the same arrow multiple times (different directions are NOT the same arrow)", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    Game.drawArrow("mi2", game_id, "c1", "d2", "red", 3);
    Game.drawArrow("mi2", game_id, "c1", "d2", "red", 5);
    Game.drawArrow("mi2", game_id, "c1", "d2", "plurple", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows.length, 1);
  });
  it("should add the arrow to the game record if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows.length, 1);
    chai.assert.deepEqual(record.arrows[0], { from: "c1", to: "d2", color: "red", size: 3 });
  });
  it("should write an action", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.actions.length, 1, "failed to write an action");
    chai.assert.equal("draw_arrow", record.actions[0].type, "Failed to record a draw in actions");
    chai.assert.equal("c1", record.actions[0].parameter.from, "Failed to record a draw in actions");
  });
});
describe("Game.removeArrow", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should have a function called removeArrow", function() {
    chai.assert.isFunction(Game.removeArrow, "Failed to identify Game.removeArrow as a function");
  });
  it("should fail if game does not exist", function() {
    chai.assert.throws(() => {
      self.loggedonuser = TestHelpers.createUser();
      Game.removeArrow("invalid_id", "invalid", "c1", "d2");
    }, ICCMeteorError);
  });
  it("should return client message if game is not examined", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalGame(
      "test_identifier",
      other,
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
    self.loggedonuser = other;
    Game.removeArrow("test_identifier2", game, "c1", "d2");
    const message = self.clientMessagesSpy.args[0][2];
    chai.assert.equal(message, "NOT_AN_EXAMINER");
  });
  it("should return client message if user is not an examiner", function() {
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("test_identifier", "w", "b", 0);
    self.loggedonuser = other;
    Game.removeArrow("test_identifier2", game, "c1", "d2");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AN_EXAMINER");
  });
  it("should return client message if square is invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.removeArrow("mi1", game_id, "za", "d2"); // illegal row and column
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_ARROW");
    Game.removeArrow("mi1", game_id, "c9", "d2"); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "INVALID_ARROW");
    chai.assert.equal(self.clientMessagesSpy.args[1][3], "c9");
    chai.assert.equal(self.clientMessagesSpy.args[1][4], "d2");
    Game.removeArrow("mi1", game_id, "c0", "d2"); // illegal column
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "INVALID_ARROW");
    chai.assert.equal(self.clientMessagesSpy.args[2][3], "c0");
    chai.assert.equal(self.clientMessagesSpy.args[2][4], "d2");
    Game.removeArrow("mi1", game_id, "i1", "d2"); // illegal row
    chai.assert.equal(self.clientMessagesSpy.args[3][2], "INVALID_ARROW");
    chai.assert.equal(self.clientMessagesSpy.args[3][3], "i1");
    chai.assert.equal(self.clientMessagesSpy.args[3][4], "d2");
  });
  it("should not produce another action if unable to remove", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.removeArrow("mi1", game_id, "c1", "d2");
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows.length, 0, "failed to ignore unremovable arrow action");
    Game.drawArrow("mi2", game_id, "c1", "d2", "red", 3);
    Game.removeArrow("mi2", game_id, "c1", "d2");
    Game.removeArrow("mi2", game_id, "c1", "d2");
    const record_2 = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record_2.actions[1].type, "remove_arrow", "failed to record remove_arrow");
    chai.assert.equal(record_2.actions.length, 2, "failed to remove only once on arrow");
  });
  it("should remove the arrow from the game record if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    var record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.arrows.length, 1);
    chai.assert.deepEqual(record.arrows[0], { from: "c1", to: "d2", color: "red", size: 3 });
    Game.removeArrow("mi1", game_id, "c1", "d2");
    record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal(record.circles.length, 0);
  });
  it("should write an action", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "whiteguy", "blackguy", 0);
    Game.drawArrow("mi1", game_id, "c1", "d2", "red", 3);
    const record_test = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("c1", record_test.arrows[0].from, "failed to properly update arrows from");
    chai.assert.equal("d2", record_test.arrows[0].to, "failed to properly update arrows to");
    chai.assert.equal("draw_arrow", record_test.actions[0].type, "failed update draw_arrow action");
    Game.removeArrow("mi1", game_id, "c1", "d2");
    const record = Game.collection.findOne({ _id: game_id });
    chai.assert.equal("draw_arrow", record.actions[0].type, "Failed to record a draw in actions");
    chai.assert.equal("c1", record.actions[0].parameter.from, "Failed to record a draw in actions");
    chai.assert.equal("d2", record.actions[0].parameter.to, "Failed to record a draw in actions");
    chai.assert.equal("remove_arrow", record.actions[1].type, "Failed to record a draw in actions");
    chai.assert.equal("c1", record.actions[1].parameter.from, "Failed to record a draw in actions");
    chai.assert.equal("d2", record.actions[1].parameter.to, "Failed to record a draw in actions");
  });
});

describe("Deleting arrows on FEN changes", function(){

  const self = TestHelpers.setupDescribe.apply(this);

  it("should delete arrows on a move forward", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.moveBackward("mi3", game, 1);
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);
    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);
    Game.moveForward("mi5", game, 1);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on a move backward", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.moveBackward("mi3", game, 1);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on a setcmi", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.moveToCMI("mi3", game, 0);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on a savelocalmove", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.saveLocalMove("mi3", game, "e5");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on a loadfen", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.loadFen("mi3", game, "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq f3 0 3");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on a set starting position", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.setStartingPosition("mi3", game);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on add piece", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.addPiece("mi3", game, "w", "p", "d4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on remove piece", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.removePiece("mi3", game, "e4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on set to move", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.setToMove("mi3", game, "w");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on set castling", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.setCastling("mi3", game, '', '');
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on set en passant", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.loadFen("mi2", game, "rnbqkbnr/ppppp3/8/7p/5pPP/8/PPPPP3/RNBQKBNR b KQkq - 0 1");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.setEnPassant("mi5", game, "g4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });

  it("should delete arrows on set tag if tag is a fen", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawArrow("mi4", game, "e4", "e5", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.arrows);
    chai.assert.sameDeepMembers([{from: "e4", to: "e5", color: "red", size: 3}], game1.arrows);

    Game.setTag("mi3", game, "FEN", "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq f3 0 3");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.arrows);
    chai.assert.equal(game2.arrows.length, 0);
  });
});

describe("Deleting circles on FEN changes", function(){

  const self = TestHelpers.setupDescribe.apply(this);

  it("should delete circles on a move forward", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.moveBackward("mi3", game, 1);
    Game.drawCircle("mi4", game, "e4", "red", 3);
    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);
    Game.moveForward("mi5", game, 1);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on a move backward", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.moveBackward("mi3", game, 1);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on a setcmi", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.moveToCMI("mi3", game, 0);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on a savelocalmove", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.saveLocalMove("mi3", game, "e5");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on a loadfen", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.loadFen("mi3", game, "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq f3 0 3");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on a set starting position", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.setStartingPosition("mi3", game);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on add piece", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.addPiece("mi3", game, "w", "p", "d4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on remove piece", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.removePiece("mi3", game, "e4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on set to move", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.setToMove("mi3", game, "w");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on set castling", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.setCastling("mi3", game, '', '');
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on set en passant", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.loadFen("mi2", game, "rnbqkbnr/ppppp3/8/7p/5pPP/8/PPPPP3/RNBQKBNR b KQkq - 0 1");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.setEnPassant("mi5", game, "g4");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });

  it("should delete circles on set tag if tag is a fen", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game = Game.startLocalExaminedGame("mi1", "whiteguy", "glackguy", 0);
    Game.saveLocalMove("mi2", game, "e4");
    Game.drawCircle("mi4", game, "e4", "red", 3);

    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.circles);
    chai.assert.sameDeepMembers([{square: "e4", color: "red", size: 3}], game1.circles);

    Game.setTag("mi3", game, "FEN", "rnbqkb1r/pppp1ppp/5n2/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq f3 0 3");
    const game2 = Game.GameCollection.findOne();
    chai.assert.isDefined(game2.circles);
    chai.assert.equal(game2.circles.length, 0);
  });
});
