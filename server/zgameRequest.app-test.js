import chai from "chai";

import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { Roles } from "meteor/alanning:roles";
import sinon from "sinon";

import { GameRequests } from "./GameRequest";
import { Game } from "./Game";
import { TestHelpers } from "../imports/server/TestHelpers";
import { standard_member_roles } from "../imports/server/userConstants";
import { ICCMeteorError } from "../lib/server/ICCMeteorError";
import { UserStatus } from "meteor/mizzao:user-status";

function legacyMatchRequest(challenger, receiver) {
  return [
    "message_identifier",
    typeof challenger === "object" ? challenger.profile.legacy.username : challenger,
    2000,
    "none",
    ["GM"],
    typeof receiver === "object" ? receiver.profile.legacy.username : receiver,
    1900,
    "none",
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

function localSeekParameters(initial) {
  return ["id1", 0, "standard", initial || 15, 0, "none", true, null, null, null, true];
}

//GameRequests.addLegacyGameSeek = function(
describe("GameRequests.addLegacyGameSeek", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  //  index,
  it("should be able to add the same index for two different owners without conflict", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));

    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));

    chai.assert.equal(2, GameRequests.collection.find().count());
  });

  it("should replace the record in the database if we try to add the same index twice", function() {
    self.loggedonuser = TestHelpers.createUser();

    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));
    const cursor = GameRequests.collection.find();
    chai.assert.equal(1, cursor.count());
  });
});

// GameRequests.addLocalGameSeek = function() {};
describe("GameRequests.addLocalGameSeek", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  //  self,
  it("should fail if self is null or invalid", function() {
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    }, Match.Error);
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
        "none",
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
        "none",
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
        "inc",
        "something",
        null,
        null,
        null,
        true
      );
    }, Match.Error);
  });

  it("should write a message to client_messages if rated and user cannot play rated games", function() {
    const roles = standard_member_roles.filter(role => role !== "play_rated_games");
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    GameRequests.addLocalGameSeek(
      "test_identifier",
      0,
      "standard",
      15,
      0,
      "none",
      true,
      null,
      null,
      null,
      true
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_RATED_GAMES");
  });

  it("should write a message to client_messages if unrated and user cannot play unrated games", function() {
    const roles = standard_member_roles.filter(role => role !== "play_unrated_games");
    self.loggedonuser = TestHelpers.createUser({ roles: roles });

    GameRequests.addLocalGameSeek(
      "test_identifier",
      0,
      "standard",
      15,
      0,
      "none",
      false,
      null,
      null,
      null,
      true
    );

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_UNRATED_GAMES");
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
        "none",
        true,
        "something",
        null,
        null,
        true
      );
    }, Match.Error);
  });

  //   minrating,
  //   maxrating,
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
        "none",
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
        "none",
        true,
        null,
        null,
        null,
        true,
        "Not yet supported"
      );
    }, ICCMeteorError);
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
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null or invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.removeLegacySeek("message_identifier", 0, 10);
    }, Match.Error);
  });

  it("should succeed if we try to remove a non-existant index", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() => {
      GameRequests.removeLegacySeek("message_identifier", 0, 10);
    });
  });

  it("should remove a previously added record by legacy index", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));
    chai.assert.equal(GameRequests.collection.find().count(), 1);
    GameRequests.removeLegacySeek("message_identifier", 999, 10);
    chai.assert.equal(GameRequests.collection.find().count(), 0);
  });

  it("should fail if the seek record does not belong to the user", function() {
    self.loggedonuser = TestHelpers.createUser();
    GameRequests.addLegacyGameSeek.apply(null, legacySeekParameters(self.loggedonuser));
    chai.assert.equal(GameRequests.collection.find().count(), 1);
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeLegacySeek("message_identifier", 999, 10);
    }, ICCMeteorError);
  });
});

