import chai from "chai";
import { templateCollection, Tourney } from "./Tournament";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Users } from "../imports/collections/users";

describe("Tournament Class", function() {
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
    const user = TestHelpers.createUser();
    self.loggedonuser = user;
    Users.addUserToRoles(user, "create_tournament_template");
    let test = new Tourney("testTournament", ["admin"], []);
    const testRecord = { name: test.name, scope: test.scope, nodes: [] };
    test.save("server");
    const record = templateCollection.findOne({ name: test.name, scope: test.scope });
    chai.assert(!!record, "failed to find a record we inserted");
    delete record._id;
    chai.assert.deepEqual(record, testRecord, "failed to insert tourney record properly");
  });
  it("should have a delete function", function() {
    let test = new Tourney("testTournament", ["admin"], []);
    chai.assert.typeOf(test.delete, "function", "tourney object doesn't have save function");
  });

  it("should delete a tourney record with delete function", function() {
    const user = TestHelpers.createUser();
    Users.addUserToRoles(user, "create_tournament_template");
    self.loggedonuser = user;
    const test = new Tourney("testTournament", ["admin"], []);
    const testRecord = { name: test.name, scope: test.scope, nodes: [] };
    test.save("server");
    const record = templateCollection.findOne({ name: test.name, scope: test.scope });
    chai.assert(!!record, "failed to find a record we inserted");
    delete record._id;
    chai.assert.deepEqual(record, testRecord, "failed to insert tourney record properly");
    test.delete("server");
    const recordTest2 = templateCollection.findOne({
      name: test.name,
      scope: test.scope
    });
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
});

describe("Tourney.isAuthorized", function() {
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

describe("Adding a tournament record", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should fail if there is a duplicate name in the same level", function() {
    const user = TestHelpers.createUser();
    self.loggedonuser = user;
    Users.addUserToRoles(user, "create_tournament_template", "top.mid.left");
    const tourn = new Tourney("test", ["top", "mid", "left"]);
    tourn.save("server");
    chai.assert.equal(1, templateCollection.find().count());

    const tourn2 = new Tourney("test", ["top", "mid", "left"]);
    tourn2.save("server");
    chai.assert.equal(1, templateCollection.find().count());
  });

  // TODO: MRD: I think this one might be better accomplished by creating a migration script
  //       to create a unique index, and then having some named "key field" that has the
  //       concatenation of the scopes plus the name. When we go multi-server, I do not see
  //       how else to guarantee integrity.
  //       I tested unique keys in Mongo and read about them. Since it appears there is no
  //       choice but to create this key field, I am now thinking we should probably remove
  //       "name" and "scope", and just save the dot-delimited scopes plus the name, and
  //       split them up and use them when we read the record.
  it("should succeed if there is a duplicate name in a different level", function() {
    const user = TestHelpers.createUser();
    self.loggedonuser = user;
    Users.addUserToRoles(user, "create_tournament_template", "top.mid");
    const tourn = new Tourney("test", ["top", "mid", "left"]);
    tourn.save("server");
    chai.assert.equal(1, templateCollection.find().count());
    const tourn2 = new Tourney("test", ["top", "mid", "right"]);
    tourn2.save("server");
    chai.assert.equal(2, templateCollection.find().count());
  });

  it("should fail if the user is not authorized", function() {
    const user = TestHelpers.createUser();
    self.loggedonuser = user;
    Users.addUserToRoles(user, "create_tournament_template", "top.mid.left");
    const tourn = new Tourney("test", ["top", "mid", "right"]);
    chai.assert.throws(() => {
      tourn.save("server");
    }, "Unable to save tournament");
    //chai.assert.equal(0, templateCollection.find().count());
  });

  //it("should succeed if the user is authorized", function(){alread handled with previous tests});
});
