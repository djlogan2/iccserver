import chai from "chai";
import { DynamicRatings } from "./DynamicRatings";
import { Game } from "./Game";
import { GameRequests } from "./GameRequest";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Random } from "meteor/random";
import { findRatingObject, validateAndFillRatingObject } from "../lib/ratinghelpers";

describe("Ratings", function () {
  const self = TestHelpers.setupDescribe.call(this, { dynamicratings: false });

  //  wild_number,
  it("should require wild_number to be an array, but currently can only contain zero", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          0,
          "standard1",
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
          "standard1",
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
          "standard1",
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
        "standard1",
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

  it("should allow wild_number to not be specified", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        null,
        "standard1",
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
  it.skip("should fail an add seek request if wild is not allowed", function () {
    // We cannot even test this until we are allowing more than one wild type
    chai.assert.fail("do me");
  });
  it.skip("should fail an add match request if wild is not allowed", function () {
    chai.assert.fail("do me");
  });
  it.skip("should fail a start local game if wild is not allowed", function () {
    // We cannot even test this until we are allowing more than one wild type
    chai.assert.fail("do me");
  });
  it.skip("should fail wild types ovelap with time controls", function () {
    // We cannot even test this until we are allowing more than one wild type
    chai.assert.fail("do me");
  });
  it.skip("should succeed time controls overlap (wini, bini, winc, binc, winctype, binctype, wetime, betime) but wild types do not", function () {
    // We cannot even test this until we are allowing more than one wild type
    chai.assert.fail("do me");
  });
  //   rating_type,
  it("should always require rating_type, as this is it's name", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          null,
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
  it("should fail an add seek request if rating_type is invalid", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard1",
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

  it("should fail an add match request if rating_type is invalid", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard1",
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
  it("should fail a start local game if rating_type is invalid", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard1",
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
  //   white_initial,
  it("should allow white_initial be null (and require white_etime)", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [1, 900],
        null,
        null,
        null,
        [1, 900],
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      Game.startLocalGame("mi1", other, 0, "standard3", false, 15, 0, "none", 15, 0, "none")
    );
  });

  it("should fail an add seek request if white_initial fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [25, 25],
        [0, 0],
        ["none"],
        null,
        [25, 25],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 20, 0, "none", true),
      ICCMeteorError
    );
  });

  it("should fail an add match request if white_initial fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [25, 25],
        [0, 0],
        ["none"],
        null,
        [25, 25],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard3",
          true,
          false,
          20,
          0,
          "none",
          20,
          0,
          "none"
        ),
      ICCMeteorError
    );
  });

  it("should fail a start local game if white_initial fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [25, 25],
        [0, 0],
        ["none"],
        null,
        [25, 25],
        [0, 0],
        ["none"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi2", other, 0, "standard3", true, 20, 0, "none", 20, 0, "none"),
      ICCMeteorError
    );
  });
  it("should fail an add seek request if white_increment_or_delay fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 20, 15, "inc", true),
      ICCMeteorError
    );
  });
  it("should fail an add match request if white_increment_or_delay fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard4",
          true,
          false,
          20,
          15,
          "inc",
          20,
          30,
          "inc"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if white_increment_or_delay fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi2", other, 0, "standard3", true, 20, 15, "inc", 20, 30, "inc"),
      ICCMeteorError
    );
  });

  for (let x = 0; x < 32; x++) {
    let type = [];
    if (x & 1) type.push("none");
    if (x & 2) type.push("inc");
    if (x & 4) type.push("us");
    if (x & 8) type.push("bronstein");
    if (x & 16) type.push("boogus");
    const not = type.indexOf("boogus") !== -1 ? "" : " not";
    it("should" + not + " throw with a type array of " + type + " correctly", function () {
      self.loggedonuser = TestHelpers.createUser({
        roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
      });
      if (type.indexOf("boogus") !== -1) {
        chai.assert.throws(
          () =>
            DynamicRatings.addRatingType(
              "mi1",
              [0],
              "standard" + x,
              [1, 15],
              [0, 90],
              type,
              null,
              [1, 15],
              [0, 0],
              ["none"],
              null,
              true,
              true,
              true
            ),
          ICCMeteorError
        );
      } else {
        chai.assert.doesNotThrow(
          () =>
            DynamicRatings.addRatingType(
              "mi1",
              [0],
              "standard" + x,
              [1, 15],
              [0, 90],
              type,
              null,
              [1, 15],
              [0, 0],
              ["none"],
              null,
              true,
              true,
              true
            ),
          "Test with types of " + type + " failed"
        );
      }
    });
  }

  it("should require 'none' in the list of increment_type if low inc is 0", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [0, 60],
        ["inc", "none"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          "standard4",
          [5, 25],
          [0, 60],
          ["inc"],
          null,
          [5, 25],
          [30, 60],
          ["inc"],
          null,
          true,
          true,
          true
        ),
      ICCMeteorError
    );
  });

  it("should require at least one 'not none' inc/delay type in the list of increment_type if high inc is not 0", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [0, 60],
        ["inc", "none"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          "standard4",
          [5, 25],
          [0, 60],
          ["none"],
          null,
          [5, 25],
          [30, 60],
          ["inc"],
          null,
          true,
          true,
          true
        ),
      ICCMeteorError
    );
  });
  it("should disallow 'none' in the list of increment_type if low inc is not 0", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [5, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          "standard4",
          [5, 25],
          [5, 60],
          ["inc", "none"],
          null,
          [5, 25],
          [30, 60],
          ["inc"],
          null,
          true,
          true,
          true
        ),
      ICCMeteorError
    );
  });
  it("should fail an add seek request if white_increment_type fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 20, 45, "bronstein", true),
      ICCMeteorError
    );
  });
  it("should fail an add match request if white_increment_or_delay fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard3",
          true,
          false,
          20,
          45,
          "bronstein",
          20,
          45,
          "inc"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if white_increment_or_delay fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame("mi2", other, 0, "standard3", true, 25, 45, "bronstein", 25, 45, "inc"),
      ICCMeteorError
    );
  });
  //   white_etime,
  it("should allow white_etime be null (and require white_initial and white_increment_or_delay)", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        [5, 25],
        [30, 60],
        ["inc"],
        null,
        true,
        true,
        true
      )
    );
  });
  it("should allow white_etime be specified (and allow white_initial and white_increment_or_delay to be null)", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        ["inc"], // <- Allow this to be specified and have etime fill in inc and initial!
        [15, 60],
        null,
        null,
        ["inc"],
        [15, 60],
        true,
        true,
        true
      )
    );
  });
  it("should fail if both are specified but do not match exactly! (i.e., white_initial cannot be 1-15 and etime be 15. etime would also have to be 1-15)", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          "standard3",
          [5, 25],
          [1, 2],
          ["inc"],
          [2, 200],
          [5, 25],
          [1, 2],
          ["inc"],
          [3, 300],
          true,
          true,
          true
        ),
      ICCMeteorError
    );
  });
  it("should succeed if both are specified but do match exactly", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        [5, 25],
        [30, 60], // 5 + 30 * 2 / 3 = 5 + 20 = 25, 25 + 60 * 2 / 3 = 25 + 40 = 65
        ["inc"],
        [25, 65],
        [5, 25],
        [30, 60],
        ["inc"],
        [25, 65],
        true,
        true,
        true
      )
    );
  });
  it("should fail an add seek request if white_etime fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        true,
        true,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 20, 45, "bronstein", true),
      ICCMeteorError
    );
  });
  it("should fail an add match request if white_etime fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard3",
          true,
          false,
          20,
          45,
          "inc",
          20,
          45,
          "inc"
        ),
      ICCMeteorError
    );
  });
  it("should fail a start local game if white_etime fails to fall within range", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        true,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () => Game.startLocalGame("mi2", other, 0, "standard3", true, 25, 45, "inc", 25, 45, "inc"),
      ICCMeteorError
    );
  });
  //   specify_color
  it("should fail an add seek request if color is specified but not allowed", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        false,
        true,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 5, 0, "none", true, "white"),
      ICCMeteorError
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi2", 0, "standard3", 5, 0, "none", true)
    );
  });

  it("should fail an add match request if color is specified but not allowed", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        false,
        true,
        true
      )
    );
    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard3",
          true,
          false,
          5,
          0,
          "none",
          5,
          0,
          "none",
          "white"
        ),
      ICCMeteorError
    );
    chai.assert.doesNotThrow(() => () =>
      GameRequests.addLocalMatchRequest(
        "mi2",
        other,
        0,
        "standard3",
        true,
        false,
        5,
        0,
        "none",
        5,
        0,
        "none",
        "white"
      )
    );
  });

  it("should fail a start local game if color is specified but not allowed", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        false,
        true,
        true
      )
    );

    const other = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        Game.startLocalGame(
          "mi2",
          other,
          0,
          "standard3",
          true,
          5,
          0,
          "none",
          5,
          0,
          "none",
          "white"
        ),
      ICCMeteorError
    );
    chai.assert.doesNotThrow(() =>
      Game.startLocalGame("mi2", other, 0, "standard3", true, 5, 0, "none", 5, 0, "none")
    );
  });
  //   can_seek
  it("should fail an add seek request if specify_seek is false", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        false,
        false,
        true
      )
    );
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi2", 0, "standard3", 5, 0, "none", true),
      ICCMeteorError
    );
  });
  //   can_match    it("should fail if rating_type (it's name) isn't unique", function(){chai.assert.fail("do me")});
  it("should fail an add match request if can_match is false", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    chai.assert.doesNotThrow(() =>
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "standard3",
        null,
        null,
        null,
        [5, 15],
        null,
        null,
        null,
        [5, 15],
        false,
        true,
        false
      )
    );
    const other = TestHelpers.createUser();

    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi2",
          other,
          0,
          "standard3",
          true,
          false,
          5,
          0,
          "none",
          5,
          0,
          "none",
          "white"
        ),
      ICCMeteorError
    );
  });

  it("should add a new rating with default rating to every registered user when a new rating type is added", function () {
    this.timeout(10000);
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    for (let x = 0; x < 10; x++) TestHelpers.createUser();
    DynamicRatings.addRatingType(
      "mi1",
      [0],
      "woohooyes",
      null,
      null,
      null,
      [5, 15],
      null,
      null,
      null,
      [5, 15],
      false,
      true,
      false,
      1200
    );
    const users = Meteor.users.find().fetch();
    chai.assert.equal(users.length, 11);
    users.forEach((uuu) => {
      chai.assert.isDefined(uuu.ratings);
      chai.assert.isDefined(uuu.ratings.woohooyes);
      chai.assert.deepEqual(uuu.ratings.woohooyes, {
        rating: 1200,
        need: 0,
        won: 0,
        draw: 0,
        lost: 0,
        best: 0,
      });
    });
  });
  it("should delete the rating from every registered user when a rating type is deleted", function () {
    this.timeout(10000);
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    for (let x = 0; x < 10; x++) TestHelpers.createUser();
    DynamicRatings.addRatingType(
      "mi1",
      [0],
      "woohooyes",
      null,
      null,
      null,
      [5, 15],
      null,
      null,
      null,
      [5, 15],
      false,
      true,
      false,
      1200
    );
    const users = Meteor.users.find().fetch();
    chai.assert.equal(users.length, 11);
    users.forEach((user) => {
      chai.assert.isDefined(user.ratings);
      chai.assert.isDefined(user.ratings.woohooyes);
      chai.assert.deepEqual(user.ratings.woohooyes, {
        rating: 1200,
        need: 0,
        won: 0,
        draw: 0,
        lost: 0,
        best: 0,
      });
    });
    DynamicRatings.deleteRatingType("mi3", "woohooyes");
    const users2 = Meteor.users.find().fetch();
    chai.assert.equal(users2.length, 11);
    users2.forEach((user) => {
      chai.assert.isDefined(user.ratings);
      chai.assert.isUndefined(user.ratings.woohooyes);
    });
  });

  it("should add all defined rating types to a user record when it is registered", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    for (let x = 0; x < 10; x++)
      DynamicRatings.addRatingType(
        "mi1",
        [0],
        "rating-type-" + x,
        null,
        null,
        null,
        [10 * x + 1, 10 * x + 10],
        null,
        null,
        null,
        [10 * x + 1, 10 * x + 10],
        false,
        true,
        false,
        1200
      );

    const user___ = TestHelpers.createUser();
    const user = Meteor.users.findOne({ _id: user___._id }); // Just make sure. Probably overkill, but just make sure

    chai.assert.isDefined(user.ratings);
    for (let x = 0; x < 10; x++)
      chai.assert.isDefined(
        user.ratings["rating-type-" + x],
        "Rating type rating-type-" + x + " was expected but not found"
      );
  });

  it("should fail if the user trying to add a rating does not have '`add_dynamic_rating`' role", function () {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        DynamicRatings.addRatingType(
          "mi1",
          [0],
          "rating-type",
          null,
          null,
          null,
          [5, 15],
          null,
          null,
          null,
          [5, 15],
          false,
          true,
          false,
          1200
        ),
      ICCMeteorError
    );
  });
  it("should fail if the user trying to delete a rating does not have 'delete_dynamic_rating' role", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });

    DynamicRatings.addRatingType(
      "mi1",
      [0],
      "rating-type",
      null,
      null,
      null,
      [5, 15],
      null,
      null,
      null,
      [5, 15],
      false,
      true,
      false,
      1200
    );

    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => DynamicRatings.deleteRatingType("mi1", "rating-type"), ICCMeteorError);
  });

  it("should fail if there is any overlap. Testing overlap of parameter white_initial", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi1",
      [0],
      Random.id(),
      [1, 10],
      null,
      ["none"],
      null,
      null,
      null,
      ["none"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi2",
      [0],
      Random.id(),
      [10, 20],
      null,
      ["none"],
      null,
      null,
      null,
      ["none"],
      [20, 30],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi3",
      [0],
      Random.id(),
      [20, 30],
      null,
      ["none"],
      null,
      null,
      null,
      ["none"],
      [40, 50],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter white_increment_or_delay", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi4",
      [0],
      Random.id(),
      [1, 10],
      [1, 10],
      ["inc"],
      null,
      null,
      null,
      ["none"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi5",
      [0],
      Random.id(),
      [1, 10],
      [24, 30],
      ["inc"],
      null,
      null,
      null,
      ["none"],
      [20, 30],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi6",
      [0],
      Random.id(),
      [1, 10],
      [35, 40],
      ["inc"],
      null,
      null,
      null,
      ["none"],
      [30, 40],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter white_increment_or_delay_type", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi7",
      [0],
      Random.id(),
      null,
      null,
      ["none", "inc"],
      [1, 10],
      null,
      null,
      ["none"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi8",
      [0],
      Random.id(),
      null,
      null,
      ["inc", "bronstein"],
      [1, 10],
      null,
      null,
      ["none"],
      [20, 30],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi9",
      [0],
      Random.id(),
      null,
      null,
      ["bronstein"],
      [1, 10],
      null,
      null,
      ["none"],
      [30, 40],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter white_etime", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi10",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [1, 10],
      null,
      null,
      ["none"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi11",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [10, 20],
      null,
      null,
      ["none"],
      [20, 30],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi12",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [20, 30],
      null,
      null,
      ["none"],
      [30, 40],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter black_initial", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi13",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [1, 10],
      [1, 10],
      null,
      ["none"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi14",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [20, 30],
      [10, 20],
      null,
      ["none"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi15",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [30, 40],
      [20, 30],
      null,
      ["none"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter black_increment_or_delay", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi16",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [1, 10],
      [1, 10],
      [1, 10],
      ["inc"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi17",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [20, 30],
      [1, 10],
      [24, 30],
      ["inc"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi18",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [30, 40],
      [1, 10],
      [35, 40],
      ["inc"],
      null,
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should fail if there is any overlap. Testing overlap of parameter black_increment_or_delay_type", function () {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["add_dynamic_rating", "delete_dynamic_rating", "play_rated_games"],
    });
    DynamicRatings.addRatingType(
      "mi19",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [1, 10],
      null,
      null,
      ["none"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    DynamicRatings.addRatingType(
      "mi20",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [20, 30],
      null,
      null,
      ["none", "inc"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
    DynamicRatings.addRatingType(
      "mi21",
      [0],
      Random.id(),
      null,
      null,
      ["none"],
      [30, 40],
      null,
      null,
      ["inc", "bronstein"],
      [1, 10],
      true,
      true,
      true,
      1600
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "OVERLAPPING_RATING");
  });

  it("should give correct rating types for every initial and increment", function () {
    const bullet_object = validateAndFillRatingObject({ etime: [0, 2], increment_type: ["inc"] });
    const blitz_object = validateAndFillRatingObject({ etime: [3, 14], increment_type: ["inc"] });
    const standard_object = validateAndFillRatingObject({
      etime: [15, 600],
      increment_type: ["inc"],
    });

    bullet_object.white_etime = bullet_object.black_etime = bullet_object.etime;
    delete bullet_object.etime;
    blitz_object.white_etime = blitz_object.black_etime = blitz_object.etime;
    delete blitz_object.etime;
    standard_object.white_etime = standard_object.black_etime = standard_object.etime;
    delete standard_object.etime;

    bullet_object.white_increment_or_delay_type = bullet_object.black_increment_or_delay_type =
      bullet_object.increment_type;
    delete bullet_object.increment_type;
    blitz_object.white_increment_or_delay_type = blitz_object.black_increment_or_delay_type =
      blitz_object.increment_type;
    delete blitz_object.increment_type;
    standard_object.white_increment_or_delay_type = standard_object.black_increment_or_delay_type =
      standard_object.increment_type;
    delete standard_object.increment_type;

    bullet_object.white_initial = bullet_object.black_initial = bullet_object.initial;
    delete bullet_object.initial;
    blitz_object.white_initial = blitz_object.black_initial = blitz_object.initial;
    delete blitz_object.initial;
    standard_object.white_initial = standard_object.black_initial = standard_object.initial;
    delete standard_object.initial;

    bullet_object.white_increment = bullet_object.black_increment = bullet_object.increment;
    delete bullet_object.increment;
    blitz_object.white_increment = blitz_object.black_increment = blitz_object.increment;
    delete blitz_object.increment;
    standard_object.white_increment = standard_object.black_increment = standard_object.increment;
    delete standard_object.increment;

    bullet_object.wild_number = [0];
    blitz_object.wild_number = [0];
    standard_object.wild_number = [0];
    bullet_object.rating_type = "bullet";
    blitz_object.rating_type = "blitz";
    standard_object.rating_type = "standard";

    for (let initial = 0; initial < 200; initial++) {
      for (let increment = 0; increment < 600; increment++) {
        if (!initial && !increment) continue;
        const rating_object = findRatingObject(0, "white", initial, increment, "inc", [
          bullet_object,
          blitz_object,
          standard_object,
        ]);
        chai.assert.isDefined(
          rating_object,
          "Unable to find rating object for initial=" + initial + ", increment=" + increment
        );
        const etime = Math.round(initial + (2.0 * increment) / 3.0);
        if (etime < 3) chai.assert.equal("bullet", rating_object.rating_type);
        else if (etime < 15) chai.assert.equal("blitz", rating_object.rating_type);
        else chai.assert.equal("standard", rating_object.rating_type);
      }
    }
  });
});
