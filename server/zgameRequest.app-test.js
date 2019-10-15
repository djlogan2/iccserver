import chai from "chai";

import "./GameRequest";
import { GameRequests } from "./GameRequest";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { LegacyUser } from "./LegacyUser";
import { Roles } from "meteor/alanning:roles";
import {
  default_settings,
  user_ratings_object
} from "../imports/collections/users";

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

//GameRequests.addLegacyGameSeek = function(
describe("GameRequests.addLegacyGameSeek", function() {
  //  index,
  it("should fail if we try to add the same index twice", function() {
    chai.assert.fail("do me");
  });
  //   name,
  //   titles,
  //   rating,
  //   provisional_status,
  //   wild,
  //   rating_type,
  //   time,
  //   inc,
  //   rated,
  //   color,
  //   minrating,
  //   maxrating,
  //   autoaccept,
  //   formula,
  //   fancy_time_control
});

// GameRequests.addLocalGameSeek = function() {};
describe("GameRequests.addLocalGameSeek", function() {
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
    sinon.replace(Meteor, "user", sinon.fake.returns(meteoruser));
    sinon.replace(
      LegacyUser,
      "find",
      sinon.fake.returns({ legacy_user_record: true })
    );
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake.returns(true)
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

  //  self,
  it("should fail if self is null or invalid", function() {
    meteoruser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        null,
        0,
        "standard",
        5,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   wild,
  it("should fail if wild is not zero", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        1,
        "standard",
        5,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   rating_type,
  it("should fail if rating_type is not a valid rating type for ICC", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "bogus",
        5,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   time,
  it("should fail if time is null or not a number or not within ICC configuration requirements", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        null,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Match.Error);
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        "five",
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Match.Error);
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake.returns(false)
    );
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        "five",
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   inc,
  it("should fail if inc is null or not a number or not within ICC configuration requirements", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        5,
        null,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        5,
        "five",
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake.returns(false)
    );
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        5,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   rated,
  it("should fail if rated is not 'true' or 'false'", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        0,
        "standard",
        5,
        0,
        "something",
        null,
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  it("should write a message to client_messages if rated and user cannot play rated games", function() {
    chai.assert.fail("do me");
  });
  it("should write a message to client_messages if unrated and user cannot play unrated games", function() {
    chai.assert.fail("do me");
  });
  //   color,
  it("should fail if is not null, 'black' or 'white'", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        null,
        0,
        "standard",
        5,
        0,
        true,
        "something",
        null,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   minrating,
  it("should fail if minrating is not null, a number, less than 1, or not within ICC configuration requirements", function() {
    chai.assert.fail("do me");
  });
  //   maxrating,
  it("should fail if maxrating is not null, a number, less than 1, or not within ICC configuration requirements", function() {
    chai.assert.fail("do me");
  });
  //   autoaccept,
  it("should fail if autoaccept not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  });
  //   formula,
  it("should fail if formula is specified (until we write the code)", function() {
    chai.assert.fail("do me");
  });
  it("should should add a record to the database if all is well and good", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.removeLegacySeek = function(self, index)
describe("GameRequests.removeLegacySeek", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should succeed if we try to remove a non-existant index", function() {
    chai.assert.fail("do me");
  });
  it("should remove a previously added record by legacy index", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the seek record does not belong to the user", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the seek record is not a legacy seek", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.removeGameSeek = function(self, seek_id) {};
describe("GameRequests.removeGameSeek", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if seek record cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should fail if seek record does not belong to the user", function() {
    chai.assert.fail("do me");
  });
  it("should delete the seek if all is well", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the seek record is not a local seek", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.acceptGameSeek = function(self, seek_id) {};
describe("GameRequests.acceptGameSeek", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if seek record cannot be found", function() {
    chai.assert.fail("do me");
  });
  it("should fail if seek record does belong to the user", function() {
    chai.assert.fail("do me");
  });
  it("should delete the seek and insert a new game if all is well", function() {
    chai.assert.fail("do me");
  });
  it("should fail if the seek record is not a local seek", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.addLegacyMatchRequest = function(
describe("GameRequests.addLegacyMatchRequest", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is neither challenger nor receiver", function() {
    chai.assert.fail("do me");
  });
  it("should add challenger_id if self is challenger", function() {
    chai.assert.fail("do me");
  });
  it("should add receiver_id if self is receiver", function() {
    chai.assert.fail("do me");
  });
  //  challenger_name,
  //   challenger_rating,
  //   challenger_established,
  //   challenger_titles,
  //   receiver_name,
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
  it("should not set color if challenger_color_request is -1", function() {
    chai.assert.fail("do me");
  });
  it("should set color to 'black' if challenger_color_request is 0", function() {
    chai.assert.fail("do me");
  });
  it("should set color to 'white' if challenger_color_request is 1", function() {
    chai.assert.fail("do me");
  });
  //   assess_loss /*,
});

// GameRequests.addLocalMatchRequest = function(
describe("GameRequests.addLocalMatchRequest", function() {
  //  self,
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is neither challenger nor receiver", function() {
    chai.assert.fail("do me");
  });
  //  challenger_user,
  it("should fail if challenger_user is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if challenger_user is the same as receiver_user", function() {
    chai.assert.fail("do me");
  });
  //   receiver_user,
  it("should fail if receiver_user is null or invalid", function() {
    chai.assert.fail("do me");
  });
  //   wild_number,
  it("should fail if wild is not zero", function() {
    chai.assert.fail("do me");
  });
  //   rating_type,
  it("should fail if rating_type is not a valid rating type", function() {
    chai.assert.fail("do me");
  });
  //   is_it_rated,
  it("should fail if is_it_rated is not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  });
  //   is_it_adjourned,
  it("should fail if is_it_adjourned is not 'true' or 'false'", function() {
    chai.assert.fail("do me");
  }); // TODO: Where are we keeping adjourned games? We should connect this
  //   challenger_time,
  it("should fail if challenger_time is null, not a number, < 0, or not within ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   challenger_inc,
  it("should fail if challenger_inc is null, not a number, < 0, or not within ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   receiver_time,
  it("should fail if receiver_time is null, not a number, < 0, or not within ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   receiver_inc,
  it("should fail if receiver_inc is null, not a number, < 0, or not within ICC configuration", function() {
    chai.assert.fail("do me");
  });
  //   challenger_color_request,
  it("should fail if challenger_color_request is null, 'white' or 'black'", function() {
    chai.assert.fail("do me");
  });
  //   assess_loss,
  it("should fail if assess_loss is null, not an number, < 0, or loss + win > 32", function() {
    chai.assert.fail("do me");
  });
  //   assess_draw,
  it("should fail if assess_draw is null, not an number, < 0, or > 32", function() {
    chai.assert.fail("do me");
  });
  //   assess_win,
  it("should fail if assess_win is null, not an number, < 0", function() {
    chai.assert.fail("do me");
  });
  //   fancy_time_control
  it("should fail if fancy_time_control is not null", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.acceptMatchRequest = function(game_id) {};
describe("GameRequests.acceptMatchRequest", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is the challenger", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is not the receiver", function() {
    chai.assert.fail("do me");
  });
  it("should fail if game_id is null or there isn't a valid record", function() {
    chai.assert.fail("do me");
  });
  it("should fail if request record is a legacy request", function() {
    chai.assert.fail("do me");
  });
  it("should delete this record and insert a recod into the game collection upon a successful request", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.declineMatchRequest = function(game_id) {};
describe("GameRequests.declineMatchRequest", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is not the challenger", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is the receiver", function() {
    chai.assert.fail("do me");
  });
  it("should fail if game_id is null or there isn't a valid record", function() {
    chai.assert.fail("do me");
  });
  it("should fail if request record is a legacy request", function() {
    chai.assert.fail("do me");
  });
  it("should delete this record upon a successful request", function() {
    chai.assert.fail("do me");
  });
});

// GameRequests.removeLegacyMatchRequest = function(
describe("GameRequests.removeLegacyMatchRequest", function() {
  it("should fail if self is null or invalid", function() {
    chai.assert.fail("do me");
  });
  it("should fail if self is not the owner", function() {
    chai.assert.fail("do me");
  });
  it("should fail if game_id is null or there isn't a valid record", function() {
    chai.assert.fail("do me");
  });
  it("should fail if request record is a not legacy request", function() {
    chai.assert.fail("do me");
  });
  it("should delete this record upon a successful request", function() {
    chai.assert.fail("do me");
  });
});

describe("game_requests publication", function() {
  it("only return records for which the owner is a challenger or receiver of a seek or match", function() {
    chai.assert.fail("do me");
  });
});
