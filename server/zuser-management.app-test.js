import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";

describe("User management", function(){
  const self = TestHelpers.setupDescribe.apply(this);
  describe("listing isolation groups", function() {
    it("should work if user is in global_list_isolation_groups role", function(){chai.assert.fail("do me");});
    it("should fail if user is not in global_list_isolation_groups role", function(){chai.assert.fail("do me");});
  });

  describe("listing all global users", function() {
    it("should work if user is in global_list_users", function(){chai.assert.fail("do me");});
    it("should fail if user is not in global_list_users", function(){chai.assert.fail("do me");});
    it("should accept pagination parameters and perform them", function(){chai.assert.fail("do me");});
    it("should only return authorized fields for the listing of users", function(){chai.assert.fail("do me");});
    it("should only return users in all isolation groups", function(){chai.assert.fail("do me");});
  });

  describe("listing isolation group users", function() {
    it("should work if user is in list_users", function(){chai.assert.fail("do me");});
    it("should fail if user is not in list_users", function(){chai.assert.fail("do me");});
    it("should accept pagination parameters and perform them", function(){chai.assert.fail("do me");});
    it("should only return authorized fields for the listing of users", function(){chai.assert.fail("do me");});
    it("should only return users in the callers isolation group", function(){chai.assert.fail("do me");});
  });

  describe("searching global users", function() {
    it("should work if user is in global_list_users", function(){chai.assert.fail("do me");});
    it("should fail if user is not in global_list_users", function(){chai.assert.fail("do me");});
    it("should accept pagination parameters and perform them", function(){chai.assert.fail("do me");});
    it("should only return authorized fields for the listing of users", function(){chai.assert.fail("do me");});
    it("should only return users in all isolation groups", function(){chai.assert.fail("do me");});
    it("should return users that meet regex-type criteria in any authorized field (for example, 'dj' could return 'djlogan@gmail', 'maradjohnson', etc.", function(){chai.assert.fail("do me");});
  });

  describe("searching isolation group users", function() {
    it("should work if user is in list_users", function(){chai.assert.fail("do me");});
    it("should fail if user is not in list_users", function(){chai.assert.fail("do me");});
    it("should accept pagination parameters and perform them", function(){chai.assert.fail("do me");});
    it("should only return authorized fields for the listing of users", function(){chai.assert.fail("do me");});
    it("should only return users only in callers isolation group", function(){chai.assert.fail("do me");});
    it("should return users that meet regex-type criteria in any authorized field (for example, 'dj' could return 'djlogan@gmail', 'maradjohnson', etc.", function(){chai.assert.fail("do me");});
  });

  describe("deleting a user", function() {
    it("should succeed if user is in global_delete_user role and isolation groups differ", function(){chai.assert.fail("do me");});
    it("should fail if user is not in global_delete_user role", function(){chai.assert.fail("do me");});
    it("should succeed if user is in delete_user role and isolation group matches", function(){chai.assert.fail("do me");});
    it("should fail if user is not in delete_user role", function(){chai.assert.fail("do me");});
    it("should fail if user tries to delete themselves", function(){chai.assert.fail("do me");});
  });

  describe("altering a user", function() {
    describe("setPassword", function(){
      it("should succeed if user is in set_other_password role AND both users are in the same isolation group", function(){chai.assert.fail("do me");});
      it("should succeed if user is in global_set_other_password role and isolation groups differ", function(){chai.assert.fail("do me");});
      it("should fail if user is not in set_other_password role AND both users are in the same isolation group", function(){chai.assert.fail("do me");});
      it("should fail if user is in set_other_password role and both users are NOT in the same isolation group", function(){chai.assert.fail("do me");});
      it("should fail if user is not in global_set_other_password role and isolation groups differ", function(){chai.assert.fail("do me");});
    });
    // child chat
    // child chat exempt
    // set rating
    // reset rating
    // add/remove users from roles
  });
});
