import chai from "chai";
import i18nCollection, {i18n} from "i18n";
import { Meteor } from "meteor/meteor";
import { resetDatabase } from "meteor/xolvio:cleaner";

describe.only("Server side i18n", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("returns en-us when locale isn't found", function() {
    chai.assert.doesNotThrow(() => {
      i18n.localizeMessage("invalid_locale", "i8nvalue");
    });
  });

  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
