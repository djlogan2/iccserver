import assert from "assert";
import { Meteor } from "meteor/meteor";

if (Meteor.isAppTest) {
  if (Meteor.isServer) {
    require("./integration/server/serverIntegration1");
  }
  if (Meteor.isClient) {
    require("./integration/client/clientIntegration1");
  }
}

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
