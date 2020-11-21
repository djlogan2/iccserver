import chai from "chai";
import { Game } from "./Game";
import { Tourney } from "./Tournament";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Roles } from "meteor/alanning:roles";

describe.only("Tournament Class", function() {
  const self = TestHelpers.setupDescribe.apply(this);
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
    const testscope = ["admin", "a1", "a2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(
      test.isAuthorized(testuser, "kibitz"),
      "unauthorized a user without roles, unlike specified"
    );
  });
  it("should authorized a user with no scope in any scope tournament", function() {
    const testscope = ["a1", "a2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    const testuser2 = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser2, "kibitz", { scope: "admin.b1.a2" });
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(
      test.isAuthorized(testuser, "kibitz"),
      "failed to authorize a user with admin roles"
    );
    chai.assert(
      test.isAuthorized(testuser2, "kibitz"),
      "failed to authorize a user without roles, unlike specified"
    );
  });
  it("should authorized a user with a scope needed below itself in scopes", function() {
    const testscope = ["admin", "a1", "a2"];
    let test = new Tourney("testTournament", testscope, []);
    chai.assert.typeOf(test.isAuthorized, "function", "tourney object doesn't have save function");
    const testuser = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser, "kibitz", { scope: "admin.a1" });
    const testuser2 = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser2, "kibitz", { scope: "admin.b1.a2" });
    chai.assert(!!testuser, "failed to create user in testing");
    chai.assert(test.isAuthorized(testuser, "kibitz"), "failed to authorize a2 for a1 user");
    chai.assert(
      test.isAuthorized(testuser2, "kibitz"),
      "failed to authorize a user with wrong roles, unlike specified"
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
  it("should modify the scope of a tourney authorized in from scope and to scope", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    const testuser = TestHelpers.createUser();
    Roles.addUsersToRoles(testuser, "kibitz", { scope: "admin" });
    self.loggedonuser = testuser;
    test.save();
    test.modifyScope("server", ["admin", "a1"]);
    const record = Game.TournamentCollection.findOne({
      name: test.name,
      scope: ["admin", "a1"]
    });
    const prevrecord = Game.TournamentCollection.findOne({
      name: test.name,
      scope: test.scope
    });
    chai.assert(!prevrecord, "previous record after modify still present");
    chai.assert(!!record, "failed to change scope with authorized user");
  });
  it("should not modify scope of unauthorized tourney", function() {
    //let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.fail("do me");
  });
  it("should no allow to modify scope of authorized scope to unauthroized scope", function() {
    //let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.fail("do me");
  });
});
