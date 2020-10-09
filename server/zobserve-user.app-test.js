import { TestHelpers } from "../imports/server/TestHelpers";
import chai from "chai";
import { Game } from "./Game";
import { Users } from "../imports/collections/users";

describe("Observing a user", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should add the caller to the observers list of a game being played by the specified user", function() {
    const victim = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();

    self.loggedonuser = victim;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc",
      "black"
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = stalker;
    Game.observeUser("mi2", victim._id);

    const game = Game.collection.findOne();
    chai.assert.equal(game_id, game._id);
    chai.assert.sameDeepMembers([{ id: stalker._id, username: stalker.username }], game.observers);
  });

  it("should add the caller to the observers list of a game being examined by the specified user", function() {
    const victim = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();

    self.loggedonuser = victim;
    const game_id = Game.startLocalExaminedGame("mi2", "white", "black", 0);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = stalker;
    Game.observeUser("mi2", victim._id);

    const game = Game.collection.findOne();
    chai.assert.equal(game_id, game._id);
    chai.assert.sameDeepMembers(
      [
        { id: stalker._id, username: stalker.username },
        { id: victim._id, username: victim.username }
      ],
      game.observers
    );
  });

  it("should write a client message if the user is not examining or playing a game", function() {
    const someguy = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();

    self.loggedonuser = someguy;
    const game_id = Game.startLocalExaminedGame("mi2", "white", "black", 0);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = victim;
    Game.localAddObserver("mi2", game_id, victim._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: someguy._id, username: someguy.username },
        { id: victim._id, username: victim.username }
      ],
      game.observers
    );

    self.loggedonuser = stalker;
    Game.observeUser("mi2", victim._id);

    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: someguy._id, username: someguy.username },
        { id: victim._id, username: victim.username }
      ],
      game2.observers
    );

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_PLAYING_OR_EXAMINING");
  });

  it("should write a client message if the user is not in their isolation group (i.e. 'does not exist')", function() {
    const victim = TestHelpers.createUser({ isolation_group: "group1" });
    const p2 = TestHelpers.createUser({ isolation_group: "group1" });
    const stalker = TestHelpers.createUser();

    self.loggedonuser = victim;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      15,
      "inc",
      15,
      15,
      "inc",
      "black"
    );
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = stalker;
    Game.observeUser("mi2", victim._id);

    const game = Game.collection.findOne();
    chai.assert.equal(game_id, game._id);
    chai.assert.isTrue(!game.observers || !game.observers.length);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "INVALID_USER");
  });

  it("should write a client message if the user is examining a private game", function() {
    const someguy = TestHelpers.createUser();
    const victim = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();
    Users.addUserToRoles(someguy, "allow_private_games");

    self.loggedonuser = someguy;
    const game_id = Game.startLocalExaminedGame("mi2", "white", "black", 0);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = victim;
    Game.localAddObserver("mi2", game_id, victim._id);
    const game = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: someguy._id, username: someguy.username },
        { id: victim._id, username: victim.username }
      ],
      game.observers
    );

    self.loggedonuser = someguy;
    Game.setPrivate("mi3", game_id, true);
    Game.localAddExaminer("mi4", game_id, victim._id);

    self.loggedonuser = stalker;
    Game.observeUser("mi4", victim._id);

    const game2 = Game.collection.findOne();
    chai.assert.sameDeepMembers(
      [
        { id: someguy._id, username: someguy.username },
        { id: victim._id, username: victim.username }
      ],
      game2.observers
    );

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "PRIVATE_GAME");
  });

  it("should return a message if stalker is playing a game", function() {
    const victim = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = victim;
    Game.startLocalExaminedGame("mi2", "white", "black", 0);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = stalker;
    const stalker_game = Game.startLocalGame(
      "mi3",
      p2,
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
    chai.assert.isDefined(stalker_game);
    Game.observeUser("mi2", victim._id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ALREADY_PLAYING");
  });

  it("should remove stalker as an observer to observe another users game", function() {
    const victim = TestHelpers.createUser();
    const stalker = TestHelpers.createUser();
    const anotherguy = TestHelpers.createUser();

    self.loggedonuser = victim;
    const game_id = Game.startLocalExaminedGame("mi2", "white", "black", 0);
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);

    self.loggedonuser = stalker;
    const stalker_game = Game.startLocalExaminedGame("mi3", "white", "black", 0);

    self.loggedonuser = anotherguy;
    Game.localAddObserver("mi4", stalker_game, anotherguy._id);

    self.loggedonuser = stalker;
    Game.localAddExaminer("mi5", stalker_game, anotherguy._id);

    const g1 = Game.collection.findOne({ _id: stalker_game });
    chai.assert.sameDeepMembers(
      [
        { id: stalker._id, username: stalker.username },
        { id: anotherguy._id, username: anotherguy.username }
      ],
      g1.examiners
    );
    chai.assert.sameDeepMembers(
      [
        { id: stalker._id, username: stalker.username },
        { id: anotherguy._id, username: anotherguy.username }
      ],
      g1.observers
    );

    Game.observeUser("mi2", victim._id);

    const g2a = Game.collection.findOne({ _id: stalker_game });
    chai.assert.sameDeepMembers(
      [{ id: anotherguy._id, username: anotherguy.username }],
      g2a.examiners
    );
    chai.assert.sameDeepMembers(
      [{ id: anotherguy._id, username: anotherguy.username }],
      g2a.observers
    );

    const g2b = Game.collection.findOne({ _id: game_id });
    chai.assert.sameDeepMembers(
      [
        { id: victim._id, username: victim.username },
        { id: stalker._id, username: stalker.username }
      ],
      g2b.observers
    );
  });
});
