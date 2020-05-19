import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import { Users } from "../imports/collections/users";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

describe.only("Game owners", function() {
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

  it.skip("will not delete the game when owner logs off if observers are still present", function() {
    chai.assert.fail("do me");
  });

  it.skip("will delete the game when owner logs off if there are no other examiners or observers", function() {
    chai.assert.fail("do me");
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
    chai.assert.isFalse(game2.deny_requests);
    chai.assert.isFalse(game2.deny_chat);
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
    chai.assert.isFalse(game2.deny_requests);
    chai.assert.isFalse(game2.deny_chat);
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
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: other._id, username: other.username },
        { id: newowner._id, username: newowner.username }
      ],
      game2.examiners
    );
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: other._id, username: other.username },
        { id: newowner._id, username: newowner.username }
      ],
      game2.observers
    );
  });

  it.skip("will automatically reattach user to game if owner, upon logon", function() {
    chai.assert.fail("do me");
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
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_change_owner"] });
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.changeOwner("mi2", game_id, otherguy._id);
    const game2 = Game.collection.findOne();
    chai.assert.isDefined(game2.owner);
    chai.assert.equal(otherguy._id, game2.owner);
  });

  it("can not change the owner to another individual if not in the 'allow_change_owner' role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
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

  it.skip("how does the owner delete this game?", function() {
    chai.assert.fail("do me");
  });

  //
  // non-owners
  //
  it("can not change examiners to observers when there is an owner, and user is not the owner", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const examiner = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = examiner;
    Game.localAddObserver("mi2", game_id1, examiner._id);
    self.loggedonuser = victim;
    Game.localAddExaminer("mi3", game_id1, examiner._id);
    self.loggedonuser = abuser;
    Game.startLocalExaminedGame("mi4", "white", "black", 0);
    Game.localRemoveExaminer("mi5", game_id1, examiner._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "WHAT_TO_PUT_HERE");
  });

  it("can not change observers to examiners when there is an owner, and user is not the owner", function() {
    const abuser = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const observer = TestHelpers.createUser();
    self.loggedonuser = victim;
    const game_id1 = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = observer;
    Game.localAddObserver("mi2", game_id1, observer._id);
    self.loggedonuser = abuser;
    Game.startLocalExaminedGame("mi4", "white", "black", 0);
    Game.localAddExaminer("mi5", game_id1, observer._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "WHAT_TO_PUT_HERE");
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

  it("has their private game set to public if they are removed from the allow_private_games role", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setPrivate("mi1", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi2", game_id, requestor._id);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isDefined(game2.requestors);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username }],
      game2.requestors
    );
    Users.removeUsersFromRoles(self.loggedonuser._id, "allow_private_games");
    const game3 = Game.collection.findOne();
    chai.assert.isUndefined(game3.private);
    chai.assert.isUndefined(game3.requestors);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game3.examiners);
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game3.observers
    );
  });

  it("will add a requestor to the requestors list if they try to observe a private game allowing observe requests", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi2", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "REQUEST_SENT_OR_SOMETHING");
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
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_ALLOWING_REQUESTS");
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
      [{ id: requestor._id, username: requestor.username }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "REQUEST_SENT_OR_SOMETHING");
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
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "REQUEST_SENT_OR_SOMETHING");
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username }],
      game.requestors
    );
    self.loggedonuser = owner;
    Game.localAddObserver("mi4", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "REQUEST_DENIED");
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
      [{ id: requestor._id, username: requestor.username }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "REQUEST_SENT_OR_SOMETHING");
    self.loggedonuser = abuser;
    chai.assert.throws(() => Game.allowObserver("mi4", game_id, requestor._id, true));
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers([owner._id], game2.observers);
    chai.assert.sameDeepMembers([owner._id], game2.examiners);
    chai.assert.sameDeepMembers([requestor._id], game.requestors);
  });

  it("will not allow a non-owner to deny a users observe request", function() {
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
      [{ id: requestor._id, username: requestor.username }],
      game.requestors
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "REQUEST_SENT_OR_SOMETHING");
    self.loggedonuser = abuser;
    chai.assert.throws(() => Game.allowObserver("mi4", game_id, requestor._id, false));
    Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.observers);
    chai.assert.sameDeepMembers([{ id: owner._id, username: owner.username }], game.examiners);
    chai.assert.sameDeepMembers(
      [{ id: requestor._id, username: requestor.username }],
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
    Game.allowObserver("mi4", game_id, true);
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
    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "KICKED_OUT");
  });

  it("can not remove users from public games", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game2.observers
    );
    self.loggedonuser = owner;
    Game.localRemoveObserver("mi4", game_id, requestor._id);
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_COMMAND");
  });

  it("can not set a game private in examined games not the owner", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    self.loggedonuser = abuser;
    chai.assert.throws(() => Game.setPrivate("mi1", game_id, true));
    const game2 = Game.collection.findOne();
    chai.assert.isFalse(game2.private);
  });

  it("can not remove users from others private games", function() {
    const owner = (self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] }));
    const abuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const requestor = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    self.loggedonuser = requestor;
    Game.localAddObserver("mi3", game_id, requestor._id);
    self.loggedonuser = owner;
    Game.allowObserver("mi4", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game.observers
    );
    self.logggedonuser = abuser;
    chai.assert.throws(() => Game.localRemoveObserver("mi5", game_id, requestor._id));
    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: owner._id, username: owner.username },
        { id: requestor._id, username: requestor.username }
      ],
      game2.observers
    );
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
    chai.assert.isFalse(game1.deny_requests); // true by default
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
    chai.assert.isFalse(game.private);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    chai.assert.throws(() => Game.allowRequests("mi1", game_id, true));
    const game2 = Game.collection.findOne();
    chai.assert.isFalse(game2.private);
  });

  it("will delete 'allow observe requests' flag if changing game from private to public", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id, true);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isTrue(game.private);
    chai.assert.isFalse(game.deny_requests);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.allowRequests("mi3", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_requests);
    Game.setPrivate("mi4", game_id, false);
    const game3 = Game.collection.findOne();
    chai.assert.isFalse(game3.private);
    chai.assert.isFalse(game3.deny_requests);
  });

  it("will set 'allow observe requests' flag to true by default if changing game from public to private", function() {
    // already done in will delete 'allow observe requests' flag if changing game from private to public
  });
  it.skip("will not allow you to change change allow observe requests if you are not the owner", function() {
    chai.assert.fail("do me");
  });

  //
  // Allow chat
  //
  it("can change 'allow chat' flag in examined games if in allow_restrict_chat role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setRestrictChat("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
  });

  it("can not change 'allow chat' flag in examined games if not in allow_restrict_chat role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    chai.assert.throws(() => Game.setRestrictChat("mi1", game_id, true));
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isFalse(game.deny_chat);
  });

  it.skip("will allow an owner to kibitz/whisper when user is owner and chat is restricted", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setRestrictChat("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
    Game.kibitz("mi3", game_id, "kibitz");
    chai.assert.fail("do me -- write in the check to make sure the kibitz occurred");
  });

  it.skip("will allow not any other examiner/observer to kibitz/whisper when chat is restricted", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const peon = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setRestrictChat("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
    self.loggedonuser = peon;
    Game.kibitz("mi3", game_id, "kibitz");
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "GAME_CHAT_NOT_ALLOWED");
    chai.assert.fail("do me -- write in the check to make sure NO kibitz occurred");
  });

  it("will not allow you to change deny chat if you are not the owner", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const peon = TestHelpers.createUser({ roles: ["allow_restrict_chat"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.isFalse(game.deny_chat);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    Game.setRestrictChat("mi1", game_id, true);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.private);
    chai.assert.isTrue(game.deny_chat);
    self.loggedonuser = peon;
    Game.kibitz("mi3", game_id, "kibitz");
    chai.assert.throws(() => Game.setRestrictChat("mi1", game_id, true));
  });

  //
  // Allow analysis
  //
  it("can change 'allow analysis' flag in examined games if in allow_restrict_analysis role", function() {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_analysis"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    chai.assert.isUndefined(game.deny_analysis);
    Game.setAllowAnalysis("mi1", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_analysis);
  });

  it("can not change 'allow analysis' flag in examined games if not in allow_restrict_analysis role", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    chai.assert.isUndefined(game.deny_analysis);
    chai.assert.throws(() => Game.setAllowAnalysis("mi1", game_id, false));
    const game2 = Game.collection.findOne();
    chai.assert.isFalse(game2.deny_analysis);
  });

  it("will always send computer analysis to owner regardless of setting", function(done) {
    self.loggedonuser = TestHelpers.createUser({ roles: ["allow_restrict_analysis"] });
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    const game = Game.collection.findOne();
    chai.assert.isDefined(game.owner);
    chai.assert.equal(self.loggedonuser._id, game.owner);
    chai.assert.isUndefined(game.deny_analysis);
    Game.setAllowAnalysis("mi1", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_analysis);
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.games.length, 1);
      chai.assert.equal(collections.games[0].something, "computer analysis");
      done();
    });
  });

  it("will send computer analysis to a player when they are in the analysis array", function(done) {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_restrict_analysis"]
    }));
    const minion = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = Game.localAddObserver("mi2", game_id, minion._id);
    self.loggedonuser = owner;
    Game.setAllowAnalysis("mi1", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_analysis);
    Game.allowAnalysisFor("mi2", game_id, minion._id);
    const game3 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: minion._id, username: minion.username }], game3.analysis);
    self.loggedonuser = minion;
    const collector = new PublicationCollector({ userId: self.minion._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.games.length, 1);
      chai.assert.equal(collections.games[0].something, "computer analysis");
      chai.assert.isUndefined(collections.games[0].analysis);
      done();
    });
  });

  it("will not send computer analysis to a player when they are not in the analysis array", function(done) {
    const owner = (self.loggedonuser = TestHelpers.createUser({
      roles: ["allow_restrict_analysis"]
    }));
    const minion = TestHelpers.createUser();
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    self.loggedonuser = Game.localAddObserver("mi2", game_id, minion._id);
    self.loggedonuser = owner;
    Game.setAllowAnalysis("mi1", game_id, false);
    const game2 = Game.collection.findOne();
    chai.assert.isTrue(game2.deny_analysis);
    const game3 = Game.collection.findOne();
    chai.assert.sameDeepMembers([{ id: minion._id, username: minion.username }], game3.analysis);
    self.loggedonuser = minion;
    const collector = new PublicationCollector({ userId: self.minion._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.games.length, 1);
      chai.assert.equal(collections.games[0].something, "no computer analysis");
      chai.assert.isUndefined(collections.games[0].analysis);
      done();
    });
  });

  it("will not sensitive game record fields to client subscriptions (owner)", function(done) {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const outsideguy = TestHelpers.createUser();
    const insideguy_analysis = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id);
    Game.setAllowAnalysis("mi3", game_id, false);
    self.loggedonuser = outsideguy;
    Game.localAddObserver("mi4", game_id, outsideguy._id);
    self.loggedonuser = insideguy_analysis;
    Game.localAddObserver("mi5", game_id, insideguy_analysis._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi6", game_id, insideguy_analysis._id);
    Game.allowAnalysisFor("mi7", game_id, insideguy_analysis._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.isTrue(game.deny_analysis);
    chai.assert.sameDeepMembers(
      [{ id: outsideguy._id, username: outsideguy.username }],
      game.requestors
    );
    chai.assert.sameDeepMembers(
      [{ id: insideguy_analysis._id, username: insideguy_analysis.username }],
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
    //   authorized_analysis - only owner can see
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.games.length, 1);
      chai.assert.sameDeepMembers(
        [{ id: outsideguy._id, username: outsideguy.username }],
        collections.games[0].requestors
      );
      chai.assert.isTrue(collections.games[0].deny_requests);
      chai.assert.sameDeepMembers(
        [{ id: insideguy_analysis._id, username: insideguy_analysis.username }],
        collections.games[0].analysis
      );
      done();
    });
  });

  it("will not send sensitive game record fields to client subscriptions (observer)", function(done) {
    const owner = TestHelpers.createUser({ roles: ["allow_private_games"] });
    const outsideguy = TestHelpers.createUser();
    const insideguy_analysis = TestHelpers.createUser();
    self.loggedonuser = owner;
    const game_id = Game.startLocalExaminedGame("mi1", "white", "black", 0);
    Game.setPrivate("mi2", game_id);
    Game.setAllowAnalysis("mi3", game_id, false);
    self.loggedonuser = outsideguy;
    Game.localAddObserver("mi4", game_id, outsideguy._id);
    self.loggedonuser = insideguy_analysis;
    Game.localAddObserver("mi5", game_id, insideguy_analysis._id);
    self.loggedonuser = owner;
    Game.localAddObserver("mi6", game_id, insideguy_analysis._id);
    Game.allowAnalysisFor("mi7", game_id, insideguy_analysis._id);
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.private);
    chai.assert.isTrue(game.deny_analysis);
    chai.assert.sameDeepMembers(
      [{ id: outsideguy._id, username: outsideguy.username }],
      game.requestors
    );
    chai.assert.sameDeepMembers(
      [{ id: insideguy_analysis._id, username: insideguy_analysis.username }],
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
    //   authorized_analysis - only owner can see
    self.loggedonuser = insideguy_analysis;
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("observing_games", collections => {
      chai.assert.equal(collections.games.length, 1);
      chai.assert.isUndefined(collections.games[0].requestors);
      chai.assert.isUndefined(collections.games[0].deny_requests);
      chai.assert.isUndefined(collections.games[0].analysis);
      done();
    });
  });
});
