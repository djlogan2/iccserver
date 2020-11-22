import chai from "chai";
import { Game } from "./Game";
import { Tourney } from "./Tournament";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Users } from "../imports/collections/users";

describe.only("Tournament Class", function() {
  TestHelpers.setupDescribe.apply(this);
  it("should have a tournament class", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(test, "Object", "failed to create object for tournament class");
    chai.assert.equal(test.name, "testTournament", "failed to create tournament class properly");
    chai.assert.deepEqual(test.scope, ["admin"], "failed to create tournament class properly");
    chai.assert.deepEqual(test.nodes, [], "failed to create tournament class properly");
  });

  it("should have a save function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(test.save, "function", "tourney object doesn't have save function");
  });
  it("should save a tourney record with save function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    const testRecord = { name: test.name, scope: test.scope, nodes: [] };
    test.save();
    const record = Game.TournamentCollection.findOne({ name: test.name, scope: test.scope });
    chai.assert(!!record, "failed to find a record we inserted");
    delete record._id;
    chai.assert.deepEqual(record, testRecord, "failed to insert tourney record properly");
  });
  it("should have a delete function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(test.delete, "function", "tourney object doesn't have save function");
  });
  it("should delete a tourney record with delete function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    const testRecord = { name: test.name, scope: test.scope, nodes: [] };
    test.save();
    const record = Game.TournamentCollection.findOne({ name: test.name, scope: test.scope });
    chai.assert(!!record, "failed to find a record we inserted");
    delete record._id;
    chai.assert.deepEqual(record, testRecord, "failed to insert tourney record properly");
    test.delete("server");
    const recordTest2 = Game.TournamentCollection.findOne({ name: test.name, scope: test.scope });
    chai.assert(!recordTest2, "failed to remove tourney record after delete call");
  });
  it("should have a validate function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(test.validate, "function", "tourney object doesn't have validate function");
  });

  it("should have an isauthorized function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(
      test.isAuthorized,
      "function",
      "tourney object doesn't have isauthorized function"
    );
  });
  it("should have a modifyScope function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(
      test.modifyScope,
      "function",
      "tourney object doesn't have modifyScope function"
    );
  });
  it("should return true for an admin (global scope) with a top level scope", function() {
    const tourn = new Tourney("test", ["top"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template");
    chai.assert.isTrue(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return true for an admin (global scope) with a bottom level scope", function() {
    const tourn = new Tourney("test", ["top", "mid", "bottom"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template");
    chai.assert.isTrue(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return true for a top level user with a top level scope", function() {
    const tourn = new Tourney("test", ["top"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "top");
    chai.assert.isTrue(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return true for a top level user with a bottom level scope", function() {
    const tourn = new Tourney("test", ["top", "mid", "bottom"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "top");
    chai.assert.isTrue(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return false for a bottom level user with a top level scope", function() {
    const tourn = new Tourney("test", ["top"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "top.mid.bottom");
    chai.assert.isFalse(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return true for a bottom level user with a bottom level scope", function() {
    const tourn = new Tourney("test", ["top", "mid", "bottom"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "top.mid.bottom");
    chai.assert.isTrue(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return false for top level user with a different scope", function() {
    const tourn = new Tourney("test", ["top", "mid", "bottom"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "mid.bottom");
    chai.assert.isFalse(tourn.isAuthorized(user, "create_tournament_template"));
  });
  it("should return false for bottom level user with a different scope", function() {
    const tourn = new Tourney("test", ["top", "mid", "left"]);
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template", "top.mid.bottom");
    chai.assert.isFalse(tourn.isAuthorized(user, "create_tournament_template"));
  });
});