// GameRequests.removeGameSeek = function(seek_id) {};
describe("GameRequests.removeGameSeek", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
    const seek_id = GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.removeGameSeek("message_identifier", seek_id);
    }, ICCMeteorError);
  });

  it("should delete the seek if all is well", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
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
  const self = TestHelpers.setupDescribe.apply(this);

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
      "none",
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
    const gr = self.sandbox.mock(grc);
    const gm = self.sandbox.mock(Game);

    gr.expects("remove").once();
    gm.expects("startLocalGame").once();

    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      "none",
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
      "none",
      true,
      null,
      null,
      null,
      true,
      null
    );

    const roles = standard_member_roles.filter(role => role !== "play_rated_games");
    self.loggedonuser = TestHelpers.createUser({ roles: roles });
    GameRequests.acceptGameSeek("message_identifier", seek_id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_RATED_GAMES");
  });

  it("should fail if the seek is unrated and user cannot play unrated games", function() {
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "id1",
      0,
      "standard",
      15,
      0,
      "none",
      false,
      null,
      null,
      null,
      true,
      null
    );

    const roles = standard_member_roles.filter(role => role !== "play_unrated_games");
    self.loggedonuser = TestHelpers.createUser({ roles: roles });
    GameRequests.acceptGameSeek("message_identifier", seek_id);

    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "UNABLE_TO_PLAY_UNRATED_GAMES");
  });
});

// GameRequests.addLegacyMatchRequest = function(
describe("GameRequests.addLegacyMatchRequest", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
      GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(guy1, guy2));
    }, ICCMeteorError);
  });

  it("should add challenger._id and receiver._id if we can find them in the database", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
    const rec = GameRequests.collection.findOne();
    chai.assert.isDefined(rec);
    chai.assert.equal(challenger._id, rec.challenger_id);
    chai.assert.equal(receiver._id, rec.receiver_id);
  });
});

// GameRequests.addLocalMatchRequest = function(
describe("GameRequests.addLocalMatchRequest", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  //  self,
  it("should fail if self is null or invalid", function() {
    const otherguy = TestHelpers.createUser();
    self.loggedonuser = undefined;
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mi1",
        otherguy,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        0,
        "none"
      );
    }, Match.Error);
  });
  //   receiver_user,
  it("should fail if receiver_user is null or invalid", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.throws(() => {
      GameRequests.addLocalMatchRequest(
        "mi2",
        undefined,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        0,
        "none"
      );
    }, Match.Error);
  });
  it("should return a client message if receiver_user is not logged on", function() {
    self.loggedonuser = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser({ login: false });
    GameRequests.addLocalMatchRequest(
      "mi3",
      otherguy,
      0,
      "standard",
      true,
      false,
      15,
      0,
      "none",
      15,
      0,
      "none"
    );
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "CANNOT_MATCH_LOGGED_OFF_USER");
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
        "none",
        15,
        0,
        "none"
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
        "none",
        15,
        0,
        "none"
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
        "none",
        15,
        0,
        "none"
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
        "none",
        15,
        0,
        "none"
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
          "none",
          11,
          0,
          "none"
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
          "none",
          15,
          5,
          "inc"
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
        "none",
        11,
        0,
        "none",
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
        "none",
        15,
        5,
        "inc",
        "white"
      )
    );
    chai.assert.equal(GameRequests.collection.find().count(), 2);
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
        "none",
        15,
        0,
        "none",
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
        "none",
        15,
        0,
        "none"
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
        "none",
        15,
        0,
        "none",
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
        "none",
        15,
        0,
        "none",
        null,
        "fancy"
      );
    }, Match.Error);
  });
});

