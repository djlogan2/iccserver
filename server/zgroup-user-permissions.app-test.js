import { Roles } from "meteor/alanning:roles";
import chai from "chai";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { TestHelpers } from "../imports/server/TestHelpers";
import { GameRequests } from "./GameRequest";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { Groups } from "./Groups";

describe.only("User groups", function() {
  this.timeout(500000);
  const self = TestHelpers.setupDescribe.apply(this);
  it("should not allow a seek to be issued if group 'seeks' setting is 'none'", function() {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup", owner);
    Groups.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Groups.changeGroupParameter("mi3", "testgroup", member, "seeks", "none");
    self.loggedonuser = member;
    chai.assert.throws(
      () => GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 0, "none", true),
      ICCMeteorError
    );
  });

  it("should allow a private seek to be issued if group 'seeks' setting is 'group'", function() {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup", owner);
    Groups.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Groups.changeGroupParameter("mi3", "testgroup", member, "seeks", "group");
    self.loggedonuser = member;
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 0, "none", true)
    );
    const request = GameRequests.collection.findOne();
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.groups);
    chai.assert.equal(request.groups.length, 1);
    chai.assert.equal(request.groups[0], "testgroup");
    chai.assert.equal(request.group_setting, "group");
  });

  it("should allow a public seek to be issued if group 'seeks' setting is 'all'", function() {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup", owner);
    Groups.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Groups.changeGroupParameter("mi3", "testgroup", member, "seeks", "all");
    self.loggedonuser = member;
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 0, "none", true)
    );
    const request = GameRequests.collection.findOne();
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.groups);
    chai.assert.equal(request.groups.length, 1);
    chai.assert.equal(request.groups[0], "testgroup");
    chai.assert.equal(request.group_setting, "all");
  });

  it("should return no seeks if group 'seeks' setting is 'none'", function(done) {
    this.timeout(10000);
    const admin = TestHelpers.createUser({
      roles: ["create_group", "add_to_group", "play_rated_games"]
    });
    const owner = TestHelpers.createUser();
    const member1 = TestHelpers.createUser();
    const member2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 0, "none", true);
    Groups.createGroup("mi2", "testgroup", owner);
    Groups.addToGroup("mi3", "testgroup", member1);
    Groups.addToGroup("mi4", "testgroup", member2);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    GameRequests.addLocalGameSeek("mi5", 0, "standard", 16, 0, "none", true);
    Groups.changeGroupParameter("mi6", "testgroup", member1, "seeks", "group");
    Groups.changeGroupParameter("mi7", "testgroup", member2, "seeks", "none");
    self.loggedonuser = member1;
    GameRequests.addLocalGameSeek("mi8", 0, "standard", 17, 0, "none", true);
    chai.assert.equal(GameRequests.collection.find().count(), 3);
    self.loggedonuser = member2;
    const collector = new PublicationCollector({ userId: member2._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 0);
      done();
    });
  });

  it("should return only seeks from other group members if group 'seeks' setting is 'group'", function(done) {
    const admin = TestHelpers.createUser({
      roles: ["create_group", "add_to_group", "play_rated_games"]
    });
    const owner1 = TestHelpers.createUser();
    const owner2 = TestHelpers.createUser();
    const member1_1 = TestHelpers.createUser();
    const member1_2 = TestHelpers.createUser();
    const member2_1 = TestHelpers.createUser();
    const member2_2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup1", owner1);
    Groups.addToGroup("mi2", "testgroup1", member1_1);
    Groups.addToGroup("mi3", "testgroup1", member1_2);
    Roles.addUsersToRoles(owner1._id, "change_group_parameter", "group testgroup1");

    Groups.createGroup("mi4", "testgroup2", owner2);
    Groups.addToGroup("mi5", "testgroup2", member2_1);
    Groups.addToGroup("mi6", "testgroup2", member2_2);
    Roles.addUsersToRoles(owner2._id, "change_group_parameter", "group testgroup2");

    self.loggedonuser = owner1;
    Groups.changeGroupParameter("mi7", "testgroup1", member1_1, "seeks", "group");
    Groups.changeGroupParameter("mi8", "testgroup1", member1_2, "seeks", "all");

    self.loggedonuser = owner2;
    Groups.changeGroupParameter("mi9", "testgroup2", member2_1, "seeks", "group");
    Groups.changeGroupParameter("mi10", "testgroup2", member2_2, "seeks", "all");

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
      const expectednot = [admin._id, owner1._id, member1_1._id, member1_2._id];
      const actualhas = collections.game_requests.map(gr => gr.owner);
      chai.assert.equal(collections.game_requests.length, expectedhas.length);
      chai.assert.sameMembers(actualhas, expectedhas);
      done();
    });
  });

  it("should return all public seeks if group 'seeks' setting is 'all'", function(done) {
    const admin = TestHelpers.createUser({
      roles: ["create_group", "add_to_group", "play_rated_games"]
    });
    const owner1 = TestHelpers.createUser();
    const owner2 = TestHelpers.createUser();
    const member1_1 = TestHelpers.createUser();
    const member1_2 = TestHelpers.createUser();
    const member2_1 = TestHelpers.createUser();
    const member2_2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup1", owner1);
    Groups.addToGroup("mi2", "testgroup1", member1_1);
    Groups.addToGroup("mi3", "testgroup1", member1_2);
    Roles.addUsersToRoles(owner1._id, "change_group_parameter", "group testgroup1");

    Groups.createGroup("mi4", "testgroup2", owner2);
    Groups.addToGroup("mi5", "testgroup2", member2_1);
    Groups.addToGroup("mi6", "testgroup2", member2_2);
    Roles.addUsersToRoles(owner2._id, "change_group_parameter", "group testgroup2");

    self.loggedonuser = owner1;
    Groups.changeGroupParameter("mi7", "testgroup1", member1_1, "seeks", "group");
    Groups.changeGroupParameter("mi8", "testgroup1", member1_2, "seeks", "all");

    self.loggedonuser = owner2;
    Groups.changeGroupParameter("mi9", "testgroup2", member2_1, "seeks", "group");
    Groups.changeGroupParameter("mi10", "testgroup2", member2_2, "seeks", "all");

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
      const expectednot = [member1_1._id];
      const actualhas = collections.game_requests.map(gr => gr.owner);
      chai.assert.equal(collections.game_requests.length, expectedhas.length);
      chai.assert.sameMembers(actualhas, expectedhas);
      done();
    });
  });

  it("should change seeks to be public if they were private and the users 'seeks' setting is changed from 'group' to 'all'", function() {
    const admin = TestHelpers.createUser({
      roles: ["create_group", "add_to_group", "play_rated_games"]
    });
    const owner1 = TestHelpers.createUser();
    const owner2 = TestHelpers.createUser();
    const member1_1 = TestHelpers.createUser();
    const member1_2 = TestHelpers.createUser();
    const member2_1 = TestHelpers.createUser();
    const member2_2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup1", owner1);
    Groups.addToGroup("mi2", "testgroup1", member1_1);
    Groups.addToGroup("mi3", "testgroup1", member1_2);
    Roles.addUsersToRoles(owner1._id, "change_group_parameter", "group testgroup1");

    Groups.createGroup("mi4", "testgroup2", owner2);
    Groups.addToGroup("mi5", "testgroup2", member2_1);
    Groups.addToGroup("mi6", "testgroup2", member2_2);
    Roles.addUsersToRoles(owner2._id, "change_group_parameter", "group testgroup2");

    self.loggedonuser = owner1;
    Groups.changeGroupParameter("mi7", "testgroup1", member1_1, "seeks", "group");
    Groups.changeGroupParameter("mi8", "testgroup1", member1_2, "seeks", "all");

    self.loggedonuser = owner2;
    Groups.changeGroupParameter("mi9", "testgroup2", member2_1, "seeks", "group");
    Groups.changeGroupParameter("mi10", "testgroup2", member2_2, "seeks", "all");

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
    Groups.changeGroupParameter("mi12", "testgroup2", member2_1, "seeks", "all");
    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 5);
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      5
    );
  });

  it("should change seeks to be private if they were public and the users 'seeks' setting is changed from 'all' to 'group", function() {
    const admin = TestHelpers.createUser({
      roles: ["create_group", "add_to_group", "play_rated_games"]
    });
    const owner1 = TestHelpers.createUser();
    const owner2 = TestHelpers.createUser();
    const member1_1 = TestHelpers.createUser();
    const member1_2 = TestHelpers.createUser();
    const member2_1 = TestHelpers.createUser();
    const member2_2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    Groups.createGroup("mi1", "testgroup1", owner1);
    Groups.addToGroup("mi2", "testgroup1", member1_1);
    Groups.addToGroup("mi3", "testgroup1", member1_2);
    Roles.addUsersToRoles(owner1._id, "change_group_parameter", "group testgroup1");

    Groups.createGroup("mi4", "testgroup2", owner2);
    Groups.addToGroup("mi5", "testgroup2", member2_1);
    Groups.addToGroup("mi6", "testgroup2", member2_2);
    Roles.addUsersToRoles(owner2._id, "change_group_parameter", "group testgroup2");

    self.loggedonuser = owner1;
    Groups.changeGroupParameter("mi7", "testgroup1", member1_1, "seeks", "group");
    Groups.changeGroupParameter("mi8", "testgroup1", member1_2, "seeks", "all");

    self.loggedonuser = owner2;
    Groups.changeGroupParameter("mi9", "testgroup2", member2_1, "seeks", "all");
    Groups.changeGroupParameter("mi10", "testgroup2", member2_2, "seeks", "all");

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
    Groups.changeGroupParameter("mi12", "testgroup2", member2_1, "seeks", "group");
    chai.assert.equal(GameRequests.collection.find({ matchingusers: member2_1._id }).count(), 2);
    chai.assert.equal(
      GameRequests.collection.findOne({ owner: member2_1._id }).matchingusers.length,
      2
    );
  });

  it("should remove all users seeks if a users 'seeks' setting is changed to 'none'", function() {
    chai.assert.fail("do me ");
  });

  it("should not allow sending a match request if group 'matches' setting is 'none'", function() {
    chai.assert.fail("do me ");
  });
  it("should not allow receiving a match request if group 'matches' setting is 'none'", function() {
    chai.assert.fail("do me ");
  });
  it("should only allow a match to be sent to a group member if the users 'matches' setting is 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should only allow a match to be received by a group member if the users 'matches' setting is 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should allow a user to match anyone if the group members 'matches' setting is 'all", function() {
    chai.assert.fail("do me ");
  });
  it("should allow a user to get a match request from anyone if the group members 'matches' setting is 'all'", function() {
    chai.assert.fail("do me ");
  });
  it("should remove match requests, to and from, to and from non-group members if a users 'matches' setting is changed from 'all' to 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should remove all match requests, to and from, if a users 'matches' setting is changed to 'none'", function() {
    chai.assert.fail("do me ");
  });

  it("should not allow a user to start a local game if group 'play' setting is set to 'none'", function() {
    chai.assert.fail("do me ");
  });
  it("should not allow a user to start a local game with a non-group member if 'play' setting is 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should allow a user to start a local game with a group member if 'play' setting is 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should allow a user to start a local game with a non-group member if 'play' setting is 'all'", function() {
    chai.assert.fail("do me ");
  });

  it("should not show any logged on members if group 'showusers' setting is set to 'none'", function() {
    chai.assert.fail("do me ");
  });
  it("should show only logged on group members if group 'showusers' setting is set to 'group'", function() {
    chai.assert.fail("do me ");
  });
  it("should show all logged on group members if group 'showusers' setting is set to 'all'", function() {
    chai.assert.fail("do me ");
  });

  it("needs to test the intersection between users in multiple groupe [g1, g2, g3] and seeks in multiple groups [g2, g3, g4]", function() {
    chai.assert.fail("do me");
  });
});
