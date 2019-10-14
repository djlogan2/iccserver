import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";

describe("Server side i18n", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("still needs to be written", function() { chai.assert.fail("do me") });
});