// GameRequests.acceptMatchRequest = function(game_id) {};
describe("GameRequests.acceptMatchRequest", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should start a white game if the match request was white", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = us;
      const match_id = GameRequests.addLocalMatchRequest(
        "mi1",
        them,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "white"
      );
      self.loggedonuser = them;
      GameRequests.acceptMatchRequest("accept", match_id);
      const game = Game.collection.findOne({});
      chai.assert.isDefined(game);
      chai.assert.isTrue(game.white.id === us._id);
      chai.assert.isTrue(game.black.id === them._id);
      Game.collection.remove({});
    }
  });
  it("should start a black game if the match request was black", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = us;
      const match_id = GameRequests.addLocalMatchRequest(
        "mi1",
        them,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        0,
        "none",
        "black"
      );
      self.loggedonuser = them;
      GameRequests.acceptMatchRequest("accept", match_id);
      const game = Game.collection.findOne({});
      chai.assert.isDefined(game);
      chai.assert.isTrue(game.black.id === us._id);
      chai.assert.isTrue(game.white.id === them._id);
      Game.collection.remove({});
    }
  });
  it("should start a randomly colored game if the match request did not specify a color", function() {
    const us = TestHelpers.createUser();
    const them = TestHelpers.createUser();
    let white = 0;
    let black = 0;
    for (let x = 0; x < 10; x++) {
      self.loggedonuser = us;
      const match_id = GameRequests.addLocalMatchRequest(
        "mi1",
        them,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        0,
        "none"
      );
      self.loggedonuser = them;
      GameRequests.acceptMatchRequest("accept", match_id);
      const game = Game.collection.findOne({});
      chai.assert.isDefined(game);
      if (game.white.id === us._id) white++;
      else black++;
      Game.collection.remove({});
    }
    chai.assert.isTrue(white > 0);
    chai.assert.isTrue(black > 0);
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
      "none",
      15,
      0,
      "none"
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
      "none",
      15,
      0,
      "none"
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
      "none",
      15,
      0,
      "none"
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
    chai.assert.isTrue(self.clientMessagesSpy.calledOnce);
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "NO_MATCH_FOUND");
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
      "none",
      15,
      0,
      "none"
    );

    chai.assert.equal(GameRequests.collection.find().count(), 1);
    chai.assert.equal(Game.collection.find().count(), 0);

    self.loggedonuser = receiver;

    const fake = self.sandbox.fake.returns("id");
    self.sandbox.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 15);
    chai.assert.equal(fake.args[0][6], 0);
    chai.assert.equal(fake.args[0][7], "none");
    chai.assert.equal(fake.args[0][8], 15);
    chai.assert.equal(fake.args[0][9], 0);
    chai.assert.equal(fake.args[0][10], "none");
    chai.assert.isTrue(fake.args[0][11] === undefined || fake.args[0][11] === null);
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
      "inc",
      25,
      25,
      "inc",
      "white"
    );

    self.loggedonuser = receiver;

    const fake = self.sandbox.fake.returns("id");
    self.sandbox.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 15);
    chai.assert.equal(fake.args[0][6], 15);
    chai.assert.equal(fake.args[0][7], "inc");
    chai.assert.equal(fake.args[0][8], 25);
    chai.assert.equal(fake.args[0][9], 25);
    chai.assert.equal(fake.args[0][10], "inc");
    chai.assert.equal(fake.args[0][11], "black");
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
      "inc",
      25,
      25,
      "inc",
      "black"
    );

    self.loggedonuser = receiver;

    const fake = self.sandbox.fake.returns("id");
    self.sandbox.replace(Game, "startLocalGame", fake);
    GameRequests.acceptMatchRequest("mi2", match_id);

    chai.assert.equal(GameRequests.collection.find().count(), 0);
    chai.assert.equal(fake.args[0][0], "mi2");
    chai.assert.equal(fake.args[0][1]._id, challenger._id);
    chai.assert.equal(fake.args[0][2], 0);
    chai.assert.equal(fake.args[0][3], "standard");
    chai.assert.equal(fake.args[0][4], true);
    chai.assert.equal(fake.args[0][5], 25);
    chai.assert.equal(fake.args[0][6], 25);
    chai.assert.equal(fake.args[0][7], "inc");
    chai.assert.equal(fake.args[0][8], 15);
    chai.assert.equal(fake.args[0][9], 15);
    chai.assert.equal(fake.args[0][10], "inc");
    chai.assert.equal(fake.args[0][11], "white");
  });
});

// GameRequests.declineMatchRequest = function(game_id) {};
describe("GameRequests.declineMatchRequest", function() {
  const self = TestHelpers.setupDescribe.apply(this);

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
      "inc",
      15,
      15,
      "inc"
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
      "inc",
      15,
      15,
      "inc"
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
      "inc",
      15,
      15,
      "inc"
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
      "inc",
      15,
      15,
      "inc"
    );
    self.loggedonuser = receiver;
    chai.assert.equal(1, GameRequests.collection.find().count());
    GameRequests.declineMatchRequest("mi2", match_id);
    chai.assert.equal(0, GameRequests.collection.find().count());
    chai.assert.equal(self.clientMessagesSpy.args[0][0], challenger._id);
    chai.assert.equal(self.clientMessagesSpy.args[0][1], "mi1");
    chai.assert.equal(self.clientMessagesSpy.args[0][2], "MATCH_DECLINED");
  });
});

// GameRequests.removeLegacyMatchRequest = function(
describe("GameRequests.removeLegacyMatchRequest", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should fail if self is null or invalid", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    self.loggedonuser = challenger;
    GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
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
    GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
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
    GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
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
    GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
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
  const self = TestHelpers.setupDescribe.apply(this);

  it("should have match records for which the user is the challenger deleted when a user logs off", function(done) {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();

    add15(self, challenger, receiver, otherguy);
    chai.assert.equal(GameRequests.collection.find().count(), 15);

    self.loggedonuser = challenger;
    const collector = new PublicationCollector({ userId: challenger._id });
    collector.collect("game_requests", collections => {
      chai.assert.equal(collections.game_requests.length, 11);
      UserStatus.events.emit("connectionLogout", { connectionId: 1, userId: challenger._id });
      chai.assert.equal(GameRequests.collection.find().count(), 6);
      chai.assert.equal(GameRequests.collection.find({ matchingusers: challenger._id }).count(), 0);
      chai.assert.equal(GameRequests.collection.find({ type: "seek" }).count(), 2);
      done();
    });
  });
});

