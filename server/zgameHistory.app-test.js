import chai from "chai";

import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { Roles } from "meteor/alanning:roles";
import sinon from "sinon";

import { GameRequests } from "./GameRequest";
import { Game } from "./Game";
import { TestHelpers } from "../imports/server/TestHelpers";
import { standard_member_roles } from "../imports/server/userConstants";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

describe("Game history", function() {
  it("needs to copy every ended played local game to the game history", function() {
    chai.assert.fail("do me");
  });
  it("needs to copy a history game to the game collection when examining a game history game", function() {
    chai.assert.fail("do me");
  });
  it("needs to remove all of the unnecessary game collection fields when copying to history", function() {
    chai.assert.fail("do me");
  });
  it("needs to add/creaatae all of the necessaray game collection fields when copying to game/examine", function() {
    chai.assert.fail("do me");
  });
});
