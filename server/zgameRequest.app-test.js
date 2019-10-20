import chai from "chai";
import { resetDatabase } from "meteor/xolvio:cleaner";

import { GameRequests } from "./GameRequest";
import { Game } from "./Game";
import { ClientMessages } from "../imports/collections/ClientMessages";
import sinon from "sinon";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";

import { TestHelpers } from "../imports/server/TestHelpers";
import { standard_member_roles } from "../imports/server/userConstants";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

function legacySeekParameters(user) {
  return [
    "id1",
    999,
    user.profile.legacy.username,
    [],
    2000,
    0,
    0,
    "Standard",
    15,
    0,
    true,
    "white",
    0,
    9999,
    true,
    ""
  ];
}

function localSeekParameters() {
  return ["id1", 0, "standard", 15, 0, true, null, null, null, true];
}

//GameRequests.addLegacyGameSeek = function(
describe("GameRequests.addLegacyGameSeek", function() {
  const self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
  });

  //  index,
  it("should be able to add the same index for two different owners without conflict", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );

    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );

    chai.assert.equal(2, GameRequests.collection.find().count());
  });

  it("should replace the record in the database if we try to add the same index twice", function() {
    self.loggedonuser = TestHelpers.createUser();

    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    const cursor = GameRequests.collection.find();
    chai.assert.equal(1, cursor.count());
  });
});

// GameRequests.addLocalGameSeek = function() {};
describe("GameRequests.addLocalGameSeek", function() {
  let self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
  });

  //  self,
  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    }, ICCMeteorError);
  });

  //   wild,
  it("should fail if wild is invalid (currently anything other than zero)", function() {
    self.loggedonuser = TestHelpers.createUser();
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
    self.loggedonuser = TestHelpers.createUser();
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
    }, Match.Error);
  });

  //   time,
  it("should fail if time is null or not a number or not within ICC configuration requirements", function() {
    self.loggedonuser = TestHelpers.createUser();
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
    self.loggedonuser = TestHelpers.createUser();
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
    self.loggedonuser = TestHelpers.createUser();
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

    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    cm.expects("sendMessageToClient").once();

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

    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    cm.expects("sendMessageToClient").once();

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
    self.loggedonuser = TestHelpers.createUser();
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
    self.loggedonuser = TestHelpers.createUser();
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

    sinon.replace(
      SystemConfiguration,
      "meetsMinimumAndMaximumRatingRules",
      sinon.fake.returns(false)
    );
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
    }, ICCMeteorError); //ICCMeteorError);
    sinon.restore();
  });

  //   maxrating,
  it("should fail if maxrating is not null, a number, less than 1, or not within ICC configuration requirements", function() {
    self.loggedonuser = TestHelpers.createUser();
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

    sinon.replace(
      SystemConfiguration,
      "meetsMinimumAndMaximumRatingRules",
      sinon.fake.returns(false)
    );
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
    }, ICCMeteorError);
    sinon.restore();
  });

  //   autoaccept,
  it("should fail if autoaccept not 'true' or 'false'", function() {
    self.loggedonuser = TestHelpers.createUser();
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
    self.loggedonuser = TestHelpers.createUser();
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
    }, ICCMeteorError);
    sinon.restore();
  });

  it("should should add a record to the database if all is well and good", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    const records = GameRequests.collection.find().fetch();
    chai.assert.equal(records.length, 1);
  });
});

// GameRequests.removeLegacySeek = function(index)
describe("GameRequests.removeLegacySeek", function() {
  let self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.removeLegacySeek("message_identifier", 0);
    }, Match.Error);
  });

  it("should succeed if we try to remove a non-existant index", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() => {
      GameRequests.removeLegacySeek("message_identifier", 0);
    });
  });

  it("should remove a previously added record by legacy index", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);
    GameRequests.removeLegacySeek("message_identifier", 999);
    chai.assert.equal(GameRequests.collection.find().count(), 0);
  });

  it("should fail if the seek record does not belong to the user", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    chai.assert.equal(GameRequests.collection.find().count(), 1);
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeLegacySeek("message_identifier", 999);
    }, ICCMeteorError);
  });
});