describe("game_requests publication", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("should stop publishing records when played game is started", function() {
    const challenger = TestHelpers.createUser();
    const receiver = TestHelpers.createUser();
    const otherguy = TestHelpers.createUser();
    add15(self, challenger, receiver, otherguy);

    self.loggedonuser = challenger;
    let gameid;

    let collector1 = new PublicationCollector({ userId: challenger._id });
    return collector1
      .collect("game_requests")
      .then(collections => {
        chai.assert.equal(collections.game_requests.length, 11);
        gameid = Game.startLocalGame(
          "mi",
          otherguy,
          0,
          "standard",
          true,
          15,
          0,
          "none",
          15,
          0,
          "none"
        );
        return Promise.resolve();
      })
      .then(() => {
        const collector = new PublicationCollector({ userId: challenger._id });
        return collector.collect("game_requests");
      })
      .then(collections => {
        if (!!collections.game_requests) chai.assert.equal(collections.game_requests.length, 0);
        Game.resignLocalGame("mi2", gameid);
        return Promise.resolve();
      })
      .then(() => {
        const collector = new PublicationCollector({ userId: challenger._id });
        return collector.collect("game_requests");
      })
      .then(collections => {
        chai.assert.equal(collections.game_requests.length, 11);
      });
  });
});

describe("Local seeks", function() {
  const self = TestHelpers.setupDescribe.apply(this);

  it("Should not add a duplicate seek. At least one of the seeking parameters needs to be different (i.e. 'autoaccept' isn't a seeking parameter)", function() {
    self.loggedonuser = TestHelpers.createUser();
    const game_id_1 = GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    const game_id_2 = GameRequests.addLocalGameSeek.apply(null, localSeekParameters());
    chai.assert.equal(game_id_1, game_id_2);
  });

  it("should add user ids to the matchingusers array of appropriate seeks when a user logs on", function() {
    const guy1 = TestHelpers.createUser();
    const guy2 = TestHelpers.createUser();
    self.loggedonuser = guy1;
    const ratings = [
      [null, null, true],
      [null, 2000, true],
      [null, 1000, false],
      [1000, 2000, true],
      [2000, 2500, false]
    ];
    ratings.forEach(onerating => {
      GameRequests.addLocalGameSeek(
        "mi-" + onerating[0] + "-" + onerating[1] + "-" + onerating[2],
        0,
        "standard",
        15,
        0,
        "none",
        true,
        null,
        onerating[0],
        onerating[1],
        true
      );
    });
    self.loggedonuser = undefined;
    UserStatus.events.emit("connectionLogin", { connectionId: 1, userId: guy2._id });
    chai.assert.equal(GameRequests.collection.find({ matchingusers: guy2._id }).count(), 3);
  });

  it("should add all qualified already-logged on users ids to matchingusers array when a new seek is added", function() {
    const users = [];
    const update = [];
    for (let x = 0; x < 10; x++) {
      const user = TestHelpers.createUser();
      users.push(user);
      if (!(x % 2)) update.push(user._id);
    }
    Meteor.users.update({ _id: { $in: update } }, { multi: true });
    self.loggedonuser = TestHelpers.createUser();
    const seek_id = GameRequests.addLocalGameSeek(
      "mi1",
      0,
      "standard",
      15,
      0,
      "none",
      true,
      null,
      1500,
      null,
      true
    );
    const theseek = GameRequests.collection.findOne({ _id: seek_id });
    const matchingusers = Meteor.users
      .find({
        "ratings.standard.rating": { $gte: 1500 },
        _id: { $ne: self.loggedonuser._id }
      })
      .fetch()
      .map(user => user._id);
    chai.assert.notEqual(users.length, matchingusers.length); // Just make sure it's not everybody!
    chai.assert.sameMembers(theseek.matchingusers, matchingusers);
  });
});

