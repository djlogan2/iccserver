describe("roles", function(){
  it("should be able to create a tournament if user is in 'manage_tournaments' role", function(){chai.assert.fail("do me")});
  it("should not be able to create a tournament if user is not in 'manage_tournaments' role", function(){chai.assert.fail("do me")});
  //
  // The way this works is that users are "scoped" with the directories they can alter:
  // A user in the global role can see, change, and save anyone elses template or manage any online tournament
  // Otherwise, the role is saved with a scope, like so: addUserToRole(user, 'manage_tournaments', 'a.b')
  //    When tournaments are saved, they are saved with what looks like a directory structure to the user, like /a/b/mytournament
  //    The user can create "directories" in a.b, as in "/a/b/c/mytournament" with a scope of a.b
  //    Thus, any user with a scope of "a" can also manage tournaments in "a.b" or any other "a.*" or even just "a"
  //    But the user in the "a.b" scope can only manage tournaments in "a.b" or below ("a.b.*")
  //
  it("should not be able to save a tournament to a 'directory' if 'manage_tournaments' role is in the directory scope", function(){chai.assert.fail("do me")});
  it("should not be able to save a tournament to a 'directory' if 'manage_tournaments' role is not in the directory scope", function(){chai.assert.fail("do me")});
  it("should not be able to save a tournament to a 'directory' if 'manage_tournaments' role is in the lower directory scope", function(){chai.assert.fail("do me")});
  it("should not be able to save a tournament to a 'directory' if 'manage_tournaments' role is not in a higher directory scope", function(){chai.assert.fail("do me")});
  it("should able to save a tournament to any directory if user is in the global 'manage_tournaments' role", function(){chai.assert.fail("do me")});
});

describe("ICC tournament manager", function(){
  // rounds, pairing, timecontrol, joinrule, minplayers, maxplayers, minrating, maxrating
  it("should be able to create tournament template", function(){});
  it("should be able to change rounds", function(){});
  it("should be able to change pairing", function(){});
  it("should be able to change time control", function(){});
  it("should be able to change save the template", function(){});
  it("should be able to change the joining timeframe (set it to 'after open')", function(){});
  it("should be able to change the minimum number of players", function(){});
  it("should be able to change the maximum number of players", function(){});
  it("should be able to change the minimum rating", function(){});
  it("should be able to change the maximum rating", function(){});
  it("should be able to change save the template", function(){});
  it("should be able to change the template name", function(){});
  it("should be able to change the template 'directory'", function(){});
  it("should be able to open the tournament", function(){});
});
