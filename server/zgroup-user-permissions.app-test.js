import { Roles } from "meteor/alanning:roles";
import chai from "chai";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Users } from "../imports/collections/users";
import { GameRequests } from "./GameRequest";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

describe.only("User groups", function() {
  this.timeout(500000);
  const self = TestHelpers.setupDescribe.apply(this);
  it("should not allow a seek to be issued if group 'seeks' setting is 'none'", function() {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member = TestHelpers.createUser();
    self.loggedonuser = admin;
    Users.createGroup("mi1", "testgroup", owner);
    Users.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Users.changeGroupParameter("mi3", "testgroup", member, "seeks", "none");
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
    Users.createGroup("mi1", "testgroup", owner);
    Users.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Users.changeGroupParameter("mi3", "testgroup", member, "seeks", "group");
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
    Users.createGroup("mi1", "testgroup", owner);
    Users.addToGroup("mi2", "testgroup", member);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    Users.changeGroupParameter("mi3", "testgroup", member, "seeks", "all");
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
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member1 = TestHelpers.createUser();
    const member2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 0, "none", true);
    Users.createGroup("mi2", "testgroup", owner);
    Users.addToGroup("mi3", "testgroup", member1);
    Users.addToGroup("mi4", "testgroup", member2);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    GameRequests.addLocalGameSeek("mi5", 0, "standard", 15, 0, "none", true);
    Users.changeGroupParameter("mi6", "testgroup", member1, "seeks", "group");
    Users.changeGroupParameter("mi7", "testgroup", member2, "seeks", "none");
    self.loggedonuser = member1;
    GameRequests.addLocalGameSeek("mi8", 0, "standard", 15, 0, "none", true);
    chai.assert.equal(GameRequests.collection.find().count(), 3);
    const collector = new PublicationCollector({ userId: member2._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 0);
      done();
    });
  });

  it("should return only seeks from other group members if group 'seeks' setting is 'group'", function(done) {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group"] });
    const owner = TestHelpers.createUser();
    const member1 = TestHelpers.createUser();
    const member2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 0, "none", true);
    Users.createGroup("mi2", "testgroup", owner);
    Users.addToGroup("mi3", "testgroup", member1);
    Users.addToGroup("mi4", "testgroup", member2);
    Roles.addUsersToRoles(owner._id, "change_group_parameter", "group testgroup");
    self.loggedonuser = owner;
    GameRequests.addLocalGameSeek("mi5", 0, "standard", 15, 0, "none", true);
    Users.changeGroupParameter("mi6", "testgroup", member1, "seeks", "group");
    Users.changeGroupParameter("mi7", "testgroup", member2, "seeks", "group");
    self.loggedonuser = member1;
    GameRequests.addLocalGameSeek("mi8", 0, "standard", 15, 0, "none", true);
    chai.assert.equal(GameRequests.collection.find().count(), 3);
    const collector = new PublicationCollector({ userId: member2._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 1);
      chai.assert.equal(collections.game_requests[0].owner, member2._id);
      done();
    });
  });

  it.only("should return all public seeks if group 'seeks' setting is 'all'", function(done) {
    const admin = TestHelpers.createUser({ roles: ["create_group", "add_to_group", "play_rated_games"] });
    const owner1 = TestHelpers.createUser();
    const owner2 = TestHelpers.createUser();
    const member1_1 = TestHelpers.createUser();
    const member1_2 = TestHelpers.createUser();
    const member2_1 = TestHelpers.createUser();
    const member2_2 = TestHelpers.createUser();
    self.loggedonuser = admin;
    GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 0, "none", true);
    Users.createGroup("mi2", "testgroup1", owner1);
    Users.addToGroup("mi3", "testgroup1", member1_1);
    Users.addToGroup("mi4", "testgroup1", member1_2);
    Roles.addUsersToRoles(owner1._id, "change_group_parameter", "group testgroup1");
    Users.createGroup("mi5", "testgroup2", owner2);
    Users.addToGroup("mi6", "testgroup2", member2_1);
    Users.addToGroup("mi7", "testgroup2", member2_2);
    Roles.addUsersToRoles(owner2._id, "change_group_parameter", "group testgroup2");

    self.loggedonuser = owner1;
    GameRequests.addLocalGameSeek("mi8", 0, "standard", 16, 0, "none", true);
    Users.changeGroupParameter("mi9", "testgroup1", member1_1, "seeks", "group");
    Users.changeGroupParameter("mi10", "testgroup1", member1_2, "seeks", "all");
    self.loggedonuser = owner2;
    GameRequests.addLocalGameSeek("mi11", 0, "standard", 17, 0, "none", true);
    Users.changeGroupParameter("mi12", "testgroup2", member2_1, "seeks", "group");
    Users.changeGroupParameter("mi13", "testgroup2", member2_2, "seeks", "all");

    self.loggedonuser = member1_1;
    GameRequests.addLocalGameSeek("mi14", 0, "standard", 18, 0, "none", true);

    self.loggedonuser = member2_1;
    GameRequests.addLocalGameSeek("mi15", 0, "standard", 19, 0, "none", true);

    chai.assert.equal(GameRequests.collection.find().count(), 5);

    const collector = new PublicationCollector({ userId: member2_1._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 4);
      done();
    });
  });

  it("should never publish private seeks (i.e. not a group member)", function() {
    chai.assert.fail("do me ");
  });
  it("should change seeks to be public if they were private and the users 'seeks' setting is changed from 'group' to 'all'", function() {
    chai.assert.fail("do me ");
  });
  it("should change seeks to be private if they were public and the users 'seeks' setting is changed from 'all' to 'group", function() {
    chai.assert.fail("do me ");
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