function add15(self, challenger, receiver, otherguy) {
  if (!this.count) this.count = 0;
  let fifteen = 15 + this.count++;
  self.loggedonuser = challenger;
  GameRequests.addLocalMatchRequest(
    "mi1",
    receiver,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalMatchRequest(
    "mi1",
    otherguy,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters(fifteen));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, receiver));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(challenger, otherguy));

  self.loggedonuser = receiver;
  fifteen = 15 + this.count++;
  GameRequests.addLocalMatchRequest(
    "mi1",
    challenger,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalMatchRequest(
    "mi1",
    otherguy,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters(fifteen));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(receiver, challenger));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(receiver, otherguy));

  self.loggedonuser = otherguy;
  fifteen = 15 + this.count++;
  GameRequests.addLocalMatchRequest(
    "mi1",
    challenger,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalMatchRequest(
    "mi1",
    receiver,
    0,
    "standard",
    true,
    false,
    fifteen,
    0,
    "none",
    fifteen,
    0,
    "none"
  );
  fifteen = 15 + this.count++;
  GameRequests.addLocalGameSeek.apply(null, localSeekParameters(fifteen));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(otherguy, challenger));
  fifteen = 15 + this.count++;
  GameRequests.addLegacyMatchRequest.apply(null, legacyMatchRequest(otherguy, receiver));
}

describe("GameRequests.seekMatchesUser", function() {
  const self = this;
  beforeEach(function() {
    self.sandbox = sinon.createSandbox();
    self.sandbox.replace(Roles, "userIsInRole", self.sandbox.fake.returns(true));
  });

  afterEach(function() {
    self.sandbox.restore();
  });

  it("needs to work in all cases", function() {
    const checks = [
      [null, null, 1600, true],
      [1500, null, 1600, true],
      [null, 2000, 1600, true],
      [1500, 2000, 1600, true],
      [1500, null, 1400, false],
      [null, 2000, 2200, false],
      [1500, 2000, 1400, false],
      [1500, 2000, 2400, false]
    ];

    checks.forEach(check => {
      const minrating = check[0];
      const maxrating = check[1];
      const userrating = check[2];
      const succeed = check[3];
      const message =
        "should " +
        (succeed ? "succeed" : "fail") +
        " when minrating is " +
        minrating +
        " and maxrating is " +
        maxrating +
        " and user rating is " +
        userrating;
      const user = {
        _id: "user",
        ratings: {
          standard: { rating: userrating }
        }
      };
      const seek = {
        _id: "seek",
        minrating: minrating,
        maxrating: maxrating,
        rating_type: "standard"
      };
      chai.assert.equal(GameRequests.seekMatchesUser("mi1", user, seek), succeed, message);
    });
  });
});

describe("normal increment", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should work in a seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "inc", true)
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.inc_or_delay, 15);
    chai.assert.equal(gamereq.delaytype, "inc");
  });

  it("should work in a match", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        15,
        "inc"
      )
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.challenger_inc_or_delay, 15);
    chai.assert.equal(gamereq.challenger_delaytype, "inc");
    chai.assert.equal(gamereq.receiver_inc_or_delay, 15);
    chai.assert.equal(gamereq.receiver_delaytype, "inc");
  });

  it("should be converted to a local game start correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      p2,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "inc",
      15,
      15,
      "inc"
    );
    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => GameRequests.acceptMatchRequest("mi2", match_id));
    const game = Game.collection.findOne({});
    chai.assert.equal(game.clocks.white.inc_or_delay, 15);
    chai.assert.equal(game.clocks.white.delaytype, "inc");
    chai.assert.equal(game.clocks.black.inc_or_delay, 15);
    chai.assert.equal(game.clocks.black.delaytype, "inc");
  });
});

describe("us delay", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should work in a seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "us", true)
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.inc_or_delay, 15);
    chai.assert.equal(gamereq.delaytype, "us");
  });

  it("should work in a match", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "us",
        15,
        15,
        "us"
      )
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.challenger_inc_or_delay, 15);
    chai.assert.equal(gamereq.challenger_delaytype, "us");
    chai.assert.equal(gamereq.receiver_inc_or_delay, 15);
    chai.assert.equal(gamereq.receiver_delaytype, "us");
  });

  it("should be converted to a local game start correctly from a match", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      p2,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "us",
      15,
      15,
      "us"
    );
    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => GameRequests.acceptMatchRequest("mi2", match_id));
    const game = Game.collection.findOne({});
    chai.assert.equal(game.clocks.white.inc_or_delay, 15);
    chai.assert.equal(game.clocks.white.delaytype, "us");
    chai.assert.equal(game.clocks.black.inc_or_delay, 15);
    chai.assert.equal(game.clocks.black.delaytype, "us");
  });

  it("should be converted to a local game start correctly from a seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      p2,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "us",
      15,
      15,
      "us"
    );
    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => GameRequests.acceptMatchRequest("mi2", match_id));
    const game = Game.collection.findOne({});
    chai.assert.equal(game.clocks.white.inc_or_delay, 15);
    chai.assert.equal(game.clocks.white.delaytype, "us");
    chai.assert.equal(game.clocks.black.inc_or_delay, 15);
    chai.assert.equal(game.clocks.black.delaytype, "us");
  });
});

