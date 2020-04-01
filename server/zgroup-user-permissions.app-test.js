import chai from "chai";
import { Meteor } from "meteor/meteor";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { TestHelpers } from "../imports/server/TestHelpers";
import { GameRequests } from "./GameRequest";
import { Users } from "../imports/collections/users";
import { Game } from "./Game";

describe("User groups", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should allow a private seek to be issued if users 'limit_to_groups' setting is true", function() {
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup"], limit_to_group: true });
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 0, "none", true)
    );
    const request = GameRequests.collection.findOne();
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.groups);
    chai.assert.equal(request.groups.length, 1);
    chai.assert.equal(request.groups[0], "testgroup");
    chai.assert.equal(request.limit_to_group, true);
  });

  it("should allow a public seek to be issued if users 'limit_to_groups' setting is false", function() {
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup"], limit_to_group: false });
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 0, "none", true)
    );
    const request = GameRequests.collection.findOne();
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.groups);
    chai.assert.equal(request.groups.length, 1);
    chai.assert.equal(request.groups[0], "testgroup");
    chai.assert.equal(request.limit_to_group, false);
  });

  it("should return only seeks from other group members if users 'limit_to_groups' setting is true", function(done) {
    const admin = TestHelpers.createUser();
    const owner1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const owner2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });
    const member1_1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    const member1_2 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const member2_1 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: true });
    const member2_2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });

    // admin - seek - global
    // owner1 - seek - global plus testgroup1
    // owner2 - seek - global plus testgroup2
    // member1_1 - seek - testgroup1
    // member1_2 - seek - global plus testgroup1
    // member2_1 - seek - testgroup2
    // member2_2 - seek - global plus testgroup2
    [admin, owner1, owner2, member1_1, member1_2, member2_1, member2_2].forEach(member => {
      self.loggedonuser = member;
      GameRequests.addLocalGameSeek("mi8", 0, "standard", 16, 0, "none", true);
    });

    chai.assert.equal(GameRequests.collection.find().count(), 7);

    self.loggedonuser = member2_1;
    const collector = new PublicationCollector({ userId: member2_1._id });
    collector.collect("game_requests", collections => {
      const expectedhas = [owner2._id, member2_1._id, member2_2._id];
      const actualhas = collections.game_requests.map(gr => gr.owner);
      chai.assert.equal(collections.game_requests.length, expectedhas.length);
      chai.assert.sameMembers(actualhas, expectedhas);
      done();
    });
  });

  it("should return all public seeks if users 'limit_to_groups' setting is false", function(done) {
    const admin = TestHelpers.createUser();
    const owner1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const owner2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });
    const member1_1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    const member1_2 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const member2_1 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: true });
    const member2_2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });

    // admin - seek - global
    // owner1 - seek - global plus testgroup1
    // owner2 - seek - global plus testgroup2
    // member1_1 - seek - testgroup1
    // member1_2 - seek - global plus testgroup1
    // member2_1 - seek - testgroup2
    // member2_2 - seek - global plus testgroup2
    [admin, owner1, owner2, member1_1, member1_2, member2_1, member2_2].forEach(member => {
      self.loggedonuser = member;
      GameRequests.addLocalGameSeek("mi8", 0, "standard", 16, 0, "none", true);
    });

    chai.assert.equal(GameRequests.collection.find().count(), 7);

    self.loggedonuser = member2_2;
    const collector = new PublicationCollector({ userId: member2_2._id });
    collector.collect("game_requests", collections => {
      const expectedhas = [
        admin._id,
        owner1._id,
        owner2._id,
        member1_2._id,
        member2_1._id,
        member2_2._id
      ];
      const actualhas = collections.game_requests.map(gr => gr.owner);
      chai.assert.equal(collections.game_requests.length, expectedhas.length);
      chai.assert.sameMembers(actualhas, expectedhas);
      done();
    });
  });

  it("should change seeks to be public if they were private and the users users 'limit_to_groups' setting is changed from true to false", function() {
    const admin = TestHelpers.createUser();
    const owner1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const owner2 = TestHelpers.createUser({
      groups: ["testgroup2"],
      limit_to_group: false,
      roles: ["change_limit_to_group", "play_rated_games"]
    });
    const member1_1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    const member1_2 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const member2_1 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: true });
    const member2_2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });

    // admin - seek - global
    // owner1 - seek - global plus testgroup1
    // owner2 - seek - global plus testgroup2
    // member1_1 - seek - testgroup1
    // member1_2 - seek - global plus testgroup1
    // member2_1 - seek - testgroup2
    // member2_2 - seek - global plus testgroup2
    [admin, owner1, owner2, member1_1, member1_2, member2_1, member2_2].forEach(member => {
      self.loggedonuser = member;
      GameRequests.addLocalGameSeek("mi11", 0, "standard", 16, 0, "none", true);
    });

    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 2); // If I'm an owner, I'm not in matchingusers
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      2
    );

    self.loggedonuser = owner2;
    Users.setLimitToGroup("mi12", member2_1, false);
    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 5);
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      5
    );
  });

  it("should change seeks to be private if they were public and the users 'limit_to_groups' setting is changed from false to true", function() {
    const admin = TestHelpers.createUser();
    const owner1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const owner2 = TestHelpers.createUser({
      groups: ["testgroup2"],
      limit_to_group: false,
      roles: ["change_limit_to_group", "play_rated_games"]
    });
    const member1_1 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    const member1_2 = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    const member2_1 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });
    const member2_2 = TestHelpers.createUser({ groups: ["testgroup2"], limit_to_group: false });

    // admin - seek - global
    // owner1 - seek - global plus testgroup1
    // owner2 - seek - global plus testgroup2
    // member1_1 - seek - testgroup1
    // member1_2 - seek - global plus testgroup1
    // member2_1 - seek - testgroup2
    // member2_2 - seek - global plus testgroup2
    [admin, owner1, owner2, member1_1, member1_2, member2_1, member2_2].forEach(member => {
      self.loggedonuser = member;
      GameRequests.addLocalGameSeek("mi11", 0, "standard", 16, 0, "none", true);
    });

    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 5); // If I'm an owner, I'm not in matchingusers
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      5
    );

    self.loggedonuser = owner2;
    Users.setLimitToGroup("mi12", member2_1, true);
    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 2);
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      2
    );
  });

  it("should only allow a match to be sent to a group member if users 'limit_to_groups' setting is true", function() {
    const admin = TestHelpers.createUser();
    const owner = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    GameRequests.addLocalMatchRequest(
      "mi4",
      owner,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);

    GameRequests.addLocalMatchRequest(
      "mi4",
      admin,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
    chai.assert.equal(GameRequests.collection.find().count(), 1);
  });

  it("should only allow a match to be received by a group member if the users 'limit_to_groups' setting is true", function() {
    const member = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    GameRequests.addLocalMatchRequest(
      "mi4",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);

    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLocalMatchRequest(
      "mi4",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_OPPONENT");
    chai.assert.equal(GameRequests.collection.find().count(), 1);
  });

  it("should allow a user to match anyone if the users 'limit_to_groups' setting is false", function() {
    const admin = TestHelpers.createUser();
    const owner = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });

    GameRequests.addLocalMatchRequest(
      "mi4",
      owner,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);

    GameRequests.addLocalMatchRequest(
      "mi4",
      admin,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 2);
  });

  it("should allow a user to get a match request from anyone if the users 'limit_to_groups' setting is false", function() {
    const member = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    GameRequests.addLocalMatchRequest(
      "mi4",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);

    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLocalMatchRequest(
      "mi4",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 2);
  });

  it("should remove match requests to and from non-group members if users 'limit_to_groups' setting is changed from false to true", function() {
    const admin = TestHelpers.createUser();
    const owner = TestHelpers.createUser({
      groups: ["testgroup1"],
      limit_to_group: false,
      roles: ["change_limit_to_group", "play_rated_games"]
    });
    const member = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    self.loggedonuser = owner;
    GameRequests.addLocalMatchRequest(
      "mi4",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);

    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLocalMatchRequest(
      "mi5",
      member,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    self.loggedonuser = member;
    GameRequests.addLocalMatchRequest(
      "mi6",
      admin,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    GameRequests.addLocalMatchRequest(
      "mi7",
      owner,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    chai.assert.equal(GameRequests.collection.find().count(), 4);
    self.loggedonuser = owner;
    Users.setLimitToGroup("mi8", member, true);
    chai.assert.equal(GameRequests.collection.find().count(), 2);
  });

  it("should not allow a user to start a local game with a non-group member if 'limit_to_group' setting is 'true'", function() {
    const member = TestHelpers.createUser({ groups: ["testhelpers"], limit_to_group: false });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    chai.assert.equal(Game.collection.find().count(), 0);
    Game.startLocalGame("mi1", member, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 0);
  });

  it("should not allow a user to start a local game with a non-group member if 'limit_to_group' setting is 'true'", function() {
    const member = TestHelpers.createUser({ groups: ["testhelpers"], limit_to_group: true });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    chai.assert.equal(Game.collection.find().count(), 0);
    Game.startLocalGame("mi1", member, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 0);
  });

  it("should allow a user to start a local game with a group member if 'limit_to_group' setting is 'true'", function() {
    const member = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    chai.assert.equal(Game.collection.find().count(), 0);
    Game.startLocalGame("mi1", member, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 1);
  });

  it("should allow a user to start a local game with a group member if 'limit_to_group' setting is 'true'", function() {
    const member = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: true });
    self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
    chai.assert.equal(Game.collection.find().count(), 0);
    Game.startLocalGame("mi1", member, 0, "standard", true, 15, 0, "none", 15, 0, "none");
    chai.assert.equal(Game.collection.find().count(), 1);
  });

  it("should allow a user to start a local game with a non-group member if 'limit_to_group' setting is 'false'", function() {
    it("should allow a user to start a local game with a group member if 'limit_to_group' setting is 'true'", function() {
      const member = TestHelpers.createUser({ groups: ["testhelpers"], limit_to_group: false });
      self.loggedonuser = TestHelpers.createUser({ groups: ["testgroup1"], limit_to_group: false });
      chai.assert.equal(Game.collection.find().count(), 0);
      Game.startLocalGame("mi1", member, 0, "standard", true, 15, 0, "none", 15, 0, "none");
      chai.assert.equal(Game.collection.find().count(), 1);
    });
  });

  it("should not show any logged on members if user is not in the 'show_users' role", function(done) {
    const user = TestHelpers.createUser({ roles: ["login"] });
    for (let x = 0; x < 4; x++) TestHelpers.createUser();
    self.loggedonuser = user;
    chai.assert.equal(Meteor.users.find({ "status.online": true }).count(), 5);
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("loggedOnUsers", collections => {
      chai.assert.equal(collections.users.length, 1);
      done();
    });
  });

  it("should show only logged on group members if 'limit_to_group' setting is set to 'true'", function(done) {
    this.timeout(500000);
    TestHelpers.createUser();
    TestHelpers.createUser({ groups: "group1" });
    TestHelpers.createUser({ groups: "group2" });
    self.loggedonuser = TestHelpers.createUser({ groups: "group2", limit_to_group: true });
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("loggedOnUsers", collections => {
      chai.assert.equal(collections.users.length, 2);
      done();
    });
  });

  it("should show all logged on group members if group 'limit_to_group' setting is set to 'false'", function(done) {
    this.timeout(500000);
    TestHelpers.createUser();
    TestHelpers.createUser({ groups: "group1" });
    TestHelpers.createUser({ groups: "group2" });
    self.loggedonuser = TestHelpers.createUser({ groups: "group2", limit_to_group: false });
    const collector = new PublicationCollector({ userId: self.loggedonuser._id });
    collector.collect("loggedOnUsers", collections => {
      chai.assert.equal(collections.users.length, 4);
      done();
    });
  });
});
