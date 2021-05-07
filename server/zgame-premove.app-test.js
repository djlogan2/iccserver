import { TestHelpers } from "../imports/server/TestHelpers";
import { Game } from "./Game";
import chai from "chai";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

describe("premove", function (done) {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should do something", function () {
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
});