describe("bronstein delay", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should work in a seek", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "bronstein", true)
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.inc_or_delay, 15);
    chai.assert.equal(gamereq.delaytype, "bronstein");
  });

  it("should work in a match", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "bronstein",
        15,
        15,
        "bronstein"
      )
    );
    const gamereq = GameRequests.collection.findOne({});
    chai.assert.equal(gamereq.challenger_inc_or_delay, 15);
    chai.assert.equal(gamereq.challenger_delaytype, "bronstein");
    chai.assert.equal(gamereq.receiver_inc_or_delay, 15);
    chai.assert.equal(gamereq.receiver_delaytype, "bronstein");
  });
  it("should be converted to a local game start correctly", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    const match_id = GameRequests.addLocalMatchRequest(
      "mi1",
      p2,
      0,
      "standard",
      true,
      false,
      15,
      15,
      "bronstein",
      15,
      15,
      "bronstein"
    );
    self.loggedonuser = p2;
    chai.assert.doesNotThrow(() => GameRequests.acceptMatchRequest("mi2", match_id));
    const game = Game.collection.findOne({});
    chai.assert.equal(game.clocks.white.inc_or_delay, 15);
    chai.assert.equal(game.clocks.white.delaytype, "bronstein");
    chai.assert.equal(game.clocks.black.inc_or_delay, 15);
    chai.assert.equal(game.clocks.black.delaytype, "bronstein");
  });
});

describe("Local seeks", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should succeed when a seek is issued with identical values except delay types differ", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 15, "us", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi2", 0, "standard", 15, 15, "bronstein", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 15, "inc", true)
    );
    chai.assert.equal(GameRequests.collection.find().count(), 3);
  });
  it("should succeed when a seek is issued with identical values except delay values differ", function() {
    self.loggedonuser = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi1", 0, "standard", 15, 5, "us", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi2", 0, "standard", 15, 10, "us", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi3", 0, "standard", 15, 15, "us", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi4", 0, "standard", 15, 5, "bronstein", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi5", 0, "standard", 15, 10, "bronstein", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi6", 0, "standard", 15, 15, "bronstein", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi7", 0, "standard", 15, 5, "inc", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi8", 0, "standard", 15, 10, "inc", true)
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalGameSeek("mi9", 0, "standard", 15, 15, "inc", true)
    );
    chai.assert.equal(GameRequests.collection.find().count(), 9);
  });
});

describe("Local matches", function() {
  const self = TestHelpers.setupDescribe.apply(this);
  it("should fail if delaytype is not 'none', 'inc', 'us' or 'bronstein'", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.throws(
      () =>
        GameRequests.addLocalMatchRequest(
          "mi1",
          p2,
          0,
          "standard",
          true,
          false,
          15,
          15,
          "bogus",
          15,
          15,
          "inc"
        ),
      ICCMeteorError
    );
  });
  it("should succeed when a match is issued with identical values except delay types differ", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi2",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "us",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi3",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "bronstein",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi4",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        0,
        "none",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi5",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        15,
        "us",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi6",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        15,
        "bronstein",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi7",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        0,
        "none",
        "white"
      )
    );
    chai.assert.equal(GameRequests.collection.find().count(), 7);
  });

  it("should succeed when a match is issued with identical values except delay values differ", function() {
    self.loggedonuser = TestHelpers.createUser();
    const p2 = TestHelpers.createUser();
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        14,
        "inc",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "inc",
        15,
        14,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "us",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        14,
        "us",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "us",
        15,
        14,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "bronstein",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        14,
        "bronstein",
        15,
        15,
        "inc",
        "white"
      )
    );
    chai.assert.doesNotThrow(() =>
      GameRequests.addLocalMatchRequest(
        "mi1",
        p2,
        0,
        "standard",
        true,
        false,
        15,
        15,
        "bronstein",
        15,
        14,
        "inc",
        "white"
      )
    );
    chai.assert.equal(GameRequests.collection.find().count(), 9);
  });
});
