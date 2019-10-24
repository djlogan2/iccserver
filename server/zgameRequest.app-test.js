import chai from "chai";
import sinon from "sinon";

import { resetDatabase } from "meteor/xolvio:cleaner";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

import { GameRequests } from "./GameRequest";
import { Game } from "./Game";
import { ClientMessages } from "../imports/collections/ClientMessages";
import { TestHelpers } from "../imports/server/TestHelpers";
import { standard_member_roles } from "../imports/server/userConstants";
import { SystemConfiguration } from "../imports/collections/SystemConfiguration";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";

function legacyMatchRequest(challenger, receiver) {
  return [
    "message_identifier",
    typeof challenger === "object"
      ? challenger.profile.legacy.username
      : challenger,
    2000,
    0,
    ["GM"],
    typeof receiver === "object" ? receiver.profile.legacy.username : receiver,
    1900,
    0,
    ["GM"],
    0,
    "Standard",
    true,
    false,
    15,
    0,
    15,
    0,
    "white",
    16
  ];
}

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
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
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
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
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
    }, ICCMeteorError);
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
    const roles = standard_member_roles.filter(
      role => role !== "play_rated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

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
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_RATED_GAMES"
    );
  });

  it("should write a message to client_messages if unrated and user cannot play unrated games", function() {
    const roles = standard_member_roles.filter(
      role => role !== "play_unrated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

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

    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_UNRATED_GAMES"
    );
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
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
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
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
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
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
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
    const seek_id = GameRequests.addLegacyGameSeek.apply(
      null,
      legacySeekParameters(self.loggedonuser)
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
      true,
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
    GameRequests.acceptGameSeek("message_identifier", seek_id);

    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_RATED_GAMES"
    );
  });

  it("should fail if the seek is unrated and user cannot play unrated games", function() {
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
      role => role !== "play_unrated_games"
    );
    self.loggedonuser = TestHelpers.createUser({ roles: roles });
    GameRequests.acceptGameSeek("message_identifier", seek_id);

    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "UNABLE_TO_PLAY_UNRATED_GAMES"
    );
  });
});

// GameRequests.addLegacyMatchRequest = function(
describe("GameRequests.addLegacyMatchRequest", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLegacyMatchRequest.apply(
        null,
        legacyMatchRequest(TestHelpers.createUser(), TestHelpers.createUser())
      );
    }, Match.Error);
  });

  it("should fail if self is neither challenger nor receiver", function() {
    self.loggedonuser = TestHelpers.createUser();
    const guy1 = TestHelpers.createUser();
    const guy2 = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLegacyMatchRequest.apply(
        null,
        legacyMatchRequest(guy1, guy2)
      );
    }, ICCMeteorError);
  });

  it("should add challenger._id and receiver._id if we can find them in the database", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    const rec = GameRequests.collection.findOne();
    chai.assert.isDefined(rec);
    chai.assert.equal(challenger._id, rec.challenger_id);
    chai.assert.equal(receiver._id, rec.receiver_id);
  });
});

// GameRequests.addLocalMatchRequest = function(
describe("GameRequests.addLocalMatchRequest", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  //  self,
  it("should fail if self is null or invalid", function() {
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        otherguy,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });
  //   receiver_user,
  it("should fail if receiver_user is null or invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });
  it("should return a client message if receiver_user is not logged on", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ login: false });
    GameRequests.addLocalMatchRequest(
      "mid",
      otherguy,
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(
      self.clientMessagesFake.args[0][2],
      "CANNOT_MATCH_LOGGED_OFF_USER"
    );
  });
  //   wild_number,
  it("should fail if wild is not zero", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        1,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });

  //   rating_type,
  it("should fail if rating_type is not a valid rating type", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "bogus",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });

  //   is_it_rated,
  it("should fail if is_it_rated is not 'true' or 'false'", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        "yep",
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });

  //   is_it_adjourned,
  it("should fail if is_it_adjourned is not 'true' or 'false'", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        "yep",
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  }); // TODO: Where are we keeping adjourned games? We should connect this

  //   challenger_time,
  it("should fail if color is not specified and challenger time/inc !== receiver time/inc", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    self.loggedonuser = challenger;
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi",
          receiver,
          0,
          "standard",
          true,
          false,
          15,
          0,
          11,
          0
        ),
      ICCMeteorError
    );
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi",
          receiver,
          0,
          "standard",
          true,
          false,
          15,
          0,
          15,
          5
        ),
      ICCMeteorError
    );
  });

  it("should succeed if color is specified and challenger time/inc !== receiver time/inc", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    self.loggedonuser = challenger;
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi",
        receiver,
        0,
        "standard",
        true,
        false,
        15,
        0,
        11,
        0,
        "black"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi",
        receiver,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        5,
        "white"
      )
    );
  });

  it("should fail if time/inc invalid/not within ICC configuration", function() {
    self.loggedonuser = TestHelpers.createUser();
    sinon.replace(
      SystemConfiguration,
      "meetsTimeAndIncRules",
      sinon.fake.returns(false)
    );
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
  });

  //   challenger_color_request,
  it("should fail if challenger_color_request is null, 'white' or 'black'", function() {
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0,
        "yep"
      );
    }, Match.Error);
  });

  //   assess_loss,
  it("should fail if assess_loss is null, not an number, < 0, or loss + win > ICC configuration maximum", function() {
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0
      );
    }, Match.Error);
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0,
        "yep"
      );
    }, Match.Error);
  });
  //   fancy_time_control
  it("should fail if fancy_time_control is not null", function() {
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mid",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        15,
        0,
        null,
        "fancy"
      );
    }, Match.Error);
  });
});

