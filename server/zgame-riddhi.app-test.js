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
  // Riddhi: So there are, oh, let's say four types of returns, and we need to use each one correctly:
  //
  // (1) ClientMessage.sendMessageToClient(...)
  //     Whenever something happens that is NORMAL, but an error, should be returned to the user.
  //     For example, matching a user that has been restricted from playing rated games isn't a coding error.
  //     Starting a game with a guy that's been logged off probably isn't a coding error (the guy could have lost his connection between the match and start, for example.)
  //
  // (2) I'm going to start on the other end now. For coding errors, Meteor.Error comes with the framework.
  //     DO NOT USE THIS. I'll get back to this later on.
  // (3) ICCMeteorError - This is an extension to Meteor.Error. It write log messages, sends stuff back to the client
  //     using their message identifiers, but then otherwise behaves like Meteor.Error does. Basically, it's Meteor.Error
  //     plus extra stuff we want. Use this if you're throwing any type of error where the programmer did something stupid.
  // (4) Match.Error - This occurs when one of the check() methods fails. You can throw this manually if you have a parameter
  //     error too. For example:
  //     check(color, String);  // Will throw a Match.Error if color isn't a setring.
  //     if(color !== "black" && color !== "white") throw new Match.Error(); // You can do it too if the values are incorrect.
  //     This is OK because it's a programming/parameter error.
  //
  //  Now lastly, back to Meteor.Error. IF...IF...you are so low level that you don't have access to i18n and/or ClientMessages,
  //  then you have no choice but to throw a Meteor.Error. However, 99% of the modules will be above those two modules, so
  //  in general you should never throw another Meteor.Error again. Use ICCMeteorError. Game.js is one of those modules.
  //  Don't use Meteor.Error. Use ICCMeteorError.
  //
  // TODO: I think this should return a client message, not an ICCMeteorError, and not a Match.Error
  it("should error out if the user isn't logged on", function() {
    const guy1 = undefined;
    const guy2 = TestHelpers.createUser({ login: false });
    chai.assert.throws(() => {
      Game.startLocalGame.apply(null, localGameStartParameter(guy1, guy2));
    }, Match.Error);
  });

  // TODO: I think this should return a client message, not an ICCMeteorError, and not a Match.Error
  it("should error out if the user is starting a rated game and cannot play rated games", function() {
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

  // TODO: I think this should return a client message, not an ICCMeteorError, and not a Match.Error
  it("should error out if the user is starting an unrated game and cannot play unrated games", function() {
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

  // TODO: I think this should return a client message, not an ICCMeteorError, and not a Match.Error
  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
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

  // TODO: I think this should return a client message, not an ICCMeteorError, and not a Match.Error
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function() {
    chai.assert.fail("do me");
  });

  it("should error out if self is null", function() {
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

  it("should error out user is neither white nor black", function() {
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

  it("should error out if black is null", function() {
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
