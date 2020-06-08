import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { Meteor } from "meteor/meteor";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

describe("Game owners", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  //
  // Owner
  //
  it("is assigned when he starts an examined game", function() {
    self.loggedonuser = TestHelpers.createUser();
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
  });

  it("is not assigned when a played game ends", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    const game = Game.collection.findOne();
    chai.assert.isUndefined(game.owner);
    ["a4", "a5", "b4", "b5", "c4", "c5", "d4", "d5", "e4", "e5"].forEach(move => {
      Game.saveLocalMove(move, game_id, move);
      if (self.loggedonuser._id === us._id) self.loggedonuser = them;
      else self.loggedonuser = us;
    });
    Game.resignLocalGame("resign", game_id);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.owner);
  });

  it("is not assigned in a played game", function() {
    // Done already in: is not assigned when a played game ends
  });

  it("can change observers to examiners", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    self.loggedonuser = otherguy;
    Game.localAddObserver("mi2", game_id, otherguy._id);
    self.loggedonuser = us;
    Game.localAddExaminer("mi3", game_id, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: us._id, username: us.username }, { id: otherguy._id, username: otherguy.username }],
      game2.examiners
    );
  });

  it("can change examiners to observers", function() {
    const us = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    self.loggedonuser = otherguy;
    Game.localAddObserver("mi2", game_id, otherguy._id);
    self.loggedonuser = us;
    Game.localAddExaminer("mi3", game_id, otherguy._id);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: us._id, username: us.username }, { id: otherguy._id, username: otherguy.username }],
      game2.examiners
    );
    Game.localRemoveExaminer("mi4", game_id, otherguy._id);
    const game3 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: us._id, username: us.username }], game3.examiners);
  });

  it("will not delete a private game when owner logs off if observers are still present", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    Game.gameLogoutHook(owner._id);
    const game1 = Game.collection.findOne();
    chai.assert.isDefined(game1);
    chai.assert.isTrue(game1.private);
    chai.assert.equal(game1.owner, owner._id);
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username }],
      game1.observers
    );
  });

  it("will set the users status back to examining immediately upon login if he's got a lingering private game", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    Game.gameLogoutHook(owner._id);
    const game1 = Game.collection.findOne();
    chai.assert.isDefined(game1);
    chai.assert.isTrue(game1.private);
    chai.assert.equal(game1.owner, owner._id);
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username }],
      game1.observers
    );

    Game.gameLoginHook(owner);
    const userRecord = Meteor.users.findOne({ _id: owner._id });
    chai.assert.isDefined(userRecord);
    chai.assert.equal(userRecord.status.game, "examining");

    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: observer._id, username: observer.username }
      ],
      game2.observers
    );
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: observer._id, username: observer.username }
      ],
      game2.observers
    );
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.examiners);
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: observer._id, username: observer.username }
      ],
      game2.analysis
    );
  });

  it("will delete a public game when owner logs off if observers are still present", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.gameLogoutHook(owner._id);
    const game1 = Game.collection.findOne();
    chai.assert.isUndefined(game1);
  });

  it("will delete a private game when owner logs off if there are no other observers", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    Game.gameLogoutHook(owner._id);
    const game1 = Game.collection.findOne();
    chai.assert.isUndefined(game1);
  });

  it("will unset the owner if the owner issues a localRemoveObserver to remove himself from the game. It will also make it public", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: [
        "allow_change_owner",
        "allow_private_games",
        "allow_restrict_chat",
        "allow_restrict_analysis"
      ]
    }));
    const other = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = other;
    Game.localAddObserver("mi2", game_id, other._id);
    self.loggedonuser = owner;
    Game.localAddExaminer("mi3", game_id, other._id);
    Game.setPrivate("mi4", game_id, true);
    Game.allowRequests("mi5", game_id, false);
    Game.allowChat("mi6", game_id, false);
    const game = Game.collection.findOne();
    chai.assert.equal(game.owner, owner._id);
    chai.assert.isTrue(game.private);
    chai.assert.isTrue(game.deny_requests);
    chai.assert.isTrue(game.deny_chat);

    Game.localRemoveObserver("mi7", game_id, owner._id);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.owner);
    chai.assert.isFalse(game2.private);
    chai.assert.isUndefined(game2.deny_requests);
    chai.assert.isUndefined(game2.deny_chat);
    chai.assert.sameDeepMembers([{ id: other._id, username: other.username }], game2.examiners);
    chai.assert.sameDeepMembers([{ id: other._id, username: other.username }], game2.observers);
  });

  it("will make the game public if an owner unsets himself to nothing", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: [
        "allow_change_owner",
        "allow_private_games",
        "allow_restrict_chat",
        "allow_restrict_analysis"
      ]
    }));
    const other = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = other;
    Game.localAddObserver("mi2", game_id, other._id);
    self.loggedonuser = owner;
    Game.localAddExaminer("mi3", game_id, other._id);
    Game.setPrivate("mi4", game_id, true);
    Game.allowRequests("mi5", game_id, false);
    Game.allowChat("mi6", game_id, false);
    const game = Game.collection.findOne();
    chai.assert.equal(game.owner, owner._id);
    chai.assert.isTrue(game.private);
    chai.assert.isTrue(game.deny_requests);
    chai.assert.isTrue(game.deny_chat);

    Game.changeOwner("mi7", game_id /*, null */);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.owner);
    chai.assert.isFalse(game2.private);
    chai.assert.isUndefined(game2.deny_requests);
    chai.assert.isUndefined(game2.deny_chat);
    chai.assert.sameDeepMembers(
      [{ id: owner._id, username: owner.username }, { id: other._id, username: other.username }],
      game2.examiners
    );
    chai.assert.sameDeepMembers(
      [{ id: owner._id, username: owner.username }, { id: other._id, username: other.username }],
      game2.observers
    );
  });

  it("will leave all settings in place if owner changes to another owner", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: [
        "allow_change_owner",
        "allow_private_games",
        "allow_restrict_chat",
        "allow_restrict_analysis"
      ]
    }));
    const newowner = TestHelpers.createUser();
    const other = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = other;
    Game.localAddObserver("mi2", game_id, other._id);
    self.loggedonuser = newowner;
    Game.localAddObserver("mi2", game_id, newowner._id);
    self.loggedonuser = owner;
    Game.localAddExaminer("mi3", game_id, other._id);
    Game.setPrivate("mi4", game_id, true);
    Game.allowRequests("mi5", game_id, false);
    Game.allowChat("mi6", game_id, false);
    const game = Game.collection.findOne();
    chai.assert.equal(game.owner, owner._id);
    chai.assert.isTrue(game.private);
    chai.assert.isTrue(game.deny_requests);
    chai.assert.isTrue(game.deny_chat);

    Game.changeOwner("mi7", game_id, newowner._id);
    const game2 = Game.collection.findOne();
    chai.assert.equal(game2.owner, newowner._id);
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game2.deny_requests);
    chai.assert.isTrue(game2.deny_chat);
  });

  it("can unset the owner", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_change_owner"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.changeOwner("mi2", game_id /* null */);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.owner);
  });

  it("will fail if owner tries to change the owner to a non-existant user id", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_change_owner"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.changeOwner("mi2", game_id, "mickeymouse");
    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2.owner);
    chai.assert.equal(self.loggedonuser._id, game2.owner);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_CHANGE_OWNER");
  });

  it("can change the owner to another individual if in the 'allow_change_owner' role", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_change_owner"] }));
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = otherguy;
    Game.localAddObserver("mi3", game_id, otherguy._id);
    self.loggedonuser = owner;
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.changeOwner("mi2", game_id, otherguy._id);
    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2.owner);
    chai.assert.equal(otherguy._id, game2.owner);
  });

  it("can not change the owner to another individual if not in the 'allow_change_owner' role", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser());
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = otherguy;
    Game.localAddObserver("mi3", game_id, otherguy._id);
    self.loggedonuser = owner;
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.changeOwner("mi2", game_id, otherguy._id);
    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2.owner);
    chai.assert.equal(self.loggedonuser._id, game2.owner);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_CHANGE_OWNER");
  });

  //
  // non-owners
  //
  it("can not change observers to examiners when there is an owner, and user is not the owner, when the game is private", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id1, abuser._id);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id1, observer._id);
    self.loggedonuser = victim;
    Game.localAddExaminer("mi4", game_id1, abuser._id);
    Game.setPrivate("mi5", game_id1, true);
    self.loggedonuser = abuser;
    Game.localAddExaminer("mi6", game_id1, observer._id);
    const game = Game.collection.findOne();
    chai.assert.isFalse(game.examiners.some(e => e.id === observer._id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  it("can change observers to examiners when there is an owner, and user is not the owner, when the game is public", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id1, abuser._id);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id1, observer._id);
    self.loggedonuser = victim;
    Game.localAddExaminer("mi3", game_id1, abuser._id);
    self.loggedonuser = abuser;
    Game.localAddExaminer("mi5", game_id1, observer._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.examiners.some(e => e.id === observer._id));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  it("can not change examiners to observers when there is an owner, and user is not the owner, when the game is private", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id1, abuser._id);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id1, observer._id);
    self.loggedonuser = victim;
    Game.localAddExaminer("mi4", game_id1, abuser._id);
    Game.localAddExaminer("mi4", game_id1, observer._id);
    Game.setPrivate("mi5", game_id1, true);
    const game1 = Game.collection.findOne();
    chai.assert.isTrue(game1.examiners.some(e => e.id === observer._id));
    self.loggedonuser = abuser;
    Game.localRemoveExaminer("mi6", game_id1, observer._id);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.examiners.some(e => e.id === observer._id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  it("can change observers to examiners when there is an owner, and user is not the owner, when the game is public", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id1, abuser._id);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id1, observer._id);
    self.loggedonuser = victim;
    Game.localAddExaminer("mi3", game_id1, abuser._id);
    self.loggedonuser = abuser;
    Game.localAddExaminer("mi5", game_id1, observer._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.examiners.some(e => e.id === observer._id));
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
  });

  //
  // public/private games
  //
  it("can set a game private in examined games if in allow_private_games role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
  });

  it("can not set a played game private", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    self.loggedonuser = us;
    const game_id = Game.startLocalGame(
      "mi1",
      them,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    const game = Game.collection.findOne();
    chai.assert.isUndefined(game.owner);
    Game.setPrivate("mi2", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.private);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PRIVATIZE");
  });

  it("can not set a game private in examined games if not in allow_private_games role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.private);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PRIVATIZE");
  });

  it("will not set users status to observing in a private game when they are on the requestors list", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username, mid: "mi3" }],
      game.requestors
    );
    const observer_user = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user.status.game, "none");
  });

  it("will set users status to observing in a private game when they are moved from the requestors list to the observers list", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id, observer._id);
    const game1 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username, mid: "mi3" }],
      game1.requestors
    );
    const observer_user1 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user1.status.game, "none");
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id, observer._id);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: observer._id, username: observer.username },
        { id: owner._id, username: owner.username }
      ],
      game2.observers
    );
    const observer_user2 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user2.status.game, "observing");
  });

  it("will not allow a user to make a request if they are playing a game", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = observer;
    Game.startLocalGame("mi3", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    const observer_user1 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user1.status.game, "playing");
    Game.localAddObserver("mi3", game_id, observer._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(!game.requestors || !game.requestors.length);
    const observer_user2 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user2.status.game, "playing");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("will remove a user from the requestors list if they start playing a game", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id1, true);
    self.loggedonuser = observer;
    Game.localAddObserver("mi3", game_id1, observer._id);
    const game1 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username, mid: "mi3" }],
      game1.requestors
    );
    const observer_user1 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user1.status.game, "none");
    Game.startLocalGame("mi3", p2, 0, "standard", true, 15, 15, "inc", 15, 15, "inc");
    const game2 = Game.collection.findOne({_id: game_id1});
    chai.assert.isTrue(!game2.requestors || !game2.requestors.length);
    const observer_user2 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user2.status.game, "playing");
  });

  it("will not allow an owner of a private game to start a played game", function() {
    const p1 = TestHelpers.createUser({ roles: ["allow_private_games", "play_rated_games"] });
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi2", game_id, p2._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi3", game_id, true);
    Game.startLocalGame("mi4", p3, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "COMMAND_INVALID_WITH_OWNED_GAME");
  });

  it("will not allow an owner of a private game to start a played game", function() {
    const p1 = TestHelpers.createUser({ roles: ["allow_private_games", "play_rated_games"] });
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi2", game_id, p2._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi3", game_id, true);
    self.loggedonuser = p3;
    Game.startLocalGame("mi4", p1, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
  });

  it("will not allow an owner of a private game to start an examined game", function() {
    const p1 = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi2", game_id, p2._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi3", game_id, true);
    Game.startLocalExaminedGame("mi4", "ww", "bb", 0);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "COMMAND_INVALID_WITH_OWNED_GAME");
  });

  it("will not allow an owner of a private game to observe any other game", function() {
    const p1 = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const p2 = TestHelpers.createUser();
    self.loggedonuser = TestHelpers.createUser();
    const other_game_id = Game.startLocalExaminedGame("mi1", "ww", "bb", 0);
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi2", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi3", game_id, p2._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi4", game_id, true);
    Game.localAddObserver("mi5", other_game_id, p1._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "COMMAND_INVALID_WITH_OWNED_GAME");
  });

  it("will remove a user from all other examined games if their request is accepted", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id1, true);
    self.loggedonuser = observer;
    Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.localAddObserver("mi3", game_id1, observer._id);
    const game_collection = Game.collection.find().fetch();
    chai.assert.equal(game_collection.length, 2);
    const game1 = game_collection.find(g => g._id === game_id1);
    chai.assert.sameDeepMembers(
      [{ id: observer._id, username: observer.username, mid: "mi3" }],
      game1.requestors
    );
    const observer_user = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user.status.game, "examining");
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id1, observer._id);
    const game_collection2 = Game.collection.find().fetch();
    chai.assert.equal(game_collection2.length, 1);
    const game2 = game_collection2[0];
    chai.assert.sameDeepMembers(
      [
        { id: observer._id, username: observer.username },
        { id: owner._id, username: owner.username }
      ],
      game2.observers
    );
    const observer_user2 = Meteor.users.findOne({ _id: observer._id });
    chai.assert.equal(observer_user2.status.game, "observing");
  });

  it("will add a requestor to the requestors list if they try to observe a private game allowing observe requests", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi2", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_ENTRY_REQUESTED");
  });

  it("will return a message if a user tries to observe a private game that is not allowing observe requests", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    Game.allowRequests("mi3", game_id, false);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi4", game_id, requestor._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.isTrue(!game.requestors || !game.requestors.length);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_GAME");
  });

  it("will move a user from the requestors list to the observers list when owner accepts a request", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi3" }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_ENTRY_REQUESTED");
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id, requestor._id);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game2.observers
    );
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.examiners);
    chai.assert.isEmpty(game2.requestors);
  });

  it("will remove the user from the requestors list when owner denies a request", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi2", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_ENTRY_REQUESTED");
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi2" }],
      game.requestors
    );
    self.loggedonuser = owner;
    Game.localDenyObserver("mi4", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "PRIVATE_ENTRY_DENIED");
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.examiners);
    chai.assert.isEmpty(game2.requestors);
  });

  it("will not allow a non-owner to accept a users observe request", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi3" }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_ENTRY_REQUESTED");
    self.loggedonuser = abuser;
    chai.assert.throws(() => Game.localAddObserver("mi4", game_id, requestor._id));
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi3" }],
      game.requestors
    );
  });

  it("will not allow a non-owner to deny a users observe request", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi5", game_id, abuser._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi2", game_id, true);
    Game.localAddExaminer("mi3", game_id, abuser._id);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi4", game_id, requestor._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username },{ id: abuser._id, username: abuser.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username },{ id: abuser._id, username: abuser.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi4" }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_ENTRY_REQUESTED");
    self.loggedonuser = abuser;
    Game.localRemoveObserver("mi5", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_THE_OWNER");
    Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username },{ id: abuser._id, username: abuser.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username },{ id: abuser._id, username: abuser.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username, mid: "mi4" }],
      game.requestors
    );
  });

  it("can remove users from own private games", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id, requestor._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game.observers
    );
    Game.localRemoveObserver("mi5", game_id, requestor._id);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game2.observers);
    chai.assert.isTrue(self.clientMessagesSpy.calledThrice);
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "PRIVATE_ENTRY_REMOVED");
  });

  it("can not set a game private in examined games not the owner", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id, abuser._id);
    self.loggedonuser = owner;
    Game.localAddExaminer("mi3", game_id, abuser._id);
    self.loggedonuser = abuser;
    Game.setPrivate("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.private);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PRIVATIZE");
  });

  it("can not remove users from others private games", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi3", game_id, abuser._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id, requestor._id);
    Game.localAddObserver("mi4", game_id, abuser._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: abuser._id, username: abuser.username },
        { id: requestor._id, username: requestor.username }
      ],
      game.observers
    );
    self.loggedonuser = abuser;
    Game.localRemoveObserver("mi5", game_id, requestor._id);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: abuser._id, username: abuser.username },
        { id: requestor._id, username: requestor.username }
      ],
      game2.observers
    );
    chai.assert.equal(self.clientMessagesSpy.args[4][2], "NOT_THE_OWNER");
  });

  it("can change 'allow observe requests' flag in examined games if game is set to private", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    const game1 = Game.collection.findOne();
    chai.assert.isTrue(game1.private);
    chai.assert.isUndefined(game1.deny_requests);
    Game.allowRequests("mi2", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_requests);
    Game.allowRequests("mi2", game_id, true);
    const game3 = Game.collection.findOne();
    chai.assert.isFalse(game3.deny_requests);
  });

  it("can not change 'allow observe requests' flag in examined games if game public", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isUndefined(game.private);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.allowRequests("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isUndefined(game2.private);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "COMMAND_INVALID_ON_PUBLIC_GAME");
  });

  it("will delete 'allow observe requests' flag if changing game from private to public", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isTrue(game.private);
    chai.assert.isUndefined(game.deny_requests);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.allowRequests("mi3", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_requests);
    Game.setPrivate("mi4", game_id, false);
    const game3 = Game.collection.findOne();
    chai.assert.isFalse(game3.private);
    chai.assert.isUndefined(game3.deny_requests);
  });

  it("will set 'allow observe requests' flag to true by default if changing game from public to private", function() {
    // already done in will delete 'allow observe requests' flag if changing game from private to public
  });
  it("will not allow you to change allow observe requests if you are not the owner", function() {
    const p1 = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const p2 = TestHelpers.createUser({ roles: ["allow_private_games"] });
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi2", game_id, p2._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi3", game_id, true);
    self.loggedonuser = p2;
    Game.allowRequests("mi4", game_id, false);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  //
  // Allow chat
  //
  it("can change 'allow chat' flag in examined games if in allow_restrict_chat role", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_chat"]
    });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isUndefined(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    Game.allowChat("mi2", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game2.deny_chat);
  });

  it("can not change 'allow chat' flag in examined games if not in allow_restrict_chat role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isUndefined(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.allowChat("mi2", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isUndefined(game.deny_chat);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_RESTRICT_CHAT");
  });

  it.skip("will allow an owner to kibitz/whisper when user is owner and chat is restricted", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_chat"]
    });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    Game.allowChat("mi2", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
    Chat.kibitz("mi3", game_id, "kibitz");
    chai.assert.fail("do me -- write in the check to make sure the kibitz occurred");
  });

  it.skip("will allow not any other examiner/observer to kibitz/whisper when chat is restricted", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_chat"]
    });
    const peon = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    Game.allowChat("mi1", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
    self.loggedonuser = peon;
    Chat.kibitz("mi3", game_id, "kibitz");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_CHAT_NOT_ALLOWED");
    chai.assert.fail("do me -- write in the check to make sure NO kibitz occurred");
  });

  it("will not allow you to change deny chat if you are not the owner", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_chat"]
    }));
    const abuser = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = abuser;
    Game.localAddObserver("mi2", game_id, abuser._id);
    self.loggedonuser = owner;
    Game.localAddExaminer("mi3", game_id, abuser._id);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isUndefined(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi3", game_id, true);
    Game.allowChat("mi4", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game2.deny_chat);
    self.loggedonuser = abuser;
    Game.allowChat("mi5", game_id, true);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_RESTRICT_CHAT");
    const game3 = Game.collection.findOne();
    chai.assert.isTrue(game3.deny_chat);
  });

  //
  // Allow analysis
  //
  it("will put all observers in the analysis array when going from public to private", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    for (let x = 0; x < 5; x++) {
      const observer = (self.loggedonuser = TestHelpers.createUser());
      Game.localAddObserver("mi2-" + x, game_id, observer._id);
    }
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(game.observers, game.analysis);
  });

  it("can add and remove users from the analysis array in examined games if in allow_restrict_analysis role", function() {
    const owner = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const observer = (self.loggedonuser = TestHelpers.createUser());
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(game.observers, game.analysis);
    Game.allowAnalysis("mi4", game_id, observer._id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isFalse(game2.analysis.some(a => a.id === observer._id));
    Game.allowAnalysis("mi4", game_id, observer._id, true);
    const game3 = Game.collection.findOne();
    chai.assert.isTrue(game3.analysis.some(a => a.id === observer._id));
  });

  it("can not add nor remove users from the analysis array in examined games if not in allow_restrict_analysis role", function() {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const observer = (self.loggedonuser = TestHelpers.createUser());
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(game.observers, game.analysis);
    Game.allowAnalysis("mi4", game_id, observer._id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.analysis.some(a => a.id === observer._id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_RESTRICT_ANALYSIS");
  });

  it("will not allow owner to be removed from the analysis array", function() {
    const owner = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    const observer = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id, observer._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(game.observers, game.analysis);
    Game.allowAnalysis("mi4", game_id, owner._id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.analysis.some(a => a.id === owner._id));
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_RESTRICT_ANALYSIS");
  });

  it("will send computer analysis to a player when they are in the analysis array", function(done) {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_restrict_analysis", "allow_private_games"]
    }));
    const minion = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = minion;
    Game.localAddObserver("mi2", game_id, minion._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi3", game_id, true);
    const game3 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [{ id: owner._id, username: owner.username }, { id: minion._id, username: minion.username }],
      game3.analysis
    );
    self.loggedonuser = minion;
    const collector = new PublicationCollector({ userId: minion._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.game.length, 1);
      chai.assert.equal(collections.game[0].variations.movelist[1].score, 234);
      chai.assert.isUndefined(collections.game[0].analysis);
      done();
    });
  });

  it("will not send computer analysis to a player when they are not in the analysis array", function(done) {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_restrict_analysis", "allow_private_games"]
    }));
    const minion = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = minion;
    Game.localAddObserver("mi2", game_id, minion._id);
    self.loggedonuser = owner;
    Game.setPrivate("mi2", game_id, true);
    Game.allowAnalysis("mi1", game_id, minion._id, false);
    const game3 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game3.analysis);
    self.loggedonuser = minion;
    const collector = new PublicationCollector({ userId: minion._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.game.length, 1);
      chai.assert.isUndefined(collections.game[0].variations.movelist[1].score);
      chai.assert.isUndefined(collections.game[0].analysis);
      done();
    });
  });

  it("will fail if a non-owner tries to add or remove people from the analysis array", function() {
    const p1 = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    const p2 = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    const peon = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalExaminedGame("mi1", "w", "b", 0);
    self.loggedonuser = p2;
    Game.localAddObserver("mi2", game_id, p2._id);
    self.loggedonuser = peon;
    Game.localAddObserver("mi3", game_id, peon._id);
    self.loggedonuser = p1;
    Game.setPrivate("mi4", game_id, true);
    self.loggedonuser = p2;
    Game.allowAnalysis("mi5", game_id, peon._id, false);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_THE_OWNER");
  });

  it("will not send sensitive game record fields to client subscriptions (owner)", function(done) {
    const owner = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    const outsideguy = TestHelpers.createUser();
    const insideguy_analysis = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = outsideguy;
    Game.localAddObserver("mi4", game_id, outsideguy._id);
    self.loggedonuser = insideguy_analysis;
    Game.localAddObserver("mi5", game_id, insideguy_analysis._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi6", game_id, insideguy_analysis._id);
    Game.allowAnalysis("mi7", game_id, insideguy_analysis._id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(
      [{ id: outsideguy._id, username: outsideguy.username, mid: "mi4" }],
      game.requestors
    );
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: insideguy_analysis._id, username: insideguy_analysis.username }
      ],
      game.analysis
    );
    // Just set this manually. It creates an invalid state, since we have requestors and deny_requests = true,
    // but it's just for this test to test the subscription without having to create a second test.
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $set: { deny_requests: true } }
    );
    //   requestors - only owner can see
    //   deny_requests - only owner can see
    //   analysis - only owner can see
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.game.length, 1);
      chai.assert.sameDeepMembers(
        [{ id: outsideguy._id, username: outsideguy.username, mid: "mi4" }],
        collections.game[0].requestors
      );
      chai.assert.isTrue(collections.game[0].deny_requests);
      chai.assert.sameDeepMembers(
        [
          { id: owner._id, username: owner.username },
          { id: insideguy_analysis._id, username: insideguy_analysis.username }
        ],
        collections.game[0].analysis
      );
      done();
    });
  });

  it("will not send sensitive game record fields to client subscriptions (observer)", function(done) {
    const owner = TestHelpers.createUser({
      roles: ["allow_private_games", "allow_restrict_analysis"]
    });
    const outsideguy = TestHelpers.createUser();
    const insideguy_analysis = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = outsideguy;
    Game.localAddObserver("mi4", game_id, outsideguy._id);
    self.loggedonuser = insideguy_analysis;
    Game.localAddObserver("mi5", game_id, insideguy_analysis._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi6", game_id, insideguy_analysis._id);
    Game.allowAnalysis("mi7", game_id, insideguy_analysis._id, true);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.sameDeepMembers(
      [{ id: outsideguy._id, username: outsideguy.username, mid: "mi4" }],
      game.requestors
    );
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: insideguy_analysis._id, username: insideguy_analysis.username }
      ],
      game.analysis
    );
    // Just set this manually. It creates an invalid state, since we have requestors and deny_requests = true,
    // but it's just for this test to test the subscription without having to create a second test.
    Game.collection.update(
      { _id: game_id, status: "examining" },
      { $set: { deny_requests: true } }
    );
    //   requestors - only owner can see
    //   deny_requests - only owner can see
    //   analysis - only owner can see
    self.loggedonuser = insideguy_analysis;
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.game.length, 1);
      chai.assert.isUndefined(collections.game[0].requestors);
      chai.assert.isUndefined(collections.game[0].deny_requests);
      chai.assert.isUndefined(collections.game[0].analysis);
      done();
    });
  });

  it("does not support setting a legacy game private", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLegacyGame(
      "mi1",
      1,
      self.loggedonuser.profile.legacy.username,
      "black",
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      false,
      1600,
      1600,
      "123",
      [],
      [],
      ""
    );
    Game.setPrivate("mi2", game_id, true);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PRIVATIZE");
  });

  it("does not support setting an owner in a legacy game", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_change_owner"] });
    const p2 = TestHelpers.createUser();
    const game_id = Game.startLegacyGame(
      "mi1",
      1,
      self.loggedonuser.profile.legacy.username,
      "black",
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      false,
      1600,
      1600,
      "123",
      [],
      [],
      ""
    );
    Game.changeOwner("mi2", game_id, p2._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_CHANGE_OWNER");
  });

  it("does not support allowing/denying chat in a legacy game", function() {
    self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_restrict_chat", "allow_private_games"]
    });
    const game_id = Game.startLegacyGame(
      "mi1",
      1,
      self.loggedonuser.profile.legacy.username,
      "black",
      0,
      "Standard",
      true,
      15,
      0,
      15,
      0,
      false,
      1600,
      1600,
      "123",
      [],
      [],
      ""
    );
    Game.allowChat("mi3", game_id, false);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_RESTRICT_CHAT");
  });

  it.skip("does not support allowing/denying analysis in a legacy game", function() {
    // don't know how to do this yet
  });
  it.skip("does not support allowing/denying requests in a legacy game", function() {
    // don't know how to do this yet
  });
});
