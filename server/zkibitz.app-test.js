import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";

describe.skip("kibitzes", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should save an action in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by both players during game play", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by all observers", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the user is not in the 'kibitz' role", function() {
    chai.assert.fail("do me");
  });
  it("should indicate if the kibitz is a child_chat kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the kibitz is not a child_chat kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the kibitz is a child_chat_exempt kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should not publish non-compliant kibitzes (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a user in the child_chat group to execute free-form kibitz", function() {
    chai.assert.fail("do me");
  });
  it("should only publish group kibitzes kibitzer is in a group and kibitzee is group restricted", function() {
    chai.assert.fail("do me");
  });
  it("should publish all kibitzes even if a kibitzee is in a group when user is not group restricted", function() {
    chai.assert.fail("do me");
  });
});

describe.skip("whispers", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should save an action in the game record", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by both players during game play", function() {
    chai.assert.fail("do me");
  });
  it("should be viewable by all observers", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the user is not in the 'whisper' role", function() {
    chai.assert.fail("do me");
  });
  it("should indicate if the whisper is a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the whisper is not a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
  it("should also indicate if the whisper is a child_chat_exempt whisper", function() {
    chai.assert.fail("do me");
  });
  it("should not publish non-compliant whispers (child_chat, child_chat_exempt) when user record indicates user is child_chat protected", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a user in the child_chat group to execute free-form whisper", function() {
    chai.assert.fail("do me");
  });
  it("should not allow any user to issue a child_chat whisper", function() {
    chai.assert.fail("do me");
  });
});
