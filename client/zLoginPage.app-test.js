import { Meteor } from "meteor/meteor";
import chai from "chai";

describe("Login page", function() {
  it("needs to be tested", function() {
    chai.assert.isFalse(Meteor.isServer);
    chai.assert.isTrue(Meteor.isClient);
  });
});
