import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { GameRequestCollection, GameRequests } from "./GameRequest";
import {
  default_settings,
  user_ratings_object
} from "../imports/collections/users";
import sinon from "sinon";
import chai from "chai";
import { Game, GameCollection } from "./Game";
import { LegacyUser } from "./LegacyUser";
import ClientMessagesCollection from "../imports/collections/ClientMessages";

const player1 = {
  _id: "player1",
  username: "uplayer1",
  loggedOn: true,
  ratings: user_ratings_object,
  settings: default_settings
};
const player2 = {
  _id: "player2",
  loggedOn: true,
  username: "uplayer2",
  ratings: user_ratings_object,
  settings: default_settings
};
const examiner = {
  _id: "examiner1",
  loggedOn: true,
  username: "uexaminer",
  ratings: user_ratings_object,
  settings: default_settings
};
const observer = {
  _id: "observer1",
  loggedOn: true,
  username: "uobserver",
  ratings: user_ratings_object,
  settings: default_settings
};

describe("Match requests and game starts", function() {
  let userIsInRole = true;
  let meteoruser = undefined;

  beforeEach(function() {
    sinon.replace(
      Roles,
      "userIsInRole",
      sinon.fake.returns(function() {
        return userIsInRole;
      })
    );
    sinon.replace(
      Meteor,
      "user",
      sinon.fake.returns(function() {
        return meteoruser;
      })
    );
    sinon.replace(
      LegacyUser,
      "find",
      sinon.fake.returns({ legacy_user_record: true })
    );
  });

  afterEach(function() {
    sinon.restore();
    userIsInRole = false;
    meteoruser = undefined;
    player1.loggedOn = player2.loggedOn = examiner.loggedOn = observer.loggedOn = true;
    player1.settings = default_settings;
    player2.settings = default_settings;
    examiner.settings = default_settings;
    observer.settings = default_settings;
  });

  it("should add a record to game_requests for a local game if autoaccept is false", function() {
    meteoruser = player1;
    player2.settings.autoaccept = false;
    const req1 = sinon.mock(GameRequestCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").twice();
    req2.expects("insert").never();
    GameRequests.addLocalMatchRequest(
      player1,
      player2,
      "0",
      "standard",
      true,
      false,
      5,
      0,
      null,
      null,
      null,
      16,
      16,
      16,
      null
    );
    GameRequests.addLocalMatchRequest(
      player1,
      player2,
      0,
      "standard",
      true,
      false,
      5,
      0,
      null,
      null,
      null,
      16,
      16,
      16,
      null
    );
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should delete the game_request and add a game record on a manual accept of a local game request", function() {
    meteoruser = player1;
    const req1 = sinon.mock(GameRequestCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("find").once();
    req1.expects("remove").once();
    req2.expects("insert").once();
    GameRequests.acceptMatchRequest("id");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should delete the game_request and add a record to client_messages on a decline of a local game request", function() {
    meteoruser = player1;
    const req1 = sinon.mock(GameRequestCollection);
    const req2 = sinon.mock(ClientMessagesCollection);
    req1.expects("find").once();
    req1.expects("remove").once();
    req2.expects("insert").once();
    GameRequests.acceptMatchRequest("id");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should skip game_requests and create a game on a match of a local game request with auto accept of true", function() {
    meteoruser = player1;
    const req1 = sinon.mock(GameRequestCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("find").never();
    req1.expects("insert").never();
    req1.expects("remove").never();
    req2.expects("insert").once();
    GameRequests.acceptMatchRequest("id");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should create a chess js game for a local played game", function() {
    meteoruser = player1;
    const req1 = sinon.mock(ClientMessagesCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").once();
    req2.expects("insert").once();
    req2.expects("update").never();
    const id = Game.startLocalGame(
      player1,
      player1,
      player2,
      0,
      "standard",
      true,
      5,
      0,
      5,
      0,
      true
    );
    Game.makeMove(player1, id, "e5");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should create a chess js game for a local examined game", function() {
    meteoruser = player1;
    const req1 = sinon.mock(ClientMessagesCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").once();
    req2.expects("insert").once();
    req2.expects("update").never();
    const id = Game.startLocalGame(
      player1,
      player1,
      player2,
      0,
      "standard",
      true,
      5,
      0,
      5,
      0,
      false
    );
    Game.makeMove(player1, id, "e5");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should NOT create a chess js game for a legacy played game", function() {
    meteoruser = player1;
    const req1 = sinon.mock(ClientMessagesCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").never();
    req2.expects("insert").once();
    req2.expects("update").never();
    const id = Game.startLegacyGame(
      player1,
      123,
      "iccplayer1",
      "iccplayer2",
      0,
      "Standard",
      true,
      5,
      0,
      5,
      0,
      true,
      "",
      1200,
      2300,
      99887766
    );
    Game.makeMove(player1, id, "e5");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });

  it("should NOT create a chess js game for a legacy examined game", function() {
    meteoruser = player1;
    const req1 = sinon.mock(ClientMessagesCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").never();
    req2.expects("insert").once();
    req2.expects("update").never();
    const id = Game.startLegacyGame(
      player1,
      123,
      "iccplayer1",
      "iccplayer2",
      0,
      "Standard",
      true,
      5,
      0,
      5,
      0,
      false,
      "",
      1200,
      2300,
      99887766
    );
    Game.makeMove(player1, id, "e5");
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });
  it("should use the same chess js game (or a copy) when a locally played game switches to an examined game", function() {
    chai.assert.fail("do me");
  });
});

// Game.startLocalGame = function(
describe("Game.startLocalGame", function() {
  let userIsInRole = true;
  let meteoruser = undefined;

  beforeEach(function() {
    sinon.replace(
      Roles,
      "userIsInRole",
      sinon.fake.returns(function() {
        return userIsInRole;
      })
    );
    sinon.replace(
      Meteor,
      "user",
      sinon.fake.returns(function() {
        return meteoruser;
      })
    );
    sinon.replace(
      LegacyUser,
      "find",
      sinon.fake.returns({ legacy_user_record: true })
    );
  });

  afterEach(function() {
    sinon.restore();
    userIsInRole = false;
    meteoruser = undefined;
    player1.loggedOn = player2.loggedOn = examiner.loggedOn = observer.loggedOn = true;
    player1.settings = default_settings;
    player2.settings = default_settings;
    examiner.settings = default_settings;
    observer.settings = default_settings;
  });

  it("should error out if the user isn't logged on", function() {
    player1.loggedOn = false;
    meteoruser = player1;
    const req1 = sinon.mock(GameRequestCollection);
    const req2 = sinon.mock(GameCollection);
    req1.expects("insert").never();
    req2.expects("insert").never();
    GameRequestCollection.addLocalMatchRequest(
      player1,
      player2,
      "0",
      "standard",
      true,
      false,
      5,
      0,
      null,
      null,
      null,
      16,
      16,
      16,
      null
    );
    req1.verify();
    req2.verify();
    req1.restore();
    req2.restore();
  });
  // I'm not sure what I was thinking here. If I, or anyone else, figures it out, put it back. Else, delete it :)
  // it("should error out if the game is examined", function() {
  //   chai.assert.fail("do me");
  // });
  it("should error out if the user is starting a rated game and cannot play rated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting an unrated game and cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting a rated game and thier opponent cannot play rated games", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the user is starting an unrated game and their opponent cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  //  self,
  it("should error out if self is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out user is neither white nor black", function() {
    chai.assert.fail("do me");
  }); // TODO: This will be relaxed later on if the user is in a role that allows starting of other users games!
  //   white,
  it("should error out if white is null", function() {
    chai.assert.fail("do me");
  });
  //   black,
  it("should error out if black is null", function() {
    chai.assert.fail("do me");
  });
  //   wild_number,
  it("should error out if wild is not zero", function() {
    chai.assert.fail("do me");
  });
  //   rating_type,
  it("should error out if rating_type is not in the ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   rated,
  it("should error out if rated is not 'true' or 'false', and of course both of those work", function() {
    chai.assert.fail("do me");
  });
  //   white_initial,
  it("should error out if white_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   white_increment,
  it("should error out if white_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if white_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   black_initial,
  it("should use white_initial if black_initial is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_initial fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   black_increment,
  it("should use white_increment if black_increment is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment is not a number", function() {
    chai.assert.fail("do me");
  });
  it("should error out if black_increment fails to meet the rules in ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   played_game /*,
  it("should error out if played_game is not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  });
  it("should add an examined game to the database if played_game is false", function() {
    chai.assert.fail("do me");
  });
  it("should add a playing game to the database if played_game is true", function() {
    chai.assert.fail("do me");
  });
});
// Game.startLegacyGame = function(
describe("Game.startLegacyGame", function() {
  it("should error out if the user isn't logged on", function() {
    chai.assert.fail("do me");
  });
  //  self,
  it("should error out if self is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out user is neither white nor black", function() {
    chai.assert.fail("do me");
  }); // TODO: This will be relaxed later on if the user is in a role that allows starting of other users games!
});
// Game.saveLegacyMove = function(self, game_id, move) {};
describe("Game.saveLegacyMove", function() {
  it("should error out if self is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if we don't have a game record", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds", function() {
    chai.assert.fail("do me");
  });
});
// Game.makeMove = function(self, game_id, move) {
describe("Game.makeMove", function() {
  it("should error out if self is null", function() {
    chai.assert.fail("do me");
  });
  it("should error out if a game cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should error out if an active game cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should write a client_message and not save the move to the dataabase if the move is illegal", function() {
    chai.assert.fail("do me");
  });
  it("should save the move to the dataabase if the move is legal", function() {
    chai.assert.fail("do me");
  });
  it("should end the game if the move results in a stalemate", function() {
    chai.assert.fail("do me");
  });
  it("should end the game if the move results in a checkmate", function() {
    chai.assert.fail("do me");
  });
  it("should end the game if the move results in an insufficient material draw", function() {
    chai.assert.fail("do me");
  });
  it("should not end the game if the move results in a draw by repetition situation", function() {
    chai.assert.fail("do me");
  });
  it("calls the move method of legacy user if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("does not check move validity if it's a legacy game (it lets the server do that.)", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("does not push an action when it succeeds as a legacy game (an incoming L2 will save this move)", function() {
    chai.assert.fail("do me");
  });
});
// Game.requestTakeback = function(self, game_id, number) {
describe("Game.requestTakeback", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("fails and writes to client_messages if they are not in the 'request_takebacks' role", function() {
    chai.assert.fail("do me");
  });
  it("fails if number is null", function() {
    chai.assert.fail("do me");
  });
  it("fails if number is not a number", function() {
    chai.assert.fail("do me");
  });
  it("fails if number is less than 1", function() {
    chai.assert.fail("do me");
  });
  it("fails if number is greater than the limit in the ICC configuration", function() {
    chai.assert.fail("do me");
  });
  it("does not push an action if takeback fails", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'takeback' with the halfmove count if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("fails if game record indicates takebacks are not allowed", function() {
    chai.assert.fail("do me");
  });
});
// Game.acceptTakeback = function(self, game_id) {
describe("Game.acceptTakeback", function() {
  it("writes a client_message if their opponent has not requested a takeback", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("does not write an action if there is not a valid takeback accept", function() {
    chai.assert.fail("do me");
  });
  it("writes an action if there is a valid takeback accept", function() {
    chai.assert.fail("do me");
  });
  it("moves the chess.js moves back if it's a local game (prove with fen)", function() {
    chai.assert.fail("do me");
  });
  it("calls legacyuser takeback without parameters if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("fails if there is a move by the acceptor in between", function() {
    chai.assert.fail("do me");
  });
  it("fails if there is a move by the requestor in between", function() {
    chai.assert.fail("do me");
  });
  it("succeeds if there if anything else in between (draw requests, kibitzes, anything other than a move.)", function() {
    chai.assert.fail("do me");
  });
});
// Game.declineTakeback = function(self, game_id) {
describe("Game.declineTakeback", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("writes a client_message if their opponent has not requested a takeback", function() {
    chai.assert.fail("do me");
  });
  it("does not write an action if there is not a valid takeback accept", function() {
    chai.assert.fail("do me");
  });
  it("writes an action if there is a valid takeback decline", function() {
    chai.assert.fail("do me");
  });
  it("calls legacyuser 'decline' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.requestDraw = function(self, game_id) {
describe("Game.requestDraw", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'draw' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.acceptDraw = function(self, game_id) {
describe("Game.acceptDraw", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("fails on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'draw' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.declineDraw = function(self, game_id) {
describe("Game.declineDraw", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("fails on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'decline' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.resignGame = function(self, game_id) {
describe("Game.resignGame", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'resign' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.requestMoretime = function(self, game_id, seconds) {};
describe("Game.offerMoreTime", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("calls legacy user 'moretime' if it's a legacy game", function() {
    chai.assert.fail("do me");
  });
});
// Game.declineMoretime = function(self, game_id) {};
describe("Game.declineMoreTime", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
});
// Game.acceptMoretime = function(self, game_id) {};
describe("Game.acceptMoretime", function() {
  it("fails if user is not playing a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is examined", function() {
    chai.assert.fail("do me");
  });
  it("works on their move", function() {
    chai.assert.fail("do me");
  });
  it("works on their opponents move", function() {
    chai.assert.fail("do me");
  });
  it("pushes an action when it succeeds as a local game", function() {
    chai.assert.fail("do me");
  });
});
// Game.moveBackward = function(self, game_id, halfmoves) {};
describe("Game.moveBackward", function() {
  it("fails if user is not examining a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is being played", function() {
    chai.assert.fail("do me");
  });
  it("works on either whites or blacks move", function() {
    chai.assert.fail("do me");
  });
  it("moves up to the previous variation and continues on", function() {
    chai.assert.fail("do me");
  });
});
// Game.moveForward = function(self, game_id, halfmoves) {};
describe("Game.moveForward", function() {
  it("fails if user is not examining a game", function() {
    chai.assert.fail("do me");
  });
  it("should error out if the game is being played", function() {
    chai.assert.fail("do me");
  });
  it("works on either whites or blacks move", function() {
    chai.assert.fail("do me");
  });
  it("moves forward if there is no variation", function() {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation starting at the current move and 'variation' is null", function() {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation starting at the current move and 'variation' is invalid", function() {
    chai.assert.fail("do me");
  });
  it("errors out if there is no variation starting at the current move and 'variation' not undefined or zero", function() {
    chai.assert.fail("do me");
  });
  it("errors out if there is no variation starting at the current move and 'variation' not undefined or zero", function() {
    chai.assert.fail("do me");
  });
  it("follows the correct variation when specified", function() {
    chai.assert.fail("do me");
  });
  it("errors out if there is a variation at a future move and halfmoves would move past it", function() {
    chai.assert.fail("do me");
  });
});
// Game.updateClock = function(self, game_id, color, milliseconds) {};
describe("Game.updateClock", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
  it("errors if milliseconds is null, not a number, or negative", function() {
    chai.assert.fail("do me");
  });
  it("requires color to exist and be 'white' or 'black'", function() {
    chai.assert.fail("do me");
  });
  it("requires game_id to exist and be a valid game record", function() {
    chai.assert.fail("do me");
  });
  it("errors out if the game is not being played", function() {
    chai.assert.fail("do me");
  });
  it("updates the white clock when color is white", function() {
    chai.assert.fail("do me");
  });
  it("updates the black clock when color is black", function() {
    chai.assert.fail("do me");
  });
});
//function getLegacyUser(userId) {
describe("getLegacyUser", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// function getAndCheck(self, game_id, must_be_my_turn) {
describe("getAndCheck", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.addVariation = function(self, game_id, issuer) {};
describe("Game.addVariation", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.deleteVariation = function(self, game_id, issuer) {};
describe("Game.deleteVariation", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
describe("Game.startVariation", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
describe("Game.endVariation", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.drawCircle = function(self, game_id, issuer, square) {};
describe("Game.drawCircle", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.removeCircle = function(self, game_id, issuer, square) {};
describe("Game.removeCircle", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.drawArrow = function(self, game_id, issuer, square) {};
describe("Game.drawArrow", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.removeArrow = function(self, game_id, issuer, square) {};
describe("Game.removeArrow", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
// Game.changeHeaders = function(self, game_id, other_arguments) {};
describe("Game.changeHeaders", function() {
  it("still needs to be written", function() {
    chai.assert.fail("do me");
  });
});
