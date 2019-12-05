import chai from "chai";
import { i18n } from "../../imports/collections/i18n";
import i18nCollection from "../../imports/collections/i18n";
import { Meteor } from "meteor/meteor";
import { resetDatabase } from "meteor/xolvio:cleaner";

describe("Server side i18n", function() {
  beforeEach(function(done) {
    resetDatabase(null, done);
  });

  it("returns en-us when locale isn't found", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message"
    });
    chai.assert.doesNotThrow(() => {
      i18n.localizeMessage("invalid_locale", "i8nvalue");
    });
  });

  it("passes if record is valid", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message"
    });
    chai.assert.doesNotThrow(() => {
      i18n.localizeMessage("en_us", "i8nvalue");
    });
  });
  it("fails if i18nvalue isn't specified", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message"
    });
    chai.assert.throws(() => {
      i18n.localizeMessage("en_us", "invalid_value");
    });
  });
  it("if region is valid, but language is not return closest language", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message"
    });
    chai.assert.equal(
      i18n.localizeMessage("none_us", "i8nvalue"),
      "a valid message"
    );
  });
  it("if language is valid but region is not, return closest region", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message"
    });
    chai.assert.equal(i18n.localizeMessage("en_xx", "i8nvalue"), "a valid message");
  });
  it("replaces optional fields of message", function() {
    i18nCollection.insert({
      messageid: "i8nvalue",
      locale: "en_us",
      text: "a valid message of {0}"
    });
    chai.assert.equal(i18n.localizeMessage("en_us", "i8nvalue", "a"), "a valid message of a");
  });
  it("write more language-specific text tests", function() {
    chai.assert.fail();
  });
});
