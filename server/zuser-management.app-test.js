import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";
import { Users } from "../imports/collections/users";
//import { ClientMessages } from "../imports/collections/ClientMessages";

describe("User management", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  describe("listing isolation groups", function() {
    it("should work if user is in global list_isolation_groups role", function() {
      this.timeout(5000);
      const admin = TestHelpers.createUser();
      TestHelpers.createUser({ isolation_group: "iso1" });
      TestHelpers.createUser({ isolation_group: "iso2" });
      TestHelpers.createUser({ isolation_group: "iso3" });
      TestHelpers.createUser({ isolation_group: "iso4" });
      TestHelpers.createUser({ isolation_group: "iso1" });
      TestHelpers.createUser({ isolation_group: "iso2" });
      TestHelpers.createUser({ isolation_group: "iso3" });
      TestHelpers.createUser({ isolation_group: "iso4" });

      Users.addUserToRoles(admin, "list_isolation_groups");

      self.loggedonuser = admin;
      const iso_groups = Users.listIsolationGroups("mi1");
      chai.assert.sameMembers(iso_groups, ["public", "iso1", "iso2", "iso3", "iso4"]);
    });

    it("should fail if user is not in global list_isolation_groups role", function() {
      this.timeout(5000000);
      const peon = TestHelpers.createUser();
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      self.loggedonuser = peon;
      const iso_groups1 = Users.listIsolationGroups("mi1");

      self.loggedonuser = isolation_group_peon;
      const iso_groups2 = Users.listIsolationGroups("mi2");

      chai.assert.equal(iso_groups1.length, 0);
      chai.assert.equal(iso_groups2.length, 0);

      chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
    });
  });

  describe("listing all global users", function() {
    it("should work if user is in global list_users", function() {
      const admin = TestHelpers.createUser();
      TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = admin;
      const users = Users.listUsers("mi1", 0, 50);
      chai.assert.equal(users.length, 4);
    });

    it("should fail if user is not in global list_users", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = peon;
      const users1 = Users.listUsers("mi1", 0, 50);
      self.loggedonuser = isolation_group_peon;
      const users2 = Users.listUsers("mi2", 0, 50);

      chai.assert.equal(users1.length, 0);
      chai.assert.equal(users2.length, 0);

      chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
    });

    it("should accept pagination parameters and perform them", function() {
      chai.assert.fail("do me");
    });

    it("should only return authorized fields for the listing of users", function() {
      chai.assert.fail("do me");
    });

    it("should return users in all isolation groups", function() {
      // Tested above
    });
  });

  describe("listing isolation group users", function() {
    it("should work if user is in list_users", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = isolation_group_admin;
      const users = Users.listUsers("mi1", 0, 50);
      chai.assert.equal(users.length, 2);
    });

    it("should fail if user is not in list_users", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = peon;
      const users1 = Users.listUsers("mi1", 0, 50);
      self.loggedonuser = isolation_group_peon;
      const users2 = Users.listUsers("mi2", 0, 50);

      chai.assert.equal(users1.length, 0);
      chai.assert.equal(users2.length, 0);

      chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
    });

    it("should accept pagination parameters and perform them", function() {
      chai.assert.fail("do me");
    });
    it("should only return authorized fields for the listing of users", function() {
      chai.assert.fail("do me");
    });
    it("should only return users in the callers isolation group", function() {
      // Tested above
    });
  });

  describe("searching global users", function() {
    it.only("should work if user is in global list_users", function() {
      const admin = TestHelpers.createUser({
        username: "pubxxxadmin",
        email: "testmailc1yyy@djl.com"
      });
      const peon = TestHelpers.createUser({ username: "thisisapubxxxpeon", email: "c1yyy@djl.com" });
      const isolation_group_admin = TestHelpers.createUser({
        username: "adminisoxxxtest",
        isolation_group: "iso",
        email: "someone@testc1yyydom.com"
      });
      const isolation_group_peon = TestHelpers.createUser({
        username: "peontestisoxxx",
        isolation_group: "iso",
        email: "someone@c1yyy.com"
      });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = admin;
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pub").length, 2);
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "xxx").length, 4);
      chai.assert.equal(Users.listUsers("mi3", 0, 50, "c1").length, 2);
      chai.assert.equal(Users.listUsers("mi4", 0, 50, "yyy").length, 4);
    });

    it("should fail if user is not in global list_users", function() {
      const admin = TestHelpers.createUser({
        username: "pubxxxadmin",
        email: "testmailc1yyy@djl.com"
      });
      const peon = TestHelpers.createUser({ options: "thisisapubxxxpeon", email: "c1yyy@djl.com" });
      const isolation_group_admin = TestHelpers.createUser({
        username: "adminisoxxxtest",
        isolation_group: "iso",
        email: "someone@testc1yyydom.com"
      });
      const isolation_group_peon = TestHelpers.createUser({
        username: "peontestisoxxx",
        isolation_group: "iso",
        email: "someone@c1yyy.com"
      });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = peon;
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pub").length, 0);
      self.loggedonuser = isolation_group_peon;
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "pub").length, 0);

      chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
    });
    it("should accept pagination parameters and perform them", function() {
      chai.assert.fail("do me");
    });
    it("should only return authorized fields for the listing of users", function() {
      chai.assert.fail("do me");
    });
    it("should only return users in all isolation groups", function() {
      // Tested above
    });
    it("should return users that meet regex-type criteria in any authorized field (for example, 'dj' could return 'djlogan@gmail', 'maradjohnson', etc.", function() {
      // Tested above
    });
  });

  describe("searching isolation group users", function() {
    it.only("should work if user is in list_users", function() {
      const admin = TestHelpers.createUser({
        username: "pubxxxadmin",
        email: "testmailc1yyy@djl.com"
      });
      const peon = TestHelpers.createUser({ options: "thisisapubxxxpeon", email: "c1yyy@djl.com" });
      const isolation_group_admin = TestHelpers.createUser({
        username: "adminisoxxxtest",
        isolation_group: "iso",
        email: "someone@testc1yyydom.com"
      });
      const isolation_group_peon = TestHelpers.createUser({
        username: "peontestisoxxx",
        isolation_group: "iso",
        email: "someone@c1yyy.com"
      });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = isolation_group_admin;
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pub").length, 1);
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "xxx").length, 2);
      chai.assert.equal(Users.listUsers("mi3", 0, 50, "c1").length, 1);
      chai.assert.equal(Users.listUsers("mi4", 0, 50, "yyy").length, 2);
    });
    it("should fail if user is not in list_users", function() {
      // Tested above
    });
    it("should accept pagination parameters and perform them", function() {
      chai.assert.fail("do me");
    });
    it("should only return authorized fields for the listing of users", function() {
      chai.assert.fail("do me");
    });
    it("should only return users only in callers isolation group", function() {
      // Tested above
    });
    it("should return users that meet regex-type criteria in any authorized field (for example, 'dj' could return 'djlogan@gmail', 'maradjohnson', etc.", function() {
      // Tested above
    });
  });

  describe("deleting a user", function() {
    it.only("should succeed if user is in global delete_user role and isolation groups differ", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = admin;
      Users.deleteUser("mi1", peon._id);
      Users.deleteUser("mi2", isolation_group_peon._id);
      Users.deleteUser("mi3", isolation_group_admin._id);
      chai.assert.equal(Meteor.users.find().count(), 1);
    });

    it("should fail if user is not in global delete_user role", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "delete_users");
      Users.addUserToRoles(isolation_group_admin, "delete_users", "iso");

      self.loggedonuser = peon;
      Users.deleteUser("mi1", peon._id);
      Users.deleteUser("mi2", isolation_group_peon._id);
      Users.deleteUser("mi3", isolation_group_admin._id);

      self.loggedonuser = isolation_group_peon;
      Users.deleteUser("mi1", peon._id);
      Users.deleteUser("mi2", isolation_group_peon._id);
      Users.deleteUser("mi3", isolation_group_admin._id);
      chai.assert.equal(Meteor.users.find().count(), 4);

      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[2][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[3][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[4][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[5][2], "NOT_AUTHORIZED");
    });

    it("should succeed if user is in delete_user role and isolation group matches", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "delete_users");
      Users.addUserToRoles(isolation_group_admin, "delete_users", "iso");

      self.loggedonuser = isolation_group_admin;
      Users.deleteUser("mi1", peon._id);
      chai.assert.equal(Meteor.users.find().count(), 4);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");

      Users.deleteUser("mi1", isolation_group_peon._id);
      chai.assert.equal(Meteor.users.find().count(), 3);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    });

    it("should fail if user is not in delete_user role", function() {
      chai.assert.fail("do me");
    });
    it("should fail if user tries to delete themselves", function() {
      chai.assert.fail("do me");
    });
  });

  describe("altering a user", function() {
    describe("setPassword", function() {
      it("should succeed if user is in set_other_password role AND both users are in the same isolation group", function() {
        chai.assert.fail("do me");
      });
      it("should succeed if user is in global set_other_password role and isolation groups differ", function() {
        chai.assert.fail("do me");
      });
      it("should fail if user is not in set_other_password role AND both users are in the same isolation group", function() {
        chai.assert.fail("do me");
      });
      it("should fail if user is in set_other_password role and both users are NOT in the same isolation group", function() {
        chai.assert.fail("do me");
      });
      it("should fail if user is not in global_set_other_password role and isolation groups differ", function() {
        chai.assert.fail("do me");
      });
    });
    // child chat
    // child chat exempt
    // set rating
    // reset rating
    // add/remove users from roles
  });
});
