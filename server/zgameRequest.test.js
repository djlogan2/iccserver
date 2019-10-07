import StubCollections from "meteor/hwillson:stub-collections";
import { Meteor } from "meteor/meteor";
import chai from "chai";

import { GameRequestCollection, addLegacyGameRequest } from "./GameRequest";

//
// Collections:
//   TODO: Games being played by you
//   TODO: Games being observed
//   TODO: Games being examined
//   TODO: Games in your library
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

describe("Match request from legacy", function() {
  beforeEach(function() {
    StubCollections.stub(Meteor.users);
    StubCollections.stub(GameRequestCollection);
    //StubCollections.stub();
    Meteor.users.insert({
      _id: "loggedon1",
      username: "loggedon11",
      loggedOn: true,
      profile: {
        legacy: {
          username: "loggedon"
        }
      }
    });
    Meteor.users.insert({
      _id: "loggedoff1",
      username: "loggedoff11",
      loggedOn: false,
      profile: {
        legacy: {
          username: "loggedoff"
        }
      }
    });
  });

  afterEach(function() {
    Meteor.users.remove({});
    GameRequestCollection.remove({});
    StubCollections.restore();
  });
  //  challenger_name,
  it("should add challenger id if one exists", function() {
    addLegacyGameRequest(
      "loggedon",
      2000,
      true,
      "GM",
      "legacyonly",
      1800,
      true,
      "IM",
      0,
      "Standard",
      true,
      false
    );
    const request = GameRequestCollection.findOne({});
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.challenger_id);
    chai.assert.equal(request.challenger_id, "loggedon1");
  });
  //   challenger_rating,
  //   challenger_established,
  //   challenger_titles,
  //   receiver_name,
  it("should add receiver id if one exists", function() {
    addLegacyGameRequest(
      "loggedonly",
      2000,
      true,
      "GM",
      "loggedon",
      1800,
      true,
      "IM",
      0,
      "Standard",
      true,
      false
    );
    const request = GameRequestCollection.findOne({});
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.receiver_id);
    chai.assert.equal(request.receiver_id, "loggedon1");
  });
  //   receiver_rating,
  //   receiver_established,
  //   receiver_titles,
  //   wild_number,
  //   rating_type,
  //   is_it_rated,
  //   is_it_adjourned,
  //   challenger_time,
  //   challenger_inc,
  //   receiver_time,
  //   receiver_inc,
  //   challenger_color_request, // -1 for neither, 0 for black, 1 for white
  it("should not add challenger color request if it's -1", function() {
    addLegacyGameRequest(
      "loggedon",
      2000,
      true,
      "GM",
      "legacyonly",
      1800,
      true,
      "IM",
      0,
      "Standard",
      true,
      false,
      10,
      5,
      10,
      5,
      -1
    );
    const request = GameRequestCollection.findOne({});
    chai.assert.isDefined(request);
    chai.assert.isUndefined(request.challenger_color_request);
  });
  it("should add challenger color request of black if it's 0", function() {
    addLegacyGameRequest(
      "loggedon",
      2000,
      true,
      "GM",
      "legacyonly",
      1800,
      true,
      "IM",
      0,
      "Standard",
      true,
      false,
      10,
      5,
      10,
      5,
      0
    );
    const request = GameRequestCollection.findOne({});
    chai.assert.isDefined(request);
    chai.assert.isDefined(request.challenger_color_request);
    chai.assert.equals(request.challenger_color_request, "black");
  });
  it("should add challenger color request of white if it's 1", function() {
    addLegacyGameRequest(
      "loggedon",
      2000,
      true,
      "GM",
      "legacyonly",
      1800,
      true,
      "IM",
      0,
      "Standard",
      true,
      false,
      10,
      5,
      10,
      5,
      1
    );
  });
  const request = GameRequestCollection.findOne({});
  chai.assert.isDefined(request);
  chai.assert.isDefined(request.challenger_color_request);
  chai.assert.equals(request.challenger_color_request, "white");
});

describe("match request from local", function() {
  //  challenger_user,
  it("should not allow a match if challenger is not online", function() {
    chai.assert.fail("do me");
  });
  it("should allow a match if challenger is online", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if challenger is null or cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a rated match if challenger is is prevented from playing rated", function() {
    chai.assert.fail("do me");
  });
  it("should not allow an unrated match if challenger is prevented from playing unrated", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if challenger is already playing a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if challenger is already playing a local game", function() {
    chai.assert.fail("do me");
  });
  //   receiver_user,
  it("should not allow a match if receiver is null or cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if receiver is not online", function() {
    chai.assert.fail("do me");
  });
  it("should allow a match if receiver is online", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a rated match if receiver is prevented from playing rated", function() {
    chai.assert.fail("do me");
  });
  it("should not allow an unrated match if receiver is prevented from playing unrated", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if receiver is already playing a legacy game", function() {
    chai.assert.fail("do me");
  });
  it("should not allow a match if receiver is already playing a local game", function() {
    chai.assert.fail("do me");
  });
  //   wild_number,
  it("must currently accept only a wild zero", function() {
    chai.assert.fail("do me");
  });
  //   rating_type,
  it("can have a rating_type of any of the supported types", function() {
    chai.assert.fail("do me");
  });
  it("can not save an unsupported rating_type", function() {
    chai.assert.fail("do me");
  });
  //   is_it_rated,
  it("must handle is_it_rated with 'true', 'false' or anything invalid", function() {
    chai.assert.fail("do me");
  });
  //   is_it_adjourned,
  it("must handle is_it_adjourned with 'true', 'false' or anything invalid", function() {
    chai.assert.fail("do me");
  });
  //   challenger_time,
  it("must handle challenger_time invalid values correctly, and must handle ICC configuration requirements correctly", function() {
    chai.assert.fail("do me");
  });
  //   challenger_inc,
  it("must handle challenger_inc invalid values correctly, and must handle ICC configuration requirements correctly", function() {
    chai.assert.fail("do me");
  });
  //   receiver_time,
  it("must handle receiver_time invalid values correctly, and must handle ICC configuration requirements correctly", function() {
    chai.assert.fail("do me");
  });
  //   receiver_inc,
  it("must handle receiver_inc invalid values correctly, and must handle ICC configuration requirements correctly", function() {
    chai.assert.fail("do me");
  });
  //   challenger_color_request,
  it("must handle challenger_color_request 'black', 'white' and 'null' correctly, an fail on anything else'", function() {
    chai.assert.fail("do me");
  });
  //   assess_loss,
  it("must ensure assess_loss is a number", function() {
    chai.assert.fail("do me");
  });
  //   assess_draw,
  it("must ensure assess_draw is a number", function() {
    chai.assert.fail("do me");
  });
  //   assess_win,
  it("must ensure assess_win is a number", function() {
    chai.assert.fail("do me");
  });
  //   fancy_time_control
  it("must fail with anything in the fancy_time_control field at this time", function() {
    chai.assert.fail("do me");
  });
  it("should delete the match request when a game begins", function() {
    chai.assert.fail("do me");
  });
  it("should delete the match request when the request is declined", function() {
    chai.assert.fail("do me");
  });
});
