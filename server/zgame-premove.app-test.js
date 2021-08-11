import { TestHelpers } from "../imports/server/TestHelpers";
//import { Game } from "./Game";
//import { Meteor } from "meteor/meteor";
import chai from "chai";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";


describe("premove", function (done) {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should update the database and otherwise function correctly when done correctly", function () {
    let p1 = {
      user: TestHelpers.createUser(),
      subscription_updates: 0
    };
    const p2 = {
      user: TestHelpers.createUser(),
      subscription_updates: 0
    };
    let game;
    function startcollector() {
      return new Promise((resolve, reject) => {
        p1.collector = new PublicationCollector({ userId: p1._id });
        p2.collector = new PublicationCollector({userId: p2._id});
        p1.collector.collect("games", (collections) => {
          p1.subscription = collections.game;
          p1.subscription_updates++;
        });
        p2.collector.collect("games", (collections) => {
          p2.subscription = collections.game;
          p2.subscription_updates++;
        });
        resolve();
      });
    }

    function startgame() {
      return new Promise((resolve) => {
        self.loggedonuser = p1.user;
        game = Game.startLocalGame(
          "mi1",
          p2.user,
          0,
          "standard",
          true,
          15,
          0,
          "none",
          15,
          0,
          "none",
          "white"
        );
        resolve();
      });
    }

    function waitforpublication(p) {
      return new Promise((resolve) => {
        self.loggedonuser = p.user;
        const interval = Meteor.setInterval(() => {
          if(p.last_subscription_update !== p.subscription_updates) {
            Meteor.clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    function checknopremove(p) {
      return new Promise(resolve => {
        chai.assert.fail("check me");
        resolve();
      });
    }

    function checkhaspremove(p) {
      return new Promise(resolve => {
        chai.assert.fail("check me");
        resolve();
      });
    }

    function makeamove(p, move) {
      return new Promise(resolve => {
        p1.last_subscription_update = p1.subscription_updates;
        p2.last_subscription_update = p2.subscription_updates;
        self.loggedonuser = p.user;
        Game.saveLocalMove(move, game, move);
        resolve();
      });
    }

    function finish() {
      done();
    }

    startcollector()
      .then(() => startgame())
      .then(() => makeamove(p2, "e7e5"))
      .then(() => waitforpublication(p1))
      .then(() => waitforpublication(p2))
      .then(() => checknopremove(p1))
      .then(() => checkhaspremove(p2))
      .then(() => makeamove(p1,"e2e4"))
      .then(() => makeamove(p1,"g1f3"))
      .then(() => makeamove(p1, "b1c3"))
      .then(() => waitforpublication(p1))
      .then(() => checknopremove(p2))
      .then(() => checkhaspremove(p1))
      .then(() => finish());
  });

  it("should work with this specific case that Ruy was having trouble with (bug report 6-2-21)", function(){
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    Game.saveLocalMove("mi2", game_id, "e4");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi3", game_id, "e5");
    self.loggedonuser = p1;
    Game.saveLocalMove("mi4", game_id, "Nf3");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi5", game_id, "d5");
    self.loggedonuser = p1;
    Game.saveLocalMove("mi6", game_id, "Nxe5");
    Game.saveLocalMove("mi7", game_id,"exd5"); // The premove
    chai.assert.isTrue(self.clientMessagesSpy.notCalled);
    const game = Game.GameCollection.findOne();
    chai.assert.isDefined(game.premove);
  });
  it("should send a client message if the game id is invalid", () => {
    self.loggedonuser = TestHelpers.createUser();

    Game.removeLocalPremove("remove_local_premove", "1");

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "ILLEGAL_GAME");
  });

  it("should send a client message if the issuer is not a player", () => {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const p3 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    self.loggedonuser = p2;
    Game.saveLocalMove("m1", game_id, "e5");

    self.loggedonuser = p3;
    Game.removeLocalPremove("remove_local_premove", game_id);

    Game.localAddObserver("m2", game_id, p3._id);
    Game.removeLocalPremove("remove_local_premove", game_id);

    const game = Game.GameCollection.findOne({});
    chai.assert.isDefined(game.premove);

    chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_YOUR_GAME");
    chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_YOUR_GAME");
  });

  it("should send a client message if the game is examined", () => {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    self.loggedonuser = p2;
    Game.saveLocalMove("m2a", game_id, "e5");

    self.loggedonuser = p1;
    Game.requestLocalDraw("m2", game_id);
    const game1 = Game.GameCollection.findOne();
    chai.assert.isDefined(game1.premove);

    self.loggedonuser = p2;
    Game.acceptLocalDraw("m3", game_id);
    const game2 = Game.GameCollection.findOne();
    chai.assert.isUndefined(game2.premove);
    Game.removeLocalPremove("m4", game_id);

    chai.assert.isTrue(self.clientMessagesSpy.calledThrice);
    chai.assert.equal(self.clientMessagesSpy.args[2][2], "NO_PREMOVE");
  });

  it("should send a client message if there is no premove to cancel", () => {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    Game.removeLocalPremove("m4", game_id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_PREMOVE");
  });

  it("should send a client message if there is no premove to cancel", () => {
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();

    self.loggedonuser = p1;
    const game_id = Game.startLocalGame(
      "mi1",
      p2,
      0,
      "standard",
      true,
      15,
      0,
      "none",
      15,
      0,
      "none",
      "white"
    );

    self.loggedonuser = p2;
    Game.saveLocalMove("m1", game_id, "e5");

    self.loggedonuser = p1;
    Game.removeLocalPremove("m4", game_id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_YOUR_PREMOVE");
  });

  it("should add a premove action to the action array", function(){
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi2", game_id, "e5");
    const game = Game.GameCollection.findOne();
    chai.assert.isDefined(game.premove);
    chai.assert.equal(game.actions[0].type, "premove");
    chai.assert.equal(game.actions[0].parameter, "e5");
  });

  it("should add a premove delete action to the action array", function(){
    const p1 = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    self.loggedonuser = p1;
    const game_id = Game.startLocalGame("mi1", p2, 0, "standard", true, 15, 0, "none", 15, 0, "none", "white");
    self.loggedonuser = p2;
    Game.saveLocalMove("mi2", game_id, "e5");
    Game.removeLocalPremove("mi3", game_id);
    const game = Game.GameCollection.findOne();
    chai.assert.isTrue(!game.premove);
    chai.assert.equal(game.actions[0].type, "premove");
    chai.assert.equal(game.actions[0].parameter, "e5");
    chai.assert.equal(game.actions[1].type, "removepremove");
  });
});