// GameRequests.removeGameSeek = function(seek_id) {};
describe("GameRequests.removeGameSeek", function() {
  let self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;

    chai.assert.throws(() => {
      GameRequests.removeGameSeek("message_identifier", "seek_id");
    }, Match.Error);
  });

  it("should fail if seek record cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeGameSeek("message_identifier", "seek_id");
    }, ICCMeteorError);
  });

  it("should fail if seek record does not belong to the user", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek.apply(
      null,
      localSeekParameters()
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeGameSeek("message_identifier", seek_id);
    }, ICCMeteorError);
  });

  it("should delete the seek if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek.apply(
      null,
      localSeekParameters()
    );
    chai.assert.equal(1, GameRequests.collection.find().count());
    chai.assert.doesNotThrow(() => {
      GameRequests.removeGameSeek("message_identifier", seek_id);
    });
    chai.assert.equal(0, GameRequests.collection.find().count());
  });

  it("should fail if the seek record is not a local seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
    );
    chai.assert.throws(() => {
      GameRequests.removeGameSeek("message_identifier", seek_id);
    }, ICCMeteorError);
  });
});

// GameRequests.acceptGameSeek = function(self, seek_id) {};
describe("GameRequests.acceptGameSeek", function() {
  let self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.acceptGameSeek("message_identifier", "existing_seek_id");
    }, Match.Error);
  });

  it("should fail if seek record cannot be found", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.acceptGameSeek("message_identifier", "nonexisting_seek_id");
    }, ICCMeteorError);
  });

  it("should fail if seek record does belong to the user", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      false,
      null,
      null,
      null,
      true,
      null
    );
    chai.assert.throws(() => {
      GameRequests.acceptGameSeek("message_identifier", seek_id);
    }, ICCMeteorError);
  });

  it("should delete the seek and insert a new game if all is well", function() {
    const grc = GameRequests.collection;
    const gr = sinon.mock(grc);
    const gm = sinon.mock(Game);

    gr.expects("remove").once();
    gm.expects("startLocalGame").once();

    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      false,
      null,
      null,
      null,
      true,
      null
    );

    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() => {
      GameRequests.acceptGameSeek("message_identifier", seek_id);
    }, Match.Error);

    gr.verify();
    gm.verify();

    gr.restore();
    gm.restore();
  });

  it("should fail if the seek record is not a local seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLegacyGameSeek(
      "id1",
      999,
      "iccuser1",
      [],
      2000,
      0,
      0,
      "Standard",
      15,
      0,
      true,
      0,
      0,
      9999,
      true,
      ""
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.acceptGameSeek("message_identifier", seek_id);
    }, ICCMeteorError);
  });

  it("should fail if the seek is rated and user cannot play rated games", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      false,
      null,
      null,
      null,
      true,
      null
    );

    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    const cm = sinon.mock(ClientMessages);

    cm.expects("sendMessageToClient")
      .once()
      .withExactArgs(
        self.loggedonuser,
        "test_identifier",
        "ICCMeteorError(message_identifier, "
      );

    GameRequests.acceptGameSeek("message_identifier", seek_id);

    cm.verify();
    cm.restore();
  });

  it("should fail if the seek is unrated and user cannot play unrated games", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      true,
      null,
      null,
      null,
      true,
      null
    );

    const cm = sinon.mock(ClientMessages);

    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    cm.expects("sendMessageToClient")
      .once()
      .withExactArgs(
        self.loggedonuser,
        "test_identifier",
        "UNABLE_TO_PLAY_UNRATED_GAMES"
      );

    GameRequests.acceptGameSeek("message_identifier", seek_id);

    cm.verify();
    cm.restore();
  });
});

// GameRequests.addLegacyMatchRequest = function(
describe("GameRequests.addLegacyMatchRequest", function() {
  let self = this;
  beforeEach(function(done) {
    sinon.replace(ClientMessages, "sendMessageToClient", sinon.fake());
    sinon.replace(
      Meteor,
      "user",
      sinon.fake(() =>
        Meteor.users.findOne({
          _id: self.loggedonuser ? self.loggedonuser._id : ""
        })
      )
    );
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLegacyMatchRequest(
        "challenger",
        2000,
        true,
        ["GM"],
        "receiver",
        1900,
        true,
        ["GM"],
        0,
        "Standard",
        true,
        false,
        15,
        0,
        15,
        0,
        0,
        16
      );
    }, ICCMeteorError);
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
  it("should not return any records if user is playing a game", function() {
    chai.assert.fail("do me");
  });
});
