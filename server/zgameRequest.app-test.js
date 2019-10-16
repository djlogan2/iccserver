import chai from "chai";

import "./GameRequest";
import { GameRequests } from "./GameRequest";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ClientMessages } from "../imports/collections/ClientMessages";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { LegacyUser } from "./LegacyUser";
import { Roles } from "meteor/alanning:roles";
import {
  default_settings,
  user_ratings_object
} from "../imports/collections/users";
import { GameCollection } from "./Game";

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

let meteoruser = player1;

//GameRequests.addLegacyGameSeek = function(
describe("GameRequests.addLegacyGameSeek", function() {
  const stubvalues = {
    userIsInRole: true,
    meetsTimeAndIncRules: true,
    meetsMinimumAndMaximumRatingRules: true
  };

  beforeEach(function() {
    stubvalues.userIsInRole = true;
    stubvalues.meetsTimeAndIncRules = true;
    stubvalues.meetsMinimumAndMaximumRatingRules = true;
    sinon.replace(
      GameRequests.collection,
      "findOne",
      sinon.fake.returns(function(selector) {
        if (selector._id === 999) return { _id: "haveit" };
        else return null;
      })
    );
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(function() {
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
  });

  //  index,
  it("should fail if we try to add the same index twice", function() {
    chai.assert.throws(() => {
      GameRequests.addLegacyGameSeek(
        999,
        "player1",
        "C GM",
        2340,
        false,
        0,
        "Standard",
        15,
        0,
        true,
        "w",
        0,
        3000,
        true,
        ""
      );
    }, Meteor.Error);
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
  const stubvalues = {
    userIsInRole: true,
    meetsTimeAndIncRules: true,
    meetsMinimumAndMaximumRatingRules: true
  };

  beforeEach(function() {
    stubvalues.userIsInRole = true;
    stubvalues.meetsTimeAndIncRules = true;
    stubvalues.meetsMinimumAndMaximumRatingRules = true;
    sinon.replace(
      Roles,
      "userIsInRole",
      sinon.fake(function() {
        return stubvalues.userIsInRole;
      })
    );
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(function() {
        return meteoruser;
      })
    );
    sinon.replace(
      Meteor.users,
      "findOne",
      sinon.fake(function() {
        return meteoruser;
      })
    );
    sinon.replace(
      LegacyUser,
      "find",
      sinon.fake.returns({ legacy_user_record: true })
    );
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake(function() {
        return stubvalues.meetsTimeAndIncRules;
      })
    );
    sinon.replace(
      SystemConfiguration,
      "meetsMinimumAndMaximumRatingRules",
      sinon.fake(function() {
        return stubvalues.meetsMinimumAndMaximumRatingRules;
      })
    );
  });

  afterEach(function() {
    sinon.restore();
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
        "test_identifier",
        0,
        "standard",
        15,
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
  it("should fail if wild is invalid (currently anything other than zero)", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        1,
        "standard",
        15,
        0,
        true,
        null,
        null,
        null,
        true
      );
    }, Match.Error);
  });
  //   rating_type,
  it("should fail if rating_type is not a valid rating type for ICC", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
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
        "test_identifier",
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
        "test_identifier",
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
    stubvalues.meetsTimeAndIncRules = false;
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
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
  });
  //   inc,
  it("should fail if inc is null or not a number or not within ICC configuration requirements", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        null,
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
        "test_identifier",
        0,
        "standard",
        15,
        "five",
        true,
        null,
        null,
        null,
        true
      );
    }, Match.Error);
  });
  //   rated,
  it("should fail if rated is not 'true' or 'false'", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        "something",
        null,
        null,
        null,
        true
      );
    }, Match.Error);
  });
  it("should write a message to client_messages if rated and user cannot play rated games", function() {
    const cm = sinon.mock(ClientMessages);

    cm.expects("sendMessageToClient")
      .once()
      .withExactArgs(player1, "test_identifier", "UNABLE_TO_PLAY_RATED_GAMES");

    meteoruser = player1;
    stubvalues.userIsInRole = false;
    GameRequests.addLocalGameSeek(
      "test_identifier",
      0,
      "standard",
      15,
      0,
      true,
      null,
      null,
      null,
      true
    );

    cm.verify();
    cm.restore();
  });

  it("should write a message to client_messages if unrated and user cannot play unrated games", function() {
    const cm = sinon.mock(ClientMessages);

    cm.expects("sendMessageToClient")
      .once()
      .withExactArgs(
        player1,
        "test_identifier",
        "UNABLE_TO_PLAY_UNRATED_GAMES"
      );

    meteoruser = player1;
    stubvalues.userIsInRole = false;
    GameRequests.addLocalGameSeek(
      "test_identifier",
      0,
      "standard",
      15,
      0,
      false,
      null,
      null,
      null,
      true
    );

    cm.verify();
    cm.restore();
  });
  //   color,

  it("should fail if color is not null, 'black' or 'white'", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        "something",
        null,
        null,
        true
      );
    }, Match.Error);
  });
  //   minrating,
  it("should fail if minrating is not null, a number, less than 1, or not within ICC configuration requirements", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        "1200",
        null,
        true
      );
    }, Match.Error);
    stubvalues.meetsMinimumAndMaximumRatingRules = false;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        -4,
        null,
        true
      );
    }, Meteor.Error);

    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        1200,
        null,
        true
      );
    }, Meteor.Error);
  });
  //   maxrating,
  it("should fail if maxrating is not null, a number, less than 1, or not within ICC configuration requirements", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        null,
        "1200",
        true
      );
    }, Match.Error);
    stubvalues.meetsMinimumAndMaximumRatingRules = false;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        null,
        -4,
        true
      );
    }, Meteor.Error);

    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        null,
        1200,
        true
      );
    }, Meteor.Error);
  });
  //   autoaccept,
  it("should fail if autoaccept not 'true' or 'false'", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        null,
        null,
        "something"
      );
    }, Match.Error);
  });
  //   formula,
  it("should fail if formula is specified (until we write the code)", function() {
    meteoruser = player1;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek(
        "test_identifier",
        0,
        "standard",
        15,
        0,
        true,
        null,
        null,
        null,
        true,
        "Not yet supported"
      );
    }, Meteor.Error);
  });
  it("should should add a record to the database if all is well and good", function() {
    const grc = GameRequests.collection;
    const gr = sinon.mock(grc);
    gr.expects("insert").once();
    GameRequests.addLocalGameSeek(
      "test_identifier",
      0,
      "standard",
      15,
      0,
      true,
      null,
      null,
      null,
      true
    );
    gr.verify();
    gr.restore();
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
