import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { Roles } from "meteor/alanning:roles";
import { Users } from "../imports/collections/users";

describe.skip("kibitzes", function(){
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow kibitzes if user is in the 'allow kibitzes' role", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.kibitz("mi2", game_id, "text");
    chai.assert.equal(Game.chatcollection.find().count(), 1);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{issuer: self._id, type: "kibitz"}], game.actions);
  });

  it("should not allow kibitzes if user is not in the 'allow kibitzes' role", function(){
    self.loggedonuser = TestHelpers.createUser();
    Roles.removeUsersFromRoles(self._id, "kibitz");
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.kibitz("mi2", game_id, "text");
    chai.assert.equal(Game.chatcollection.find().count(), 0);
    const game = Game.collection.findOne();
    chai.assert.equal(!game.actions || !game.actions.length);
  });

  it("should write kibitzes from a child exempt user into the collection as a child chat", function(){
    self.loggedonuser = TestHelpers.createUser({roles: ["child_chat"]});
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.kibitz("mi2", game_id, "text");
    chai.assert.equal(Game.chatcollection.find().count(), 1);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{issuer: self._id, type: "kibitz", child_chat: true}], game.actions);
  });

  it("should delete the kibitzes from the collection when the game is deleted", function(){
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.kibitz("mi2", game_id, "text");
    chai.assert.equal(Game.chatcollection.find().count(), 1);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{issuer: self._id, type: "kibitz"}], game.actions);
    Game.localRemoveObserver("mi3", game_id, self.loggedonuser._id);
    chai.assert.equal(Game.chatcollection.find().count(), 0);
    chai.assert.isUndefined(Game.collection.findOne());
  });

  it("should write an action (what was said, who said it) when a kibitz is written", function(){
    // Already handled in other tests
  });

  it("should send a client message when a kibitz is sent for an invalid game id", function(){
    self.loggedonuser = TestHelpers.createUser();
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.kibitz("mi2", "mickeymouse", "text");
    chai.assert.equal(Game.chatcollection.find().count(), 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][0]._id, self.loggedonuser._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi2");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "?");
  });

  it("should not publish kibitzes when sender is restricted and receiver is not in a matching group", function(){
    const sender = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const admin = TestHelpers.createUser({roles: ["change_limit_to_group", "add_to_group"]})
    self.loggedonuser = admin;
    Users.addToGroup("mi2", sender._id, "restricted_group");
    Users.setLimitToGroup("mi3", sender, true);
    Users.addToGroup("mi4", receiver._id, "unrestricted_group");

    self.loggedonuser = receiver;
    const game_id = Game.startLocalExaminedGame("mi5", "white", "black", 0);

    self.loggedonuser = sender;
    Game.localAddObserver("mi6", game_id, sender._id);
    Game.kibitz("mi2", game_id, "text");
    chai.assert.equal(Game.chatcollection.find().count(), 1);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{issuer: self._id, type: "kibitz", restricted: true, groups: ["restricted_group"]}], game.actions);
  });

  it("should not publish non-child kibitzes to a child", function(){chai.assert.fail("do me")});
});
