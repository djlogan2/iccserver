import chai from "chai";

//
// create_group - Set a user as a parent
// add_to_group - Add users to a group
// remove_from_group - Remove users from a group
// change_group_permissions - Set which permissions the owner can set themselves
//
describe.skip("User groups", function() {
  it("can create a group and set a user as owner of its group if assigner has 'create_group' permissions", function() {chai.assert.fail("do me ");});
  it("can remove users from a group that has an owner, when assigner has 'remove_from_group' permissions", function() {chai.assert.fail("do me ");});
  it("can assign user to a group that has an owner, when assigner has 'add_to_group' permissions", function() {chai.assert.fail("do me ");});

  it("should throw an exception if we are trying to create a group on a user already in a group", function() {chai.assert.fail("do me ");});
  it("should throw an exception if we are trying to assign a user to a group when that user is in another group", function() {chai.assert.fail("do me ");});
  it("should throw an exception if we are trying to assign a user to a group when that user is the master of another group", function() {chai.assert.fail("do me ");});
});
