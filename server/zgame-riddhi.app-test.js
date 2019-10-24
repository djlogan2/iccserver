import chai from "chai";
import sinon from "sinon";

import { resetDatabase } from "meteor/xolvio:cleaner";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { Game } from "./Game";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { TestHelpers } from "../imports/server/TestHelpers";
import { standard_member_roles } from "../imports/server/userConstants";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

function localGameStartParameter(challenger, receiver) {
  return [
    challenger,
    "message_identifier",
    receiver,
    0,
    "Standard",
    false,
    15,
    0,
    15,
    0,
    true,
    "1"
  ];
}
describe("Game.startLocalGame", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });
  it.only("should error out if the user isn't logged on", function() {
    const guy1 = undefined;
    const guy2 = TestHelpers.createUser({ login: false });
    chai.assert.throws(() => {
      Game.startLocalGame.apply(null, localGameStartParameter(guy1, guy2));
    }, Match.Error);
  });

  it.only("should error out if the user is starting a rated game and cannot play rated games", function() {
    const guy2 = TestHelpers.createUser();
    chai.assert.throws(() => {
      Game.startLocalGame(
        "message_identifier",
        guy2,
        0,
        "Standard",
        true,
        15,
        0,
        15,
        0,
        false,
        "1"
      );
    }, Match.Error);
  });
  it.only("should error out if the user is starting an unrated game and cannot play unrated games", function() {
    const guy2 = TestHelpers.createUser();
    chai.assert.throws(() => {
      Game.startLocalGame(
        "message_identifier",
        guy2,
        0,
        "Standard",
        false,
        15,
        0,
        15,
        0,
        true,
        "1"
      );
    }, Match.Error);
  });
  it.only("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    const guy2 = TestHelpers.createUser({ roles: roles });

    const game_id = Game.startLocalGame(
      "message_identifier",
      guy2,
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      true,
      "1"
    );

    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_UNRATED_GAMES"
    );
  });
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  it.only("should error out if self is null", function() {
    self.loggedonuser = undefined;
    const guy2 = TestHelpers.createUser();
    chai.assert.throws(() => {
      Game.startLocalGame(
        "message_identifier",
        guy2,
        0,
        "Standard",
        false,
        15,
        0,
        15,
        0,
        true,
        "1"
      );
    }, Match.Error);
  });
  it.only("should error out user is neither white nor black", function() {
    self.loggedonuser = undefined;
    const guy2 = TestHelpers.createUser();
    chai.assert.throws(() => {
      Game.startLocalGame(
        "message_identifier",
        guy2,
        0,
        "Standard",
        false,
        15,
        0,
        15,
        0,
        true,
        "1"
      );
    }, Match.Error);
  });
  //   white,
  it("should error out if white is null", function() {
    chai.assert.fail("do me");
  });
  it.only("should error out if black is null", function() {
    self.loggedonuser = undefined;
    const guy2 = undefined;
    chai.assert.throws(() => {
      Game.startLocalGame(
        "message_identifier",
        guy2,
        0,
        "Standard",
        false,
        15,
        0,
        15,
        0,
        true,
        "1"
      );
    }, Match.Error);
  });
  it("should error out if wild is not zero", function() {
    chai.assert.fail("do me");
  });
  it("should error out if rating_type is not in the ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should error out if rated is not 'true' or 'false', and of course both of those work", function() {
    chai.assert.fail("do me");
  });
  //   white_initial,
  it("should error out if white_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   white_increment,
  it("should error out if white_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   black_initial,
  it("should use white_initial if black_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should use white_increment if black_increment is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("should error out if played_game is not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  });
  it("should add an examined game to the database if played_game is false", function() {
    chai.assert.fail("do me");
  });
  it("should add a playing game to the database if played_game is true", function() {
    chai.assert.fail("do me");
  });
});
