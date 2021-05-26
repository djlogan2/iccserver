import chai from "chai";
//import { Game } from "./Game";
import { GameRequests } from "./GameRequest";
import { TestHelpers } from "../imports/server/TestHelpers";

describe("Starting multiple games", function() {
  const self = TestHelpers.setupDescribe.call(this);
  it("should not be allowed - startLocalGame should fail if self is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p3, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - startLocalGame should fail if other is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    self.loggedonuser = p3;
    Game.startLocalGame("mi1", p1, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - startLegacyGame should fail if self is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLegacyGame("mi1", 123, "white", p1.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, true, 1600, 1600, "x", [], [], "");
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - startLegacyGame should fail if other is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p2;
    Game.startLegacyGame("mi1", 123, "white", p2.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, true, 1600, 1600, "x", [], [], "");
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - startLegacyGame should fail if self is already playing", function() {
    const p1 = TestHelpers.createUser();
    self.loggedonuser = p1;
    Game.startLegacyGame("mi1", 123, "white", p1.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, true, 1600, 1600, "x", [], [], "");
    Game.startLegacyGame("mi1", 124, "white2", p1.profile.legacy.username, 0, "Standard", true, 15, 0, 15, 0, true, 1600, 1600, "x", [], [], "");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - acceptGameSeek should fail if self is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const seek_id = GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "inc", true);
    Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    self.loggedonuser = p3;
    GameRequests.acceptGameSeek("mi3", seek_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - acceptGameSeek should fail if requestor is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const seek_id = GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "inc", true);
    Game.startLocalGame("mi2", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    self.loggedonuser = p3;
    GameRequests.acceptGameSeek("mi3", seek_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - acceptMatchRequest should fail if self is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest("mi1", p1, 0, "standard", true, false, 15, 15, "inc", 15, 15, "inc");
    self.loggedonuser = p1;
    Game.startLocalGame("mi2", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    GameRequests.acceptMatchRequest("mi3", match_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should not be allowed - acceptMatchRequest should fail if requestor is already playing", function() {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const match_id = GameRequests.addLocalMatchRequest("mi1", p3, 0, "standard", true, false, 15, 15, "inc", 15, 15, "inc");
    Game.startLocalGame("mi2", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    self.loggedonuser = p3;
    GameRequests.acceptMatchRequest("mi3", match_id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });
});
