import chai from "chai";
import { compare, TestHelpers } from "../imports/server/TestHelpers";
import { Users } from "../imports/collections/users";
import { all_roles } from "../imports/server/userConstants";
import { Roles } from "meteor/alanning:roles";

describe.only("User management", function() {
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
      chai.assert.equal(users.userList.length, 4);
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

      chai.assert.equal(users1.userList.length, 0);
      chai.assert.equal(users2.userList.length, 0);

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
      chai.assert.equal(users.userList.length, 2);
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

      chai.assert.equal(users1.userList.length, 0);
      chai.assert.equal(users2.userList.length, 0);

      chai.assert.isTrue(self.clientMessagesSpy.calledTwice);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      chai.assert.equal(self.clientMessagesSpy.args[1][2], "NOT_AUTHORIZED");
    });

    const fields = {
      _id: 1,
      board_css: 1,
      createdAt: 1,
      emails: 1,
      locale: 1,
      profile: 1,
      ratings: 1,
      settings: 1,
      status: 1,
      username: 1
    };

    it("should accept pagination parameters and perform them", function() {
      this.timeout(60000);
      for (let x = 0; x < 100; x++) {
        let xx = "" + x;
        if(xx.length === 1)
          xx = "0" + xx;
        TestHelpers.createUser({ username: "user" + xx + "test" });
      }

      self.loggedonuser = TestHelpers.createUser({ roles: ["list_users"] });
      const result1 = Users.listUsers("mi1", 34, 8, "test");
      chai.assert.equal(100, result1.totalCount);
      chai.assert.equal(8, result1.userList.length);
      chai.assert.equal(result1.userList[0].username, "user34test");
      const result2 = Users.listUsers("mi1", 88, 50, "test");
      chai.assert.equal(100, result1.totalCount);
      chai.assert.equal(12, result2.userList.length);
      chai.assert.equal(result2.userList[0].username, "user88test");
    });

    it("should only return authorized fields for the listing of users", function() {
      const admin = TestHelpers.createUser();
      const isoadmin = TestHelpers.createUser({ isolation_group: "iso" });
      Roles.addUsersToRoles(admin, "list_users");
      Roles.addUsersToRoles(isoadmin, "list_users", "iso");
      self.loggedonuser = isoadmin;
      const results1 = Users.listUsers("mi1", 0, 50, isoadmin.username);
      chai.assert.equal(1, results1.totalCount);
      chai.assert.equal(1, results1.userList.length);
      compare(fields, results1.userList[0]);

      fields.isolation_group = 1;

      self.loggedonuser = admin;
      const results2 = Users.listUsers("mi1", 0, 50, isoadmin.username);
      chai.assert.equal(1, results2.totalCount);
      chai.assert.equal(1, results2.userList.length);
      compare(fields, results2.userList[0]);
    });

    it("should only return users in the callers isolation group", function() {
      // Tested above
    });
  });

  describe("searching global users", function() {
    it("should work if user is in global list_users", function() {
      const admin = TestHelpers.createUser({
        username: "pubuxxxadmin",
        email: "testmailpubeyyy@djl.com"
      });
      const peon = TestHelpers.createUser({
        username: "thisisapubuxxxpeon",
        email: "pubeyyy@djl.com"
      });
      const isolation_group_admin = TestHelpers.createUser({
        username: "adminisouxxxtest",
        isolation_group: "iso",
        email: "someone@testisoeyyydom.com"
      });
      const isolation_group_peon = TestHelpers.createUser({
        username: "peontestisouxxx",
        isolation_group: "iso",
        email: "someone@isoeyyy.com"
      });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = admin;
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pubu").userList.length, 2);
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "xxx").userList.length, 4);
      chai.assert.equal(Users.listUsers("mi3", 0, 50, "isoe").userList.length, 2);
      chai.assert.equal(Users.listUsers("mi4", 0, 50, "yyy").userList.length, 4);
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
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pub").userList.length, 0);
      self.loggedonuser = isolation_group_peon;
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "pub").userList.length, 0);

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
    it("should work if user is in list_users", function() {
      const admin = TestHelpers.createUser({
        username: "pubuxxxadmin",
        email: "testmailpubeyyy@djl.com"
      });
      const peon = TestHelpers.createUser({
        options: "thisisapubuxxxpeon",
        email: "pubeyyy@djl.com"
      });
      const isolation_group_admin = TestHelpers.createUser({
        username: "adminisouxxxtest",
        isolation_group: "iso",
        email: "someone@testisoeyyydom.com"
      });
      const isolation_group_peon = TestHelpers.createUser({
        username: "peontestisouxxx",
        isolation_group: "iso",
        email: "someone@isoeyyy.com"
      });

      Users.addUserToRoles(admin, "list_users");
      Users.addUserToRoles(isolation_group_admin, "list_users", "iso");

      self.loggedonuser = isolation_group_admin;
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pubu").userList.length, 0);
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "isou").userList.length, 2);
      chai.assert.equal(Users.listUsers("mi2", 0, 50, "xxx").userList.length, 2);
      chai.assert.equal(Users.listUsers("mi1", 0, 50, "pube").userList.length, 0);
      chai.assert.equal(Users.listUsers("mi3", 0, 50, "isoe").userList.length, 2);
      chai.assert.equal(Users.listUsers("mi4", 0, 50, "yyy").userList.length, 2);
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

  describe("Changing a username", function() {
    it("should be allowed by a user if he's changing his own username, and he is in the 'change_username' role", () => {
      chai.assert.fail("do me");
    });
    it("should not be allowed by a user if he's changing his own username, and he is not in the 'change_username' role", () => {
      chai.assert.fail("do me");
    });
    it("should not be allowed by a user to change another users username", () => {
      chai.assert.fail("do me");
    });
    it("should return a client message if the username change fails", () => {
      chai.assert.fail("do me");
    });
  });
  describe("Changing a username", function() {
    it("should be allowed by a user if he's changing his own email, and he is in the 'change_email' role", () => {
      chai.assert.fail("do me");
    });
    it("should not be allowed by a user if he's changing his own email, and he is not in the 'change_email' role", () => {
      chai.assert.fail("do me");
    });
    it("should not be allowed by a user to change another users email", () => {
      chai.assert.fail("do me");
    });
    it("should return a client message if the email change fails, and the original email should still be in place", () => {
      chai.assert.fail("do me");
    });
  });

  describe("deleting a user", function() {
    it("should succeed if user is in global delete_user role and isolation groups differ", function() {
      const admin = TestHelpers.createUser();
      const peon = TestHelpers.createUser();
      const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
      const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });

      Users.addUserToRoles(admin, "delete_users");
      Users.addUserToRoles(isolation_group_admin, "delete_users", "iso");

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
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_password");
        Users.addUserToRoles(isolation_group_admin, "set_other_password", "iso");
        self.loggedonuser = isolation_group_admin;
        Users.setOtherPassword("mi1", isolation_group_peon._id, "newpassword");
        Users.setOtherPassword("mi2", isolation_group_admin._id, "newpassword");
        const peon2 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        const admin2 = Meteor.users.findOne({ _id: isolation_group_admin._id });
        chai.assert.notEqual(
          isolation_group_peon.services.password.bcrypt,
          peon2.services.password.bcrypt
        );
        chai.assert.notEqual(
          isolation_group_admin.services.password.bcrypt,
          admin2.services.password.bcrypt
        );
      });
      it("should succeed if user is in global set_other_password role and isolation groups differ", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_password");
        Users.addUserToRoles(isolation_group_admin, "set_other_password", "iso");
        self.loggedonuser = admin;
        Users.setOtherPassword("mi1", peon._id, "newpassword");
        Users.setOtherPassword("mi1", isolation_group_peon._id, "newpassword");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        const peon3 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        chai.assert.notEqual(peon.services.password.bcrypt, peon2.services.password.bcrypt);
        chai.assert.notEqual(
          isolation_group_peon.services.password.bcrypt,
          peon3.services.password.bcrypt
        );
      });
      it("should fail if user is not in set_other_password role AND both users are in the same isolation group", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_password");
        Users.addUserToRoles(isolation_group_admin, "set_other_password", "iso");
        self.loggedonuser = peon;
        Users.setOtherPassword("mi1", isolation_group_peon._id, "newpassword");
        const peon2 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        chai.assert.equal(
          isolation_group_peon.services.password.bcrypt,
          peon2.services.password.bcrypt
        );
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });

      it("should fail if user is in set_other_password role and both users are NOT in the same isolation group", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_password");
        Users.addUserToRoles(isolation_group_admin, "set_other_password", "iso");
        self.loggedonuser = isolation_group_admin;
        Users.setOtherPassword("mi1", peon._id, "newpassword");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        chai.assert.equal(peon.services.password.bcrypt, peon2.services.password.bcrypt);
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });

      it("should fail if user is not in global set_other_password role and isolation groups differ", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_password");
        Users.addUserToRoles(isolation_group_admin, "set_other_password", "iso");
        self.loggedonuser = isolation_group_peon;
        Users.setOtherPassword("mi1", peon._id, "newpassword");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        chai.assert.equal(peon.services.password.bcrypt, peon2.services.password.bcrypt);
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });
    });
    describe("setOtherUsername", function() {
      it("should succeed if user is in set_other_username role AND both users are in the same isolation group", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_username");
        Users.addUserToRoles(isolation_group_admin, "set_other_username", "iso");
        self.loggedonuser = isolation_group_admin;
        Users.setOtherUsername("mi1", isolation_group_peon._id, "newusername");
        Users.setOtherUsername("mi2", isolation_group_admin._id, "newusername");
        const peon2 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        const admin2 = Meteor.users.findOne({ _id: isolation_group_admin._id });
        chai.assert.notEqual(isolation_group_peon.username, peon2.username);
        chai.assert.notEqual(isolation_group_admin.username, admin2.username);
      });
      it("should succeed if user is in global set_other_username role and isolation groups differ", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_username");
        Users.addUserToRoles(isolation_group_admin, "set_other_username", "iso");
        self.loggedonuser = admin;
        Users.setOtherUsername("mi1", peon._id, "newusername");
        Users.setOtherUsername("mi1", isolation_group_peon._id, "newusername");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        const peon3 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        chai.assert.notEqual(peon.username, peon2.username);
        chai.assert.notEqual(isolation_group_peon.username, peon3.username);
      });
      it("should fail if user is not in set_other_username role AND both users are in the same isolation group", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_username");
        Users.addUserToRoles(isolation_group_admin, "set_other_username", "iso");
        self.loggedonuser = peon;
        Users.setOtherUsername("mi1", isolation_group_peon._id, "newusername");
        const peon2 = Meteor.users.findOne({ _id: isolation_group_peon._id });
        chai.assert.equal(isolation_group_peon.username, peon2.username);
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });

      it("should fail if user is in set_other_username role and both users are NOT in the same isolation group", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_username");
        Users.addUserToRoles(isolation_group_admin, "set_other_username", "iso");
        self.loggedonuser = isolation_group_admin;
        Users.setOtherUsername("mi1", peon._id, "newusername");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        chai.assert.equal(peon.username, peon2.username);
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });

      it("should fail if user is not in global set_other_username role and isolation groups differ", function() {
        const admin = TestHelpers.createUser();
        const peon = TestHelpers.createUser();
        const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
        const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
        Users.addUserToRoles(admin, "set_other_username");
        Users.addUserToRoles(isolation_group_admin, "set_other_username", "iso");
        self.loggedonuser = isolation_group_peon;
        Users.setOtherUsername("mi1", peon._id, "newusername");
        const peon2 = Meteor.users.findOne({ _id: peon._id });
        chai.assert.equal(peon.username, peon2.username);
        chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
        chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
      });
    });
    describe.skip("user roles", function() {
      function xxx(admin, user, role, global, group) {
        self.loggedonuser = admin;

        Roles.removeUsersFromRoles(user, role);
        Roles.removeUsersFromRoles(user, role, user.isolation_group);

        Users.addRole("mi1", user._id, role);

        if (!!global) {
          chai.assert.isTrue(Users.isAuthorized(user, role));
        } else {
          chai.assert.isFalse(Users.isAuthorized(user, role));
        }

        Roles.addUsersToRoles(user, role);
        Users.removeRole("mi1", user._id, role);
        if (!!global) {
          chai.assert.isFalse(Users.isAuthorized(user, role));
        } else {
          chai.assert.isTrue(Users.isAuthorized(user, role));
        }

        Roles.removeUsersFromRoles(user, role);

        Users.addRole("mi1", user._id, role, user.isolation_group);

        if (!!group) {
          chai.assert.isTrue(Users.isAuthorized(user, role, user.isolation_group));
        } else {
          chai.assert.isFalse(Users.isAuthorized(user, role, user.isolation_group));
        }

        Roles.addUsersToRoles(user, role, user.isolation_group);
        Users.removeRole("mi1", user._id, role, user.isolation_group);
        if (!!group) {
          chai.assert.isFalse(Users.isAuthorized(user, role, user.isolation_group));
        } else {
          chai.assert.isTrue(Users.isAuthorized(user, role, user.isolation_group));
        }
      }

      all_roles.forEach(role => {
        const set_role = "set_role_" + role;
        it(
          "should succeed if user is in " +
            set_role +
            " AND both users are in the same isolation_group",
          function() {
            const admin = TestHelpers.createUser();
            const peon = TestHelpers.createUser();
            const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
            const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
            Users.addUserToRoles(admin, set_role);
            Users.addUserToRoles(isolation_group_admin, set_role, "iso");
            xxx(isolation_group_admin, isolation_group_peon, role, false, true);
          }
        );

        it(
          "should succeed if user is in global " + set_role + " and isolation groups differ",
          function() {
            const admin = TestHelpers.createUser();
            const peon = TestHelpers.createUser();
            const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
            const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
            Users.addUserToRoles(admin, set_role);
            Users.addUserToRoles(isolation_group_admin, set_role, "iso");
            xxx(admin, peon, role, true, true);
            xxx(admin, isolation_group_peon, role, true, true);
          }
        );
        it(
          "should fail if user is not in " +
            set_role +
            " AND both users are in the same isolation_group",
          function() {
            const admin = TestHelpers.createUser();
            const peon = TestHelpers.createUser();
            const isolation_group_admin = TestHelpers.createUser({ isolation_group: "iso" });
            const isolation_group_peon = TestHelpers.createUser({ isolation_group: "iso" });
            Users.addUserToRoles(admin, set_role);
            Users.addUserToRoles(isolation_group_admin, set_role, "iso");
            xxx(isolation_group_peon, peon, role, false, false);
            xxx(isolation_group_peon, isolation_group_admin, role, false, false);
          }
        );
        it(
          "should fail if user is not in global " + set_role + " and isolation groups differ",
          function() {
            /*Tested above*/
          }
        );
      });
      // set rating
      // reset rating
    });
  });

  describe("Changing a username", function() {
    it("should be allowed by a user if he's changing his own username, and he is in the 'change_username' role", () => {
      self.loggedonuser = TestHelpers.createUser({ roles: ["change_username"] });
      Users.updateCurrentUsername("mi1", "newusername");
      const user1 = Meteor.users.findOne();
      chai.assert.equal("newusername", user1.username);
    });
    it("should not be allowed by a user if he's changing his own username, and he is not in the 'change_username' role", () => {
      self.loggedonuser = TestHelpers.createUser({});
      Users.updateCurrentUsername("mi1", "newusername");
      const user1 = Meteor.users.findOne();
      chai.assert.equal(user1.username, self.loggedonuser.username);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
    });
    it("should return a client message if the username change fails", () => {
      const firstguy = TestHelpers.createUser();
      self.loggedonuser = TestHelpers.createUser();
      Users.updateCurrentUsername("mi1", firstguy.username);
      const user1 = Meteor.users.findOne({ _id: self.loggedonuser._id });
      chai.assert.equal(user1.username, self.loggedonuser.username);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_CHANGE_USERNAME");
    });
  });

  describe("Changing an email", function() {
    it("should be allowed by a user if he's changing his own email, and he is in the 'change_username' role", () => {
      self.loggedonuser = TestHelpers.createUser({ roles: ["change_email"] });
      Meteor.users.update({ _id: self.loggedonuser._id }, { $set: { "emails[0].verified": true } });
      Users.updateCurrentEmail("mi1", "email@email.com");
      const user1 = Meteor.users.findOne();
      chai.assert.equal("email@email.com", user1.emails[0].address);
      chai.assert.isFalse(user1.emails[0].verified);
    });
    it("should not be allowed by a user if he's changing his own email, and he is not in the 'change_username' role", () => {
      self.loggedonuser = TestHelpers.createUser({});
      Meteor.users.update({ _id: self.loggedonuser._id }, { $set: { "emails[0].verified": true } });
      Users.updateCurrentEmail("mi1", "newusername");
      const user1 = Meteor.users.findOne();
      chai.assert.equal(user1.emails[0].address, self.loggedonuser.emails[0].address);
      chai.assert.isTrue(user1.emails[0].verified);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "NOT_AUTHORIZED");
    });
    it("should return a client message if the email change fails", () => {
      const firstguy = TestHelpers.createUser();
      self.loggedonuser = TestHelpers.createUser({});
      Meteor.users.update({ _id: self.loggedonuser._id }, { $set: { "emails[0].verified": true } });
      Users.updateCurrentEmail("mi1", firstguy.emails[0].address);
      const user1 = Meteor.users.findOne();
      chai.assert.equal(user1.emails[0].address, self.loggedonuser.emails[0].address);
      chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
      chai.assert.isTrue(user1.emails[0].verified);
      chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_CHANGE_EMAIL");
    });
  });
});
