import chai from "chai";
import { Game } from "./Game";
import { Tourney } from "./Tournament";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Roles } from "meteor/alanning:roles";

describe("Tournament Class", function() {
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
    const testRecord = { name: test.name, scope: test.scope };
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
    const testRecord = { name: test.name, scope: test.scope };
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
  it("should not authorized a user without scope", function() {
    const testscope = ["admin.a1.a2", "admin.b1.b2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(
      !test.isAuthorized(testuser, "admin"),
      "authorized a user without roles, unlike specified"
    );
  });
  it("should authorized a user with admin scope in admin scope tournament", function() {
    const testscope = ["admin.a1.a2", "admin.b1.b2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser, "kibitz", { scope: "admin" });
    const testuser2 = TestHelpers.createUser();
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(
      test.isAuthorized(testuser, "admin"),
      "failed to authorize a user with admin roles"
    );
    chai.assert(
      !test.isAuthorized(testuser2, "admin"),
      "failed to deauthorize a user without roles, unlike specified"
    );
  });
  it("should authorized a user with a scope needed below itself in scopes", function() {
    const testscope = ["admin.a1.a2", "admin.b1.b2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser, "kibitz", { scope: "b1" });
    const testuser2 = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser2, "kibitz", { scope: "a2" });
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(test.isAuthorized(testuser, "b2"), "failed to authorize b2 for b1 user");
    chai.assert(
      !test.isAuthorized(testuser2, "b2"),
      "failed to deauthorize a user with wrong roles, unlike specified"
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
});
