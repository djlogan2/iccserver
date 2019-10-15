import chai from "chai";

import "./GameRequest";
import {GameRequests} from "./GameRequest";

//GameRequests.addLegacyGameSeek = function(
describe("GameRequests.addLegacyGameSeek", function() {
  //  index,
  it("should fail if we try to add the same index twice", function(){chai.assert.fail("do me")});
  //   name,
  //   titles,
  //   rating,
  //   provisional_status,
  //   wild,
  //   rating_type,
  //   time,
  //   inc,
  //   rated,
  //   color,
  //   minrating,
  //   maxrating,
  //   autoaccept,
  //   formula,
  //   fancy_time_control
});

// GameRequests.addLocalGameSeek = function() {};
describe("GameRequests.addLocalGameSeek", function() {
  //  self,
  it("should fail if self is null or invalid", function(){chai.assert.fail("do me")});
  //   wild,
  it("should fail if wild is not zero", function(){chai.assert.fail("do me")});
  //   rating_type,
  it("should fail if rating_type is not a valid rating type for ICC", function(){chai.assert.fail("do me")});
  //   time,
  it("should fail if time is null or not a number or not within ICC configuration requirements", function(){chai.assert.fail("do me")});
  //   inc,
  it("should fail if inc is null or not a number or not within ICC configuration requirements", function(){chai.assert.fail("do me")});
  //   rated,
  it("should fail if rated is not 'true' or 'false'", function(){chai.assert.fail("do me")});
  it("should fail if rated and user cannot play rated games", function(){chai.assert.fail("do me")});
  it("should fail if unrated and user cannot play unrated games", function(){chai.assert.fail("do me")});
  //   color,
  it("should fail if is not null, 'black' or 'white'", function(){chai.assert.fail("do me")});
  //   minrating,
  it("should fail if minrating is not null, a number, less than 1, or not within ICC configuration requirements", function(){chai.assert.fail("do me")});
  //   maxrating,
  it("should fail if maxrating is not null, a number, less than 1, or not within ICC configuration requirements", function(){chai.assert.fail("do me")});
  //   autoaccept,
  it("should fail if autoaccept not 'true' or 'false'", function(){chai.assert.fail("do me")});
  //   formula,
  it("should fail if formula is specified (until we write the code)", function(){chai.assert.fail("do me")});
  it("should should add a record to the database if all is well and good", function(){chai.assert.fail("do me")});
});

// GameRequests.removeLegacySeek = function(self, index)
describe("GameRequests.removeLegacySeek", function() {
  it("should succeed if we try to remove a non-existant index", function() {chai.assert.fail("do me")});
  it("should remove a previously added record by legacy index", function() {chai.assert.fail("do me")});
  it("should fail if the seek record does not belong to the user", function() {chai.assert.fail("do me")});
});

// GameRequests.removeGameSeek = function(self, seek_id) {};
describe("GameRequests.removeGameSeek", function() {
  it("should fail if self is null or invalid", function(){chai.assert.fail("do me")});
  it("should fail if seek record cannot be found", function(){chai.assert.fail("do me")});
  it("should fail if seek record does not belong to the user", function(){chai.assert.fail("do me")});
  it("should delete the seek if all is well", function(){chai.assert.fail("do me")});
});

// GameRequests.acceptGameSeek = function(self, seek_id) {};
describe("GameRequests.acceptGameSeek", function() {
  it("should fail if self is null or invalid", function(){chai.assert.fail("do me")});
  it("should fail if seek record cannot be found", function(){chai.assert.fail("do me")});
  it("should fail if seek record does belong to the user", function(){chai.assert.fail("do me")});
  it("should delete the seek and insert a new game if all is well", function(){chai.assert.fail("do me")});
});

// GameRequests.addLegacyMatchRequest = function(
describe("GameRequests.addLegacyMatchRequest", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.addLocalMatchRequest = function(
describe("GameRequests.addLocalMatchRequest", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.acceptMatchRequest = function(game_id) {};
describe("GameRequests.acceptMatchRequest", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.declineMatchRequest = function(game_id) {};
describe("GameRequests.declineMatchRequest", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.removeLegacyMatchRequest = function(
describe("GameRequests.removeLegacyMatchRequest", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});

describe("game_requests publication", function(){

});