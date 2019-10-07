import assert from "assert";
import { Meteor } from "meteor/meteor";

/*
if (Meteor.isAppTest) {
  if (Meteor.isServer) {
    require("../imports/collections/zuserCollection.app-test");
    require("../server/zgameRequest.app-test");
  }
  if (Meteor.isClient) {
    require("./integration/client/clientIntegration1");
  }
}

if (Meteor.isAppTest || Meteor.isTest) {
  if (Meteor.isServer) {
    require("../lib/server/zencrypt.test");
    require("../server/zgameRequest.test");
  }
}
*/

describe("icc", function() {
  it("package.json has correct name", async function() {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "icc");
  });

  if (Meteor.isClient) {
    it("client is not server", function() {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function() {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});
