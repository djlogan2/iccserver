import legacy from "icclegacy";
import { decrypt } from "./encrypt";
import { Meteor } from "meteor/meteor";
import { Logger } from "./Logger";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";
import { GameRequests } from "../../server/GameRequest";
import { Users } from "../../imports/collections/users";
import { Game } from "../../server/Game";
import { ClientMessages } from "../../imports/collections/ClientMessages";

const log = new Logger("server/LegacyUsers");

const LegacyUsersCollection = new Mongo.Collection("legacyUsers");

export const LegacyUser = {};
const legacy_users = {};

function login_failed(data) {
  log.error("login_failed=", data);
}

function loggedin(data, userId) {
  log.debug("Logged in to legacy", data);
  Meteor.users.update({ _id: userId }, { $set: { "status.legacy": true } });
}

function loggedout(data, userId) {
  log.debug("Logged out of legacy", data);
  Meteor.users.update({ _id: userId }, { $unset: { "status.legacy": 1 } });
}

function error_function(data) {
  log.error(data);
}

function seek(data) {
  GameRequests.addLegacyGameSeek(
    "server",
    data.index,
    data.name,
    data.titles,
    data.rating,
    data.provisional_status,
    data.wild,
    data.rating_type,
    data.time,
    data.inc,
    data.rated,
    data.color,
    data.minrating,
    data.maxrating,
    data.autoaccept,
    data.fancy_time_control
  );
}

function seek_removed(data) {
  GameRequests.removeLegacySeek("server", data.index, data.reasoncode);
}

function debugpackets(data) {
  //log.debug("PACKETS=", data);
}

function debugrawdata(databuffer) {
  //log.debug("RAW=", databuffer);
}

function debugsentcommands(databuffer) {}

function player_arrived(data) {
  log.debug("player_arrived", data);
  LegacyUsersCollection.insert(data);
}

function player_left(data) {
  log.debug("player_left", data);
  LegacyUsersCollection.remove({ player_name: data.player_name });
}

function match_removed(data) {
  GameRequests.removeLegacyMatchRequest(
    data.message_identifier,
    data.challenger_name,
    data.receiver_name,
    data.explanation_string
  );
}

function my_game_started(data) {
  Game.startLegacyGame(
    data.message_identifier,
    data.game_number,
    data.whitename,
    data.blackname,
    data.wild_number,
    data.rating_type,
    data.rated,
    data.white_initial,
    data.white_increment,
    data.black_initial,
    data.black_increment,
    data.played_game,
    data.white_rating,
    data.black_rating,
    data.game_id,
    data.white_titles,
    data.black_titles,
    data.ex_string,
    data.irregular_legality,
    data.irregular_semantics,
    data.uses_plunkers,
    data.fancy_time_control,
    data.promote_to_king
  );
}

function match(data, userId) {
  log.debug("match", data);
  const challenger_record = LegacyUsersCollection.findOne({ player_name: data.challenger_name });

  const receiver_record = LegacyUsersCollection.findOne({ player_name: data.receiver_name });
  GameRequests.addLegacyMatchRequest(
    "server",
    data.challenger_name,
    data.challenger_rating,
    data.challenger_rating_type,
    data.challenger_titles,
    data.receiver_name,
    data.receiver_rating,
    data.receiver_rating_type,
    data.receiver_titles,
    data.wild_number,
    data.rating_type,
    data.is_it_rated,
    data.is_it_adjourned,
    data.challenger_time,
    data.challenger_inc,
    data.receiver_time,
    data.receiver_inc,
    data.challenger_color_request,
    data.assess_loss
  );

  legacy_users[userId].accept("server", data.challenger_name);
}

LegacyUser.login = function(user) {
  legacy_users[user._id] = new legacy.LegacyICC({
    username: user.profile.legacy.username,
    password: decrypt(user.profile.legacy.password),
    error_function: Meteor.bindEnvironment(error_function),
    loggedin: Meteor.bindEnvironment(data => loggedin(data, user._id)),
    logged_out: Meteor.bindEnvironment(data => loggedout(data, user._id)),
    login_failed: Meteor.bindEnvironment(login_failed),
    seek: Meteor.bindEnvironment(seek),
    seek_removed: Meteor.bindEnvironment(seek_removed),
    preprocessor: Meteor.bindEnvironment(debugpackets),
    preparser: Meteor.bindEnvironment(debugrawdata),
    sendpreprocessor: Meteor.bindEnvironment(debugsentcommands),
    player_arrived: Meteor.bindEnvironment(player_arrived),
    player_left: Meteor.bindEnvironment(player_left),
    match: Meteor.bindEnvironment(data => match(data, user._id)),
    match_removed: Meteor.bindEnvironment(match_removed),
    my_game_started: Meteor.bindEnvironment(my_game_started)
  });
  this.userId = user._id;
  legacy_users[user._id].login();
};

LegacyUser.logout = function(user) {
  const legacy = legacy_users[typeof user === "string" ? user : user._id];
  if (!!legacy) {
    legacy.logout();
    delete legacy_users[user._id];
  }
};

LegacyUser.isLoggedOn = function(user) {
  check(user, Match.OneOf(Object, String));

  const id = typeof user === "object" ? user._id : user;

  return id in legacy_users;
};

Meteor.startup(() => {
  Users.addLoginHook(user => {
    log.debug("User is in legacy_login role", Users.isAuthorized(user, "legacy_login"));

    // TODO: Move this to legacy as a login hook
    if (
      Users.isAuthorized(user, "legacy_login") &&
      user.profile &&
      user.profile.legacy &&
      user.profile.legacy.username &&
      user.profile.legacy.password &&
      user.profile.legacy.autologin
    ) {
      log.debug("Logging " + user.username + " into v1");
      LegacyUser.login(user);
    }
  });
  Users.addLogoutHook(userId => {
    LegacyUser.logout(userId);
  });
});

LegacyUser.gameRequestAccept = function(message_identifier, game_id) {
  if (Meteor.userId() in legacy_users) {
    const request = GameRequests.collection.findOne({ _id: game_id });
    if (!request) {
      ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "?");
      return;
    }
    legacy_users[Meteor.userId()].accept(message_identifier, request.challenger);
  } else GameRequests.acceptMatchRequest(message_identifier, game_id);
};

Meteor.methods({
  gameRequestAccept: (message_identifier, game_id) =>
    LegacyUser.gameRequestAccept(message_identifier, game_id)
});