// GameRequests.acceptMatchRequest = function(game_id) {};
describe("GameRequests.acceptMatchRequest", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      TestHelpers.createUser(),
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.acceptMatchRequest("message_identifier", match_id);
    }, Match.Error);
  });

  it("should fail if self is the challenger", function() {
    self.loggedonuser = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );
    chai.assert.throws(() => {
      GameRequests.acceptMatchRequest("message_identifier", match_id);
    }, ICCMeteorError);
  });

  it("should fail if self is not the receiver", function() {
    self.loggedonuser = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.acceptMatchRequest("message_identifier", match_id);
    }, ICCMeteorError);
  });

  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.acceptMatchRequest("message_identifier", null);
    }, Match.Error);
  });

  it("should return a client message if there isn't a valid record", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.acceptMatchRequest("message_identifier", "badid");
    chai.assert.isTrue(self.clientMessagesFake.calledOnce);
    chai.assert.equal(self.clientMessagesFake.args[0][2], "NO_MATCH_FOUND");
  });

  it("should fail if request record is a legacy request", function() {
    self.loggedonuser = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    const game_id = GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(self.loggedonuser, receiver)
    );

    self.loggedonuser = receiver;
    chai.assert.throws(() => {
      GameRequests.acceptMatchRequest("message_identifier", game_id);
    }, ICCMeteorError);
  });

  it("should delete this record and insert a record into the game collection upon a successful request", function() {
    chai.assert.equal(GameRequests.collection.find().count(), 0);

    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      0,
      15,
      0
    );

    chai.assert.equal(GameRequests.collection.find().count(), 1);
    chai.assert.equal(Game.collection.find().count(), 0);

    self.loggedonuser = receiver;

    const fake = sinon.fake.returns("id");
    sinon.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 15);
    chai.assert.equal(fake.args[0][6], 0);
    chai.assert.equal(fake.args[0][7], 15);
    chai.assert.equal(fake.args[0][8], 0);
    chai.assert.equal(fake.args[0][9], true);
    chai.assert.isTrue(
      fake.args[0][10] === undefined || fake.args[0][10] === null
    );
  });

  // that is, if color=white, time=15 inc=0  otherguy time=10 inc=5, the game record should have:
  //  white: me, white_time: 15, inc 0, black: him, time: 10, inc: 5
  // and vice-versa:
  // color=black, time=15 inc=0  otherguy time=10 inc=5, the game record should have:
  //  white: them, white_time: 10, inc 5, black: us, time: 15, inc: 0
  it("should set the game record white correctly when color is specified in the game request", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      25,
      25,
      "white"
    );

    self.loggedonuser = receiver;

    const fake = sinon.fake.returns("id");
    sinon.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 15);
    chai.assert.equal(fake.args[0][6], 15);
    chai.assert.equal(fake.args[0][7], 25);
    chai.assert.equal(fake.args[0][8], 25);
    chai.assert.equal(fake.args[0][9], true);
    chai.assert.equal(fake.args[0][10], "black");
  });

  it("should set the game record black correctly when color is specified in the game request", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();

    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      25,
      25,
      "black"
    );

    self.loggedonuser = receiver;

    const fake = sinon.fake.returns("id");
    sinon.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 25);
    chai.assert.equal(fake.args[0][6], 25);
    chai.assert.equal(fake.args[0][7], 15);
    chai.assert.equal(fake.args[0][8], 15);
    chai.assert.equal(fake.args[0][9], true);
    chai.assert.equal(fake.args[0][10], "white");
  });
});

