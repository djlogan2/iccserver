import chai from "chai";
import { Random } from "meteor/random";
//import { TestHelpers } from "../imports/server/TestHelpers";
import GamePublisher from "./GamePublisher";

//
// player_1 = player, played game, not to move
// player_2 = player, played game, to move
// observer_1 = observer, played game
// observer_2 = observer, public examine
// observer_3 = observer, private with analysis
// observer_4 = observer, private without analysis
// owner = owner
// all = anyone not in the above categories
//

describe.only("GamePublisher", function() {
  //const self = TestHelpers.setupDescribe.call(this);
  // updateUserType(rec)
  // type = 0   <- Player, not to move
  const tests1 = random100([
    { white: { id: "user1" } },
    { status: "playing" },
    { tomove: "black" }
  ]);
  it("should set type = 0 when played game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({ white: { id: "user1" }, status: "playing", tomove: "black" });
    chai.assert.equal(gamePublisher.newType.type, 0);
  });

  tests1.forEach(test => {
    it(
      "should set type = 0 when played game sent in one field at a time: " + JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        chai.assert.equal(gamePublisher.newType.type, 0);
      }
    );
  });
  // type = 1   <- Player, to move
  it("should set type = 1 when played game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({ white: { id: "user1" }, status: "playing", tomove: "white" });
    chai.assert.equal(gamePublisher.newType.type, 1);
  });

  const tests2 = random100([
    { white: { id: "user1" } },
    { status: "playing" },
    { tomove: "white" }
  ]);
  tests2.forEach(test => {
    it(
      "should set type = 1 when played game sent in one field at a time: " + JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        chai.assert.equal(gamePublisher.newType.type, 1);
      }
    );
  });
  it.skip("sigh", function(done) {
    this.timeout(5000000);
    const test = new Mongo.Collection("test");
    const handle = test.find().observeChanges({
      added(id, fields) {
        console.log("added: " + JSON.stringify(fields));
      },
      changed(id, fields) {
        console.log("changed: " + JSON.stringify(fields));
      },
      removed(id) {
        console.log("removed: " + id);
      }
    });
    const id = test.insert({ yea: "dome", my_bogus_array: [] });
    let iter = 0;
    let current = [];
    const interval = Meteor.setInterval(() => {
      switch (Random.choice(["add", "del"])) {
        case "add":
          const newguy = Random.id();
          test.update({ _id: id }, { $push: { my_bogus_array: { guy: newguy, iter: iter } } });
          current.push(newguy);
          break;
        case "del":
          const oldguy = Random.choice(current);
          test.update({ _id: id }, { $pull: { my_bogus_array: { guy: oldguy } } });
          current = current.filter(e => e !== oldguy);
          break;
      }
      if (++iter === 5000) {
        Meteor.clearInterval(interval);
        handle.stop();
        done();
      }
    }, 250);
  });
  // type = 2   <- Observer of a game being played
  it("should set type = 2 when played game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "playing",
      tomove: "white",
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 2);
  });

  const tests3 = random100([
    { white: { id: "user3" } },
    { status: "playing" },
    { tomove: "white" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] }
  ]);
  tests3.forEach(test => {
    it(
      "should set type = 2 when played game sent in one field at a time: " + JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        gamePublisher.updateUserType(test[3]);
        chai.assert.equal(gamePublisher.newType.type, 2);
      }
    );
  });
  // type = 3   <- Observer of a public examined game
  it("should set type = 3 when examined game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "examine",
      tomove: "white",
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 3);
  });

  const tests4 = random100([
    { white: { id: "user3" } },
    { status: "examine" },
    { tomove: "white" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] }
  ]);
  tests4.forEach(test => {
    it(
      "should set type = 3 when examined game sent in one field at a time: " + JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        gamePublisher.updateUserType(test[3]);
        chai.assert.equal(gamePublisher.newType.type, 3);
      }
    );
  });
  // type = 4   <- Owner of a private examined game
  it("should set type = 4 when examined private game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "examine",
      tomove: "white",
      private: true,
      owner: "user1",
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 4);
  });

  const tests5 = random100([
    { white: { id: "user3" } },
    { status: "examine" },
    { tomove: "white" },
    { private: true },
    { owner: "user1" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] }
  ]);
  tests5.forEach(test => {
    it(
      "should set type = 4 when examined private game sent in one field at a time: " +
        JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        gamePublisher.updateUserType(test[3]);
        gamePublisher.updateUserType(test[4]);
        gamePublisher.updateUserType(test[5]);
        chai.assert.equal(gamePublisher.newType.type, 4);
      }
    );
  });
  // type = 5   <- Observer of a private examined game with analysis
  it("should set type = 4 when examined private game sent in in total", function() {
    this.timeout(500000);
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "examine",
      tomove: "white",
      private: true,
      owner: "user9",
      analysis: [{ id: "user4" }, { id: "user1" }, { id: "user6" }],
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 5);
  });

  const tests6 = random100([
    { white: { id: "user3" } },
    { status: "examine" },
    { tomove: "white" },
    { private: true },
    { owner: "user9" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] },
    { analysis: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] }
  ]);
  tests6.forEach(test => {
    it(
      "should set type = 5 when examined private game sent in one field at a time: " +
        JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        gamePublisher.updateUserType(test[3]);
        gamePublisher.updateUserType(test[4]);
        gamePublisher.updateUserType(test[5]);
        gamePublisher.updateUserType(test[6]);
        chai.assert.equal(gamePublisher.newType.type, 5);
      }
    );
  });
  // type = 6   <- Observer of a private examined game without analysis
  it("should set type = 6 when examined private game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "examine",
      tomove: "white",
      private: true,
      owner: "user9",
      analysis: [{ id: "user4" }, { id: "user6" }],
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 6);
  });

  const tests7 = random100([
    { white: { id: "user3" } },
    { status: "examine" },
    { tomove: "white" },
    { private: true },
    { owner: "user9" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] },
    { analysis: [{ id: "user4" }, { id: "user6" }] }
  ]);
  tests7.forEach(test => {
    it(
      "should set type = 6 when examined private game sent in one field at a time: " +
        JSON.stringify(test),
      () => {
        const gamePublisher = new GamePublisher({}, "user1");
        gamePublisher.updateUserType(test[0]);
        gamePublisher.updateUserType(test[1]);
        gamePublisher.updateUserType(test[2]);
        gamePublisher.updateUserType(test[3]);
        gamePublisher.updateUserType(test[4]);
        gamePublisher.updateUserType(test[5]);
        gamePublisher.updateUserType(test[6]);
        chai.assert.equal(gamePublisher.newType.type, 6);
      }
    );
  });
  // type = 7   <- None of the above
  it("should set type = 7 when examined private game sent in in total", function() {
    const gamePublisher = new GamePublisher({}, "userA");
    gamePublisher.updateUserType({
      white: { id: "user3" },
      status: "examine",
      tomove: "white",
      private: true,
      owner: "user9",
      analysis: [{ id: "user4" }, { id: "user6" }],
      observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }]
    });
    chai.assert.equal(gamePublisher.newType.type, 7);
  });

  const tests8 = random100([
    { white: { id: "user3" } },
    { status: "examine" },
    { tomove: "white" },
    { private: true },
    { owner: "user9" },
    { observers: [{ id: "user4" }, { id: "user1" }, { id: "user6" }] },
    { analysis: [{ id: "user4" }, { id: "user6" }] }
  ]);
  tests8.forEach(test => {
    it("should set type = 7 when none of the above: " + JSON.stringify(test), () => {
      const gamePublisher = new GamePublisher({}, "userA");
      gamePublisher.updateUserType(test[0]);
      gamePublisher.updateUserType(test[1]);
      gamePublisher.updateUserType(test[2]);
      gamePublisher.updateUserType(test[3]);
      gamePublisher.updateUserType(test[4]);
      gamePublisher.updateUserType(test[5]);
      gamePublisher.updateUserType(test[6]);
      chai.assert.equal(gamePublisher.newType.type, 7);
    });
  });

  function random100(array) {
    return random(allCombinations(array), 100);
  }
  function random(array, n) {
    if (array.length <= n) return array;
    let ra = [];
    const keep = [];
    for (let x = 0; x < array.length; x++) ra.push(x);
    for (let x = 0; x < n; x++) {
      const v = parseInt(Random.fraction() * ra.length);
      keep.push(array[ra[v]]);
      ra.splice(v, 1);
    }
    return keep;
  }

  function allCombinations(array, n) {
    if (!n) n = [];
    if (n.length === array.length) {
      const duh = [];
      for (let x = 0; x < n.length; x++) duh.push(array[n[x]]);
      return [duh];
    }
    const retarray = [];
    for (let x = 0; x < array.length; x++) {
      if (n.indexOf(x) === -1) {
        n.push(x);
        // An array of arrays of records
        const r = allCombinations(array, n);
        retarray.push(...r);
        n.pop();
      }
    }
    return retarray;
  }
  // getUserFields()
  it("should set the authorized fields correctly for type 0", function() {
    this.timeout(500000);
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 0 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen"]);
    chai.assert.notIncludeMembers(gamePublisher.authorizedFields, ["premove"]);
  });
  it("should set the authorized fields correctly for type 1", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 1 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "premove"]);
  });
  it("should set the authorized fields correctly for type 2", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 2 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "computer_variations"]);
  });
  it("should set the authorized fields correctly for type 3", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 3 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "computer_variations", "examiners"]);
  });
  it("should set the authorized fields correctly for type 4", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 4 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "computer_variations", "examiners", "deny_chat"]);
  });
  it("should set the authorized fields correctly for type 5", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 5 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "computer_variations", "examiners"]);
  });
  it("should set the authorized fields correctly for type 6", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 7 };
    gamePublisher.newType = { type: 6 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime", "fen", "examiners"]);
    chai.assert.notIncludeMembers(gamePublisher.authorizedFields, ["computer_variations"]);
  });
  it("should set the authorized fields correctly for type 7", function() {
    const gamePublisher = new GamePublisher({}, "user1");
    gamePublisher.oldType = { type: 0 };
    gamePublisher.newType = { type: 7 };
    gamePublisher.getUserFields();
    chai.assert.isDefined(gamePublisher.authorizedFields);
    chai.assert.includeMembers(gamePublisher.authorizedFields, ["_id", "startTime"]);
    chai.assert.notIncludeMembers(gamePublisher.authorizedFields, ["variations", "fen"]);
  });
  //   authorizedFields
  //   addedFields
  //   deletedFields
  // copyAuthorizedFields(rec)
  // nullDeletedFields(rec)
  // addNewFields(id, rec)
  // getUpdatedRecord(id, rec)
});
