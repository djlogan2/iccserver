import chai from "chai";
import { getBoardSquares, getLang, isReadySubscriptions, updateLocale } from "../utils";

describe("utils functions", () => {
  it("should check updateLocale function", () => {
    chai.assert.equal(updateLocale("us-en"), "us-EN");
  });

  it("should get board squares function", () => {
    chai.assert.equal(getBoardSquares().length, 64);
  });

  it("should check isReadySubscriptions function", () => {
    chai.assert.equal(isReadySubscriptions([{ ready: () => true }]), true);
    chai.assert.equal(isReadySubscriptions([{ ready: () => false }]), false);
  });

  it("should check getLang function", () => {
    chai.assert.equal(getLang(), "en-US");
  });
});