// GameRequests.declineMatchRequest = function(game_id) {};
describe("GameRequests.declineMatchRequest", function() {
  const self = this;

  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should fail if self is null or invalid", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      15,
      15
    );
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.declineMatchRequest("mi1", match_id);
    }, Match.Error);
  });

  it("should fail if self is the challenger", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      15,
      15
    );
    self.loggedonuser = challenger;
    chai.assert.throws(() => {
      GameRequests.declineMatchRequest("mi2", match_id);
    }, ICCMeteorError);
  });

  it("should fail if self is not the receiver", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const somebodyelse = TestHelpers.createUser();
    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      15,
      15
    );
    self.loggedonuser = somebodyelse;
    chai.assert.throws(() => {
      GameRequests.declineMatchRequest("mi1", match_id);
    }, ICCMeteorError);
  });

  it("should fail if game_id is null", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.declineMatchRequest("mi1", null);
    }, Match.Error);
  });

  it("should fail if request record is a legacy request", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    const match_id = GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    chai.assert.throws(() => {
      GameRequests.declineMatchRequest("mi1", match_id);
    }, ICCMeteorError);
  });

  it("should delete this record and send a client message to the challenger upon a successful request", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      receiver,
      0,
      "standard",
      true,
      false,
      15,
      15,
      15,
      15
    );
    self.loggedonuser = receiver;
    chai.assert.equal(1, GameRequests.collection.find().count());
    GameRequests.declineMatchRequest("mi2", match_id);
    chai.assert.equal(0, GameRequests.collection.find().count());
    chai.assert.equal(self.clientMessagesFake.args[0][0], challenger._id);
    chai.assert.equal(self.clientMessagesFake.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesFake.args[0][2], "MATCH_DECLINED");
  });
});

// GameRequests.removeLegacyMatchRequest = function(
describe("GameRequests.removeLegacyMatchRequest", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    console.log("Replaced Meteor.user");
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should fail if self is null or invalid", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        challenger.profile.legacy.username,
        receiver.profile.legacy.username,
        "explanation"
      );
    }, Match.Error);
  });

  it("should fail if self is not the owner", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        challenger.profile.legacy.username,
        receiver.profile.legacy.username,
        "explanation"
      );
    }, ICCMeteorError);
  });

  it("should fail if challenger or receiver is null or there isn't a valid record", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        null,
        receiver.profile.legacy.username,
        "explanation"
      );
    }, Match.Error);
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        challenger.profile.legacy.username,
        null,
        "explanation"
      );
    }, Match.Error);
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        "bogus1",
        receiver.profile.legacy.username,
        "explanation"
      );
    }, ICCMeteorError);
    chai.assert.throws(() => {
      GameRequests.removeLegacyMatchRequest(
        "message_identifier",
        challenger.profile.legacy.username,
        "bogus2",
        "explanation"
      );
    }, ICCMeteorError);
  });

  it("should delete this record upon a successful request", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    chai.assert.equal(0, GameRequests.collection.find().count());
    GameRequests.addLegacyMatchRequest.apply(
      null,
      legacyMatchRequest(challenger, receiver)
    );
    chai.assert.equal(1, GameRequests.collection.find().count());
    GameRequests.removeLegacyMatchRequest(
      "message_identifier",
      challenger.profile.legacy.username,
      receiver.profile.legacy.username,
      "explanation"
    );
    chai.assert.equal(0, GameRequests.collection.find().count());
  });
});

describe("game_requests collection", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should have match records for which the user is the challenger deleted when a user logs off", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    add15(self, challenger, receiver, otherguy);
    chai.assert.equal(GameRequests.collection.find().count(), 15);

    self.loggedonuser = challenger;

    const collector = new PublicationCollector({ userId: challenger._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 11);
    });

    GameRequests.logoutHook(challenger._id);
    chai.assert.equal(GameRequests.collection.find().count(), 6);
    chai.assert.equal(
      GameRequests.collection.find({ matchingusers: challenger._id }).count(),
      0
    );
    chai.assert.equal(
      GameRequests.collection.find({ type: "seek" }).count(),
      2
    );
  });
});

