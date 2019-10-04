import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { Meteor } from "meteor/meteor";
import { resetDatabase } from "meteor/xolvio:cleaner";
import chai from "chai";

import "../../../server/Game";

function createLocalGame(whiteuser, blackuser, status) {}
function createLegacyGame(whiteuser, blackuser, status) {}

//
// Collections:
//   Games being played by you
//   Games being observed
//   Games being examined
//   TODO: Games in your library - probably not a collection, but a meteor method response
//   TODO: Games in your history
//   TODO: All games being played, observed, or examained - Maybe do this, then find just ours
//  "game.match"(name,/*legacy,*/time,increment,time2,increment2,rated,wild,color)
//    All games:
//       Time must be > 0
//       Time2 must be null or > 0
//       Inc must be >= 0
//       Inc2 must be null or >= 0
//       rated must be true or false
//       wild must be 0 TODO: Do the others
//       color must be null, "white", or "black"
//    Normal game:
//        Both players have to be logged on
//        Both players have to be able to play rated if rated (re roles)
//        Both players have to be able to play unrated if unrated (re roles)
//        Both players have to be able to play "normal" games (re roles)
//        TODO: Neither player can be censoring the other
//    Legacy game :
//        TODO: We have to figure out AFTER the game starts if we are white or black!
//        TODO: I think match requests need to be in some type of "game_requests" collection
//    Correspondence game:
//    Tournament game:
//
//   "game.accept"(them_id)
//   "game.decline"(game_id, type)
//   "game.draw"(game_id, actionType)
//   "game.adjourn"(name)
//   "game.abort"(game_id, actionType)
//   "game.resign"(game_id, actionType)
//   "game.pending"()
//   "game.resume"()
//   "game.move"(game_id, move)
//   "game.takeback"(game_id, actionType)

//function logoutUser(username) {
//  Meteor.users.update({ username: username }, { $set: { loggedOn: false } });
//}

describe("Games", function() {
  beforeEach(function(done) {
    resetDatabase(done);
  });

  it("is a test", function() {
    Meteor.call(
      "game.match",
      "name",
      /*      "legacy", */
      "time",
      "inc",
      "t2",
      "i2",
      "rated",
      "wild",
      "color"
    );
    chai.assert.isEqual(0, 1);
  });
});
