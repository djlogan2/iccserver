import chai from "chai";
import { Game } from "./Game";
import { Tourney } from "./Tournament";

describe.only("Tournament Class", function() {
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
    chai.assert.typeOf(test.validate, "function", "tourney object doesn't have save function");
  });
});