describe("game_requests publication", function() {
  let self = this;

  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });

  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  it("should stop publishing records when played game is started", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    add15(self, challenger, receiver, otherguy);

    self.loggedonuser = challenger;

    const collector1 = new PublicationCollector({ userId: challenger._id });
    collector1.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 11);
    });

    const gameid = Game.startLocalGame(
      "mi",
      otherguy,
      0,
      "standard",
      true,
      15,
      0,
      15,
      0,
      true,
      null
    );

    const collector2 = new PublicationCollector({ userId: challenger._id });
    collector2.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 0);
    });

    Game.resignGame("mi2", gameid);

    const collector3 = new PublicationCollector({ userId: challenger._id });
    collector3.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 11);
    });
  });

  it("should republish matches and seeks when played game is over", function() {
    chai.assert.fail("do me");
  });
});

describe("Local seeks", function() {
  let self = this;
  beforeEach(function(done) {
    self.meteorUsersFake = sinon.fake(() =>
      Meteor.users.findOne({
        _id: self.loggedonuser ? self.loggedonuser._id : ""
      })
    );
    self.clientMessagesFake = sinon.fake();
    sinon.replace(
      ClientMessages,
      "sendMessageToClient",
      self.clientMessagesFake
    );
    sinon.replace(Meteor, "user", self.meteorUsersFake);
    resetDatabase(null, done);
  });
  afterEach(function() {
    sinon.restore();
    delete self.meteorUsersFake;
    delete self.clientMessagesFake;
  });

  // What should happen? A replace? A ClientMessage?
  it("Should not add a duplicate seek. At least one of the seeking parameters needs to be different (i.e. 'autoaccept' isn't a seeking parameter)", function() {
    chai.assert.fail("do me");
  });
  it("should add user ids to the matchingusers array of appropriate seeks when a user logs on", function() {
    const guy1 = TestHelpers.createUser();
    const guy2 = TestHelpers.createUser();
    self.loggedonuser = guy1;
    GameRequests.addLocalGameSeek(
      "meet",
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
    GameRequests.addLocalGameSeek(
      "fail",
      0,
      "standard",
      15,
      0,
      true,
      null,
      2000,
      null,
      true
    );
    GameRequests.addLocalGameSeek(
      "meet",
      0,
      "standard",
      15,
      0,
      true,
      null,
      null,
      1000,
      true
    );
    GameRequests.addLocalGameSeek(
      "meet",
      0,
      "standard",
      15,
      0,
      true,
      null,
      1000,
      2000,
      true
    );
    GameRequests.addLocalGameSeek(
      "fail",
      0,
      "standard",
      15,
      0,
      true,
      null,
      2000,
      2500,
      true
    );
    GameRequests.addLocalGameSeek(
      "meet",
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
    GameRequests.addLocalGameSeek(
      "fail",
      0,
      "standard",
      15,
      0,
      false,
      null,
      2000,
      null,
      true
    );
    GameRequests.addLocalGameSeek(
      "meet",
      0,
      "standard",
      15,
      0,
      false,
      null,
      null,
      1000,
      true
    );
    GameRequests.addLocalGameSeek(
      "meet",
      0,
      "standard",
      15,
      0,
      false,
      null,
      1000,
      2000,
      true
    );
    GameRequests.addLocalGameSeek(
      "fail",
      0,
      "standard",
      15,
      0,
      false,
      null,
      2000,
      2500,
      true
    );
    self.loggedonuser = undefined;
    GameRequests.loginHook(guy2);
    chai.assert.equal(
      GameRequests.collection.find({ matchingusers: guy2._id }).count(),
      6
    );
  });
  it("should add not user ids to the matchingusers array of inappropriate seeks when a user logs on", function() {
    chai.assert.fail("do me");
  });
  it("should add all qualified already-logged on users ids to matchingusers array when a new seek is added", function() {
    chai.assert.fail("do me");
  });
});

function add15(self, challenger, receiver, otherguy) {
  self.loggedonuser = challenger;
  GameRequests.addLocalMatchRequest(
    "mi1",
    receiver,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalMatchRequest(
    "mi1",
    otherguy,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(challenger, receiver)
  );
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(challenger, otherguy)
  );

  self.loggedonuser = receiver;
  GameRequests.addLocalMatchRequest(
    "mi1",
    challenger,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalMatchRequest(
    "mi1",
    otherguy,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(receiver, challenger)
  );
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(receiver, otherguy)
  );

  self.loggedonuser = otherguy;
  GameRequests.addLocalMatchRequest(
    "mi1",
    challenger,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalMatchRequest(
    "mi1",
    receiver,
    0,
    "standard",
    true,
    false,
    15,
    0,
    15,
    0
  );
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(otherguy, challenger)
  );
  GameRequests.addLegacyMatchRequest.apply(
    null,
    legacyMatchRequest(otherguy, receiver)
  );
}
