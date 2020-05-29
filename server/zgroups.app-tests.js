import chai from "chai";
import { TestHelpers } from "../imports/server/TestHelpers";

describe.skip("Groups", function(){
  const self = TestHelpers.setupDescribe.apply(this);
  it("should set a played game as 'restricted' if either player is group restricted", function(){
    const p1 = TestHelpers.createUser({limit_to_group: true, groups: ["test1", "test2", "test3", "test4"]});
    const p2 = TestHelpers.createUser({groups: ["testhelpers", "test2", "test3"]});
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.restricted);
    chai.assert.sameMembers(["test2", "test3"], game.groups);
  });

  it("should set an examined game as 'restricted' if creator is group restricted", function(){
    const p1 = TestHelpers.createUser({limit_to_group: true, groups: ["test1", "test2", "test3", "test4"]});
    self.loggedonuser = p1;
    Game.startLocalGame("mi1", p2, 0, "standard", true, 1, 0, "none", 1, 0, "none");
    const game = Game.collection.findOne();
    chai.assert.isTrue(game.restricted);
    chai.assert.sameMembers(["test1", "test2", "test3", "test4"], game.groups);
  });

  it("requires a non-restricted group member to specify restricted or not on a game examine", function(){chai.assert.fail("do me");});
  it("should throw an error if a non-group member tries to start a restricted examined game", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to start a non-restricted examined game", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to start a non-restricted played game", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to start a game with a non-group member", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to observe a non-restricted game", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to accept a non-restricted match", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to accept a non-restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a non group member tries to accept a restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a non group member tries to accept a restricted match", function(){chai.assert.fail("do me");});

  it("should set a seek request 'restricted' if the issuer is restricted", function(){chai.assert.fail("do me");});
  it("should require a non restricted user to specify restricted or not on a seek request", function(){chai.assert.fail("do me");});
  it("should throw an error if a non group member tries to create a restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to create a non-restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to create a non-restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a non-group member tries to accept a restricted seek", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to accept a non-restricted seek", function(){chai.assert.fail("do me");});

  it("should throw an error if a restricted member tries to match a non-member", function(){chai.assert.fail("do me")});
  it("should throw an error if a non-group member tries to match a restricted member", function(){chai.assert.fail("do me")});
  it("should allow a restricted member to match a non-restricted member", function(){chai.assert.fail("do me")});
  it("should allow a non-restricted member to match a restricted member", function(){chai.assert.fail("do me")});
  it("should throw an error if a non-group member tries to accept a match from a non-restricted user", function(){chai.assert.fail("do me");});
  it("should throw an error if a restricted group member tries to accept a match from a non-restricted member", function(){chai.assert.fail("do me");});

  it("should publish all non-restricted games to a non-group member", function(){chai.assert.fail("do me");});
  it("should publish all non-restricted games and group restricted games to a non-restricted group member", function(){chai.assert.fail("do me");});
  it("should publish only group restricted games to a restricted group member", function(){chai.assert.fail("do me");});

  it("should publish all non-restricted matches to a non-group member", function(){chai.assert.fail("do me");});
  it("should publish all non-restricted matches and group restricted matches to a non-restricted group member", function(){chai.assert.fail("do me");});
  it("should publish only group restricted matches to a restricted group member", function(){chai.assert.fail("do me");});

  it("should publish all non-restricted seeks to a non-group member", function(){chai.assert.fail("do me");});
  it("should publish all non-restricted seeks and group restricted matches to a non-restricted group member", function(){chai.assert.fail("do me");});
  it("should publish only group restricted seeks to a restricted group member", function(){chai.assert.fail("do me");});
});
