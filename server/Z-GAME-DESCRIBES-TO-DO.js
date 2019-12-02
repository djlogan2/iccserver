
describe("Game.offerMoreTime", function() {
  it("fails if user is not playing a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("works on their move", function () {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'moretime' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.declineMoreTime", function() {
  it("fails if user is not playing a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("works on their move", function () {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
});

describe("Game.acceptMoretime", function() {
  it("fails if user is not playing a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("works on their move", function () {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
});

describe("Game.updateClock", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
  it("errors if milliseconds is null, not a number, or negative", function () {
    chai.assert.fail("do me");
  });
  it("requires color to exist and be 'white' or 'black'", function () {
    chai.assert.fail("do me");
  });
  it("requires game_id to exist and be a valid game record", function () {
    chai.assert.fail("do me");
  });
  it("errors out if the game is not being played", function () {
    chai.assert.fail("do me");
  });
  it("updates the white clock when color is white", function () {
    chai.assert.fail("do me");
  });
  it("updates the black clock when color is black", function () {
    chai.assert.fail("do me");
  });
});

describe("getLegacyUser", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("getAndCheck", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.drawCircle", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.removeCircle", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.drawArrow", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.removeArrow", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.changeHeaders", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});

describe("Game ends from legacy we need to replicate in local", function(){
  it("needs to be defined using the doc below as reference", function(){chai.assert.fail("do me")});
  //		mode 0:  (Res) Black resigns
  // 		mode 1:  (Mat) Black checkmated
  // 		mode 2:  (Fla) Black forfeits on time.
  // 		mode 3:  (Adj) White declared the winner by adjudication
  // 		mode 4:  (BQ)  Black disconnected and forfeits
  // 		mode 5:  (BQ)  Black got disconnected and forfeits
  // 		mode 6:  (BQ)  Unregistered player Black disconnected and forfeits
  // 		mode 7:  (Res) Black's partner resigns
  // 		mode 8:  (Mat) Black's partner checkmated
  // 		mode 9:  (Fla) Black's partner forfeits on time
  // 		mode 10: (BQ)  Black's partner disconnected and forfeits
  // 		mode 11: (BQ)  Black disconnected and forfeits [obsolete?]
  // 		mode 12: (1-0) White wins [specific reason unknown]
  // 	status 1:
  // 		mode 0:  (Agr) Game drawn by mutual agreement
  // 		mode 1:  (Sta) Black stalemated
  // 		mode 2:  (Rep) Game drawn by repetition
  // 		mode 3:  (50)  Game drawn by the 50 move rule
  // 		mode 4:  (TM)  Black ran out of time and White has no material to mate
  // 		mode 5:  (NM)  Game drawn because neither player has mating material
  // 		mode 6:  (NT)  Game drawn because both players ran out of time
  // 		mode 7:  (Adj) Game drawn by adjudication
  // 		mode 8:  (Agr) Partner's game drawn by mutual agreement
  // 		mode 9:  (NT)  Partner's game drawn because both players ran out of time
  // 		mode 10: (1/2) Game drawn [specific reason unknown]
  // 	status 2:
  // 		mode 0:  (?)   Game adjourned by mutual agreement
  // 		mode 1:  (?)   Game adjourned when Black disconnected
  // 		mode 2:  (?)   Game adjourned by system shutdown
  // 		mode 3:  (?)   Game courtesyadjourned by Black
  // 		mode 4:  (?)   Game adjourned by an administrator
  // 		mode 5:  (?)   Game adjourned when Black got disconnected
  // 	status 3:
  // 		mode 0:  (Agr) Game aborted by mutual agreement
  // 		mode 1:  (BQ)  Game aborted when Black disconnected
  // 		mode 2:  (SD)  Game aborted by system shutdown
  // 		mode 3:  (BA)  Game courtesyaborted by Black
  // 		mode 4:  (Adj) Game aborted by an administrator
  // 		mode 5:  (Sho) Game aborted because it's too short to adjourn
  // 		mode 6:  (BQ)  Game aborted when Black's partner disconnected
  // 		mode 7:  (Sho) Game aborted by Black at move 1
  // 		mode 8:  (Sho) Game aborted by Black's partner at move 1
  // 		mode 9:  (Sho) Game aborted because it's too short
  // 		mode 10: (Adj) Game aborted because Black's account expired
  // 		mode 11: (BQ)  Game aborted when Black got disconnected
  // 		mode 12: (?)   No result [specific reason unknown]
});

describe("When a played game ends", function(){
  it("should convert one, the other, or both users to examiners of the game, and convert the game to examined, if their 'examine after play' setting is true", function(){chai.assert.fail("do me")});
  it("should delete the game if neither player has their examine flag set", function(){chai.assert.fail("do me")});
  it("should allow any examiner to make moves in an examined game", function(){chai.assert.fail("do me")});
  it("should not allow adding of an examiner to a game being played", function(){chai.assert.fail("do me")});
  it("should allow adding of an examiner to a game being examined", function(){chai.assert.fail("do me")});
  it("should only add an examiner once. Second plus should just report they are already examiners", function(){chai.assert.fail("do me")});
  it("should not delete the game record when examiners leave if they are not the last examiner", function(){chai.assert.fail("do me")});
  it("should delete the game record when the last examiner leaves", function(){chai.assert.fail("do me")});
});
