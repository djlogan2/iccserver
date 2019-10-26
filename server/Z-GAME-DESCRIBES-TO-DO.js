describe("Game.removeLocalGame", function(){
  it("should fail if self is null", function(){chai.assert.fail("do me")});
  it("should fail if game_id is null", function(){chai.assert.fail("do me")});
  it("should fail if game cannot be found", function(){chai.assert.fail("do me")});
  // I'll consider writing a client message for this, but one would assume the client itself would say "cannot remove a played game"
  it("should fail if game is still being played", function(){chai.assert.fail("do me")});
  it("should succeed if everything else is well, and it should delete the chess.js instance", function(){chai.assert.fail("do me")});
});

describe("Game.removeLegacyGame", function(){
  it("should fail if self is null", function(){chai.assert.fail("do me")});
  it("should fail if legacy game number is null", function(){chai.assert.fail("do me")});
  it("should fail if game cannot be found", function(){chai.assert.fail("do me")});
  it("should succeed if everything else is well", function(){chai.assert.fail("do me")});
});

describe("Game.requestTakeback", function() {
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
  it("fails and writes to client_messages if they are not in the 'request_takebacks' role", function () {
    chai.assert.fail("do me");
  });
  it("fails if number is null", function () {
    chai.assert.fail("do me");
  });
  it("fails if number is not a number", function () {
    chai.assert.fail("do me");
  });
  it("fails if number is less than 1", function () {
    chai.assert.fail("do me");
  });
  it("fails if number is greater than the limit in the ICC configuration", function () {
    chai.assert.fail("do me");
  });
  it("does not push an action if takeback fails", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'takeback' with the halfmove count if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("fails if game record indicates takebacks are not allowed", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.acceptTakeback", function() {
  it("writes a client_message if their opponent has not requested a takeback", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("does not write an action if there is not a valid takeback accept", function () {
    chai.assert.fail("do me");
  });
  it("writes an action if there is a valid takeback accept", function () {
    chai.assert.fail("do me");
  });
  it("moves the chess.js moves back if it's a local game (prove with fen)", function () {
    chai.assert.fail("do me");
  });
  it("calls legacyuser takeback without parameters if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("fails if there is a move by the acceptor in between", function () {
    chai.assert.fail("do me");
  });
  it("fails if there is a move by the requestor in between", function () {
    chai.assert.fail("do me");
  });
  it("succeeds if there if anything else in between (draw requests, kibitzes, anything other than a move.)", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.declineTakeback", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("writes a client_message if their opponent has not requested a takeback", function () {
    chai.assert.fail("do me");
  });
  it("does not write an action if there is not a valid takeback accept", function () {
    chai.assert.fail("do me");
  });
  it("writes an action if there is a valid takeback decline", function () {
    chai.assert.fail("do me");
  });
  it("calls legacyuser 'decline' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.requestDraw", function() {
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
  it("calls legacy user 'draw' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.acceptDraw", function() {
  it("fails if user is not playing a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("works on their move", function () {
    chai.assert.fail("do me");
  });
  it("fails on their opponents move", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'draw' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.declineDraw", function() {
  it("fails if user is not playing a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function () {
    chai.assert.fail("do me");
  });
  it("works on their move", function () {
    chai.assert.fail("do me");
  });
  it("fails on their opponents move", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function () {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function () {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'decline' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.resignLocalGame", function() {
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
  it("calls legacy user 'resign' if it's a legacy game", function () {
    chai.assert.fail("do me");
  });
});

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

describe("Game.moveBackward", function() {
  it("fails if user is not examining a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is being played", function () {
    chai.assert.fail("do me");
  });
  it("works on either whites or blacks move", function () {
    chai.assert.fail("do me");
  });
  it("moves up to the previous variation and continues on", function () {
    chai.assert.fail("do me");
  });
});

describe("Game.moveForward", function() {
  it("fails if user is not examining a game", function () {
    chai.assert.fail("do me");
  });
  it("should error out if the game is being played", function () {
    chai.assert.fail("do me");
  });
  it("works on either whites or blacks move", function () {
    chai.assert.fail("do me");
  });
  it("moves forward if there is no variation", function () {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation starting at the current move and 'variation' is null", function () {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation starting at the current move and 'variation' is invalid", function () {
    chai.assert.fail("do me");
  });
  it("errors out if there is no variation starting at the current move and 'variation' not undefined or zero", function () {
    chai.assert.fail("do me");
  });
  it("errors out if there is no variation starting at the current move and 'variation' not undefined or zero", function () {
    chai.assert.fail("do me");
  });
  it("follows the correct variation when specified", function () {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation at a future move and halfmoves would move past it", function () {
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
describe("Game.addVariation", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.deleteVariation", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.startVariation", function() {
  it("still needs to be written", function () {
    chai.assert.fail("do me");
  });
});
describe("Game.endVariation", function() {
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