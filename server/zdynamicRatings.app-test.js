import chai from "chai";
import { DynamicRatings } from "./DynamicRatings";
import { Game } from "./Game";
import { GameRequests } from "./GameRequest";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Match } from "meteor/check";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

describe.only("Ratings", function() {
  const self = TestHelpers.setupDescribe.call(this);

  //  wild_number,
  it("should require wild_number to be an array, but currently can only contain zero", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          0,
          "standard",
          true,
          true,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          true,
          true,
          true
        ),
      Match.Error
    );
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0, 1],
          "standard",
          true,
          true,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          true,
          true,
          true
        ),
      Match.Error
    );
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [1],
          "standard",
          true,
          true,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          true,
          true,
          true
        ),
      Match.Error
    );
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard",
        true,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
  });
  it("should allow wild_number to not be specified", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        null,
        "standard",
        true,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
  });
  // it("should fail an add seek request if wild is not allowed", function() {
  //   // We cannot even test this until we are allowing more than one wild type
  //   chai.assert.fail("do me");
  // });
  // it("should fail an add match request if wild is not allowed", function() {
  //   chai.assert.fail("do me");
  // });
  // it("should fail a start local game if wild is not allowed", function() {
  //   // We cannot even test this until we are allowing more than one wild type
  //   chai.assert.fail("do me");
  // });
  //   rating_type,
  it("should always require rating_type, as this is it's name", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          null,
          true,
          true,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          [1, 15],
          [0, 0],
          ["none"],
          null,
          true,
          true,
          true
        ),
      Match.Error
    );
  });
  it("should fail an add seek request if rating_type is invalid", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard",
        true,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi1", 0, "unknown", 15, 0, "none", true),
      ICCMeteorError
    );
  });

  it("should fail an add match request if rating_type is invalid", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard",
        true,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "unknown",
          true,
          false,
          15,
          0,
          "none",
          15,
          0,
          "none"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if rating_type is invalid", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard",
        true,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi1", other, 0, "unknown", true, 15, 0, "none", 15, 0, "none"),
      Match.Error
    );
  });
  //   rated,
  it("should fail an add seek request if rated is false and seek rated is true", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard1",
        false,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi1", 0, "standard1", 15, 0, "none", true),
      ICCMeteorError
    );
  });
  it("should fail an add match request if rated is false and match rated is true", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard2",
        false,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard2",
          true,
          false,
          15,
          0,
          "none",
          15,
          0,
          "none"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if rated is false and game rated is true", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        false,
        true,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi1", other, 0, "standard3", true, 15, 0, "none", 15, 0, "none"),
      ICCMeteorError
    );
  });
  //   unrated
  it("should fail an add seek request if unrated is false and seek rated is false", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard1",
        true,
        false,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi1", 0, "standard1", 15, 0, "none", false),
      ICCMeteorError
    );
  });
  it("should fail an add match request if unrated is false and match rated is false", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard2",
        true,
        false,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard2",
          false,
          false,
          15,
          0,
          "none",
          15,
          0,
          "none"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if unrated is false and game rated is false", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating"]
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        true,
        false,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        [1, 15],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    self.loggedonuser = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi1", other, 0, "standard3", false, 15, 0, "none", 15, 0, "none"),
      ICCMeteorError
    );
  });
  //   white_initial,
  it("should allow white_initial be null (and require white_etime)", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if white_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if white_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if white_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   white_increment_or_delay,
  it("should allow white_increment_or_delay be null (and require white_etime)", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if white_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if white_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if white_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   white_increment_or_delay_type,
  it("should require this to be 'none', 'inc', 'us', or 'bronstein'", function() {
    chai.assert.fail("do me");
  });
  it("should allow increment_type = undefined if inc is undefined or inc is [0,0], and should set the record to 'none'", function() {
    chai.assert.fail("do me");
  });
  it("should allow increment_type = 'none' if inc is [0, 0]", function() {
    chai.assert.fail("do me");
  });
  it("should require 'none' in the list of increment_type if low inc is 0 and increment_type is specified", function() {
    chai.assert.fail("do me");
  });
  it("should require at least one 'not none' inc/delay type in the list of increment_type if high inc is not 0 and increment_type is specified", function() {
    chai.assert.fail("do me");
  });
  it("should disallow 'none' in the list of increment_type if low inc is not 0 and increment_type is specified", function() {
    chai.assert.fail("do me");
  });
  //   black_initial,
  it("should allow black_initial be null (and require black_etime)", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if black_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if black_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if black_initial fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   black_increment_or_delay,
  it("should allow black_increment_or_delay be null (and require black_etime)", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if black_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if black_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if black_increment_or_delay fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   black_increment_or_delay_type,
  it("should require this to be 'none', 'inc', 'us', or 'bronstein'", function() {
    chai.assert.fail("do me");
  });
  //   white_etime,
  it("should allow white_etime be null (and require white_initial and white_increment_or_delay)", function() {
    chai.assert.fail("do me");
  });
  it("should allow white_etime be specified (and allow white_initial and white_increment_or_delay to be null)", function() {
    chai.assert.fail("do me");
  });
  it("should fail if both are specified but do not match exactly! (i.e., white_initial cannot be 1-15 and etime be 15. etime would also have to be 1-15)", function() {
    chai.assert.fail("do me");
  });
  it("should succeed if both are specified but do match exactly", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if white_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if white_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if white_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   black_etime,
  it("should allow black_etime be null (and require white_initial and black_increment_or_delay)", function() {
    chai.assert.fail("do me");
  });
  it("should allow black_etime be specified (and allow white_initial and black_increment_or_delay to be null)", function() {
    chai.assert.fail("do me");
  });
  it("should fail if both are specified but do not match exactly! (i.e., black_initial cannot be 1-15 and etime be 15. etime would also have to be 1-15)", function() {
    chai.assert.fail("do me");
  });
  it("should succeed if both are specified but do match exactly", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if black_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if black_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if black_etime fails to fall within range", function() {
    chai.assert.fail("do me");
  });
  //   specify_color
  it("should require 'true' or 'false' for specify_color", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add seek request if color is specified but not allowed", function() {
    chai.assert.fail("do me");
  });
  it("should fail an add match request if color is specified but not allowed", function() {
    chai.assert.fail("do me");
  });
  it("should fail a start local game if color is specified but not allowed", function() {
    chai.assert.fail("do me");
  });
  //   can_seek
  it("should fail an add seek request if specify_seek is false", function() {
    chai.assert.fail("do me");
  });
  //   can_match    it("should fail if rating_type (it's name) isn't unique", function(){chai.assert.fail("do me")});
  it("should fail an add match request if can_match is false", function() {
    chai.assert.fail("do me");
  });
  it("should calculate etime correctly for 'none'", function() {
    chai.assert.fail("do me");
  });
  it("should calculate etime correctly for 'inc'", function() {
    chai.assert.fail("do me");
  });
  it("should calculate etime correctly for 'us'", function() {
    chai.assert.fail("do me");
  });
  it("should calculate etime correctly for ''bronstein''", function() {
    chai.assert.fail("do me");
  });
  it("should add a new rating with default rating to every registered user when a new rating type is added", function() {
    chai.assert.fail("do me");
  });
  it("should delete the rating from every registered user when a rating type is deleted", function() {
    chai.assert.fail("do me");
  });
  it("should add all defined rating types to a user record when it is registered", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the user trying to add a rating does not have '`add_dynamic_rating`' role", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the user trying to delete a rating does not have 'delete_dynamic_rating' role", function() {
    chai.assert.fail("do me");
  });
});
