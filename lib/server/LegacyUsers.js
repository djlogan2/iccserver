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
import { ICCMeteorError } from "./ICCMeteorError";
import { viewable_logged_on_user_fields } from "../../imports/server/userConstants";
import Chess from "chess.js";

const log = new Logger("server/LegacyUsers");

const LegacyUsersCollection = new Mongo.Collection("legacyUsers");

export const LegacyUser = {};
const legacy_users = {};

function login_failed(data) {
  log.error("login_failed=", data);
}

function loggedin(data, userId) {
  //log.debug("Logged in to legacy", data);
  Meteor.users.update(
    { _id: userId },
    { $set: { "status.legacy": true, "profile.legacy.validated": true } }
  );
}

function loggedout(data, userId) {
  //log.debug("Logged out of legacy", data);
  Meteor.users.update({ _id: userId }, { $unset: { "status.legacy": 1 } });
  delete legacy_users[userId];
}

function error_function(data) {
  log.error(data);
}

function seek(data) {
  //log.debug("seek", data);
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
  //log.debug("seek_removed", data);
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
  //log.debug("player_arrived", data);
  LegacyUsersCollection.insert(data);
}

function player_left(data) {
  //log.debug("player_left", data);
  LegacyUsersCollection.remove({ player_name: data.player_name });
}

function match_removed(data) {
  //log.debug("match_removed", data);
  GameRequests.removeLegacyMatchRequest(
    data.message_identifier,
    data.challenger_name,
    data.receiver_name,
    data.explanation_string
  );
}

function msec(data) {
  log.debug("msec", data);
  const game = Game.GameCollection.findOne({ legacy_game_number: data.gamenumber });
  if (!game) throw new Meteor.Error("Unable to find a game for msec");
  const update = { $set: {} };
  update.$set["clocks." + (data.color === "W" ? "white" : "black") + ".current"] = data.msec;
  Game.GameCollection.update({ _id: game._id, status: game.status }, update);
}

function my_game_result(data) {
  log.debug("my_game_result", data);
  Game.legacyGameEnded(
    data.message_identifier,
    data.gamenumber,
    data.become_examined,
    data.game_result_code,
    data.score_string2,
    data.description_string,
    data.ECO
  );
}

function my_game_ended(data) {
  log.debug("my_game_ended", data);
  const game = Game.GameCollection.findOne({ legacy_game_number: data.gamenumber });
  if (!game) throw new ICCMeteorError("Unable to end legacy game", "Game not found");
  Game.GameCollection.remove({ _id: game._id });
}

function my_game_started(data) {
  log.debug("my_game_started", data);
  Game.startLegacyGame(
    data.message_identifier,
    data.gamenumber,
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

function match(data) {
  log.debug("match", data);
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
}

function move(data) {
  log.debug("move", data);
  Game.saveLegacyMove(data.message_identifier, data.gamenumber, data.algebraic_move);
}

function fen(data) {
  log.debug("fen", data);
  Game.GameCollection.update(
    { legacy_game_number: data.gamenumber, status: "playing" },
    {
      $set: {
        fen: data.fenstring
      }
    }
  );
  // gamenumber
  // fenstring
}

function takeback(data) {
  //log.debug("takeback", data);
  const game = Game.GameCollection.findOne({ legacy_game_number: data.gamenumber });
  const variation = game.variations;
  const movelist = game.variations.movelist;
  if (!game) throw new Meteor.Error("Unable to find a game for takeback");
  if (variation.cmi < 1) {
    throw new Meteor.Error("Cannot takeback, at beginning of game");
  }

  variation.cmi = variation.movelist[variation.cmi].prev;
  movelist.pop();
  delete movelist[variation.cmi].variations;
  Game.GameCollection.update(
    { legacy_game_number: data.gamenumber, status: "playing" },
    {
      $set: { variations: { movelist: movelist, hmtb: variation.hmtb, cmi: variation.cmi } }
    }
  );
  const chess = new Chess.Chess();
  for (let i = 1; i < movelist.length; i++) {
    chess.move(movelist[i].move);
  }
  const newfen = chess.fen();
  //TODO: there must be a better way to update takeback on accept
  Game.GameCollection.update(
    { legacy_game_number: data.gamenumber, status: "playing" },
    {
      $set: {
        fen: newfen,
        pending: {
          white: {
            abort: game.pending.white.abort,
            draw: game.pending.white.draw,
            adjourn: game.pending.white.adjourn,
            takeback: {
              number: 0,
              mid: data.message_identifier
            }
          },
          black: {
            abort: game.pending.black.abort,
            draw: game.pending.black.draw,
            adjourn: game.pending.black.adjourn,
            takeback: {
              number: 0,
              mid: data.message_identifier
            }
          }
        }
      }
    }
  );
}

function offers_in_my_game(data) {
  log.debug("offers_in_my_game", data);
  //message_identifier: p.l1messageidentifier,
  //               gamenumber: parseInt(p2[0]),
  //               wdraw: p2[1] === "1",
  //               bdraw: p2[2] === "1",
  //               wadjourn: p2[3] === "1",
  //               badjourn: p2[4] === "1",
  //               wabort: p2[5] === "1",
  //               babort: p2[6] === "1",
  //               wtakeback: parseInt(p2[7]),
  //               btakeback: parseInt(p2[8]),
  let type = "?";
  if ((!!data.wabort && !data.babort) || (!data.wabort && !!data.babort)) {
    type = "abort_requested";
  }
  if (!!data.wdraw || !!data.bdraw) {
    type = "draw_requested";
  }
  if (data.wadjourn || data.badjourn) {
    type = "adjourn_requested";
  }
  if (
    (data.wtakeback === 1 && data.btakeback !== 1) ||
    (data.btakeback === 1 && data.wtakeback !== 1)
  ) {
    type = "takeback_requested";
  }
  const updated = Game.GameCollection.update(
    { "legacy.gamenumber": data.game_number, status: "playing" },
    {
      $set: {
        pending: {
          white: {
            abort: data.wabort ? "1" : "0",
            draw: data.wdraw ? "1" : "0",
            adjourn: data.wadjourn ? "1" : "0",
            takeback: {
              number: data.wtakeback,
              mid: data.wtakeback !== 0 ? data.message_identifier : 0
            }
          },
          black: {
            abort: data.babort ? "1" : "0",
            draw: data.bdraw ? "1" : "0",
            adjourn: data.badjourn ? "1" : "0",
            takeback: {
              number: data.btakeback,
              mid: data.btakeback !== 0 ? data.message_identifier : 0
            }
          }
        }
      },
      $push: {
        actions: {
          type: type,
          issuer: "server"
        }
      }
    }
  );
  log.debug("updated=" + updated);
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
    match: Meteor.bindEnvironment(match),
    match_removed: Meteor.bindEnvironment(match_removed),
    my_game_started: Meteor.bindEnvironment(my_game_started),
    my_game_result: Meteor.bindEnvironment(my_game_result),
    my_game_ended: Meteor.bindEnvironment(my_game_ended),
    msec: Meteor.bindEnvironment(msec),
    move: Meteor.bindEnvironment(move),
    offers_in_my_game: Meteor.bindEnvironment(offers_in_my_game),
    takeback: Meteor.bindEnvironment(takeback),
    fen: Meteor.bindEnvironment(fen)
  });
  this.userId = user._id;
  legacy_users[user._id].login();
};

LegacyUser.logout = function(user) {
  log.debug("logout", user);
  const legacy = legacy_users[typeof user === "string" ? user : user._id];
  if (!!legacy) {
    legacy.logout();
  }
};

LegacyUser.isLoggedOn = function(user) {
  log.debug("isLoggedOn", user);
  check(user, Match.OneOf(Object, String));

  const id = typeof user === "object" ? user._id : user;

  return id in legacy_users;
};

Meteor.startup(() => {
  Users.addLoginHook(user => {
    log.debug("User is in legacy_login role", Users.isAuthorized(user, "legacy_login"));
    if (user.status && user.status.legacy)
      Meteor.users.update({ _id: user._id }, { $unset: { "status.legacy": 1 } });

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

LegacyUser.requestToDraw = function(message_identifier, game_id) {
  log.debug("requestToDraw", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].draw(message_identifier, game_id);
  } else Game.requestLocalDraw(message_identifier, game_id);
};
LegacyUser.resignGame = function(message_identifier, game_id) {
  log.debug("resignGame", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].resign(message_identifier, Meteor.username);
  } else Game.resignLocalGame(message_identifier, game_id);
};
LegacyUser.requestToAdjourn = function(message_identifier, game_id) {
  log.debug("requestToAdjourn");
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].adjourn(message_identifier, game_id);
  } else Game.requestLocalAdjourn(message_identifier, game_id);
};
LegacyUser.declineAdjourn = function(message_identifier, game_id) {
  log.debug("declineAdjourn", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].decline(message_identifier, Meteor.username);
  } else Game.declineLocalAdjourn(message_identifier, game_id);
};
LegacyUser.acceptAdjourn = function(message_identifier, game_id) {
  log.debug("acceptAdjourn", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].adjourn(message_identifier, game_id);
  } else Game.acceptLocalAdjourn(message_identifier, game_id);
};

LegacyUser.acceptDraw = function(message_identifier, game_id) {
  log.debug("acceptDraw", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].draw(message_identifier, game_id);
  } else Game.acceptLocalDraw(message_identifier, game_id);
};
LegacyUser.declineDraw = function(message_identifier, game_id) {
  log.debug("declineDraw", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].decline(message_identifier, Meteor.username);
  } else Game.declineLocalDraw(message_identifier, game_id);
};
LegacyUser.requestToAbort = function(message_identifier, game_id) {
  log.debug("requestToAbort", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].abort(message_identifier);
  } else Game.requestLocalAbort(message_identifier, game_id);
};
LegacyUser.acceptAbort = function(message_identifier, game_id) {
  log.debug("acceptAbort", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].abort(message_identifier);
  } else Game.acceptLocalAbort(message_identifier, game_id);
};

LegacyUser.declineAbort = function(message_identifier, game_id) {
  log.debug("declineAbort", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].decline(message_identifier, Meteor.username);
  } else Game.declineLocalAbort(message_identifier, game_id);
};
LegacyUser.gameRequestAccept = function(message_identifier, game_id) {
  log.debug("gameRequestAccept", game_id);
  if (Meteor.userId() in legacy_users) {
    const request = GameRequests.collection.findOne({ _id: game_id });
    if (!request) {
      ClientMessages.sendMessageToClient(Meteor.user(), message_identifier, "?");
      return;
    }
    legacy_users[Meteor.userId()].accept(message_identifier, request.gamenumber);
  } else GameRequests.acceptMatchRequest(message_identifier, game_id);
};
LegacyUser.acceptTakeback = function(message_identifier, game_id) {
  log.debug("acceptTakeback", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].takeback(message_identifier);
  } else GameRequests.acceptLocalTakeback(message_identifier, game_id);
};
LegacyUser.requestTakeback = function(message_identitifer, game_id, number) {
  log.debug("requestTakeback", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].takeback(message_identitifer, number);
  } else Game.requestLocalTakeback(message_identitifer, game_id, number);
};
LegacyUser.declineTakeback = function(message_identifier, game_id) {
  log.debug("declineTakeback", game_id);
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].decline(message_identifier);
  } else Game.declineLocalTakeback(message_identifier, game_id);
};
LegacyUser.addGameMove = function(message_identifier, game_id, move) {
  log.debug("addGameMove", { game_id: game_id, move: move });
  if (Meteor.userId() in legacy_users) {
    legacy_users[Meteor.userId()].move(message_identifier, move);
  } else Game.saveLocalMove(message_identifier, game_id, move);
};
Meteor.methods({
  // eslint-disable-next-line meteor/audit-argument-checks
  gameRequestAccept: (message_identifier, game_id) =>
    LegacyUser.gameRequestAccept(message_identifier, game_id),
  // eslint-disable-next-line meteor/audit-argument-checks
  addGameMove: (message_identifier, game_id, move) =>
    LegacyUser.addGameMove(message_identifier, game_id, move)
});

Meteor.publishComposite("loggedOnUsers", {
  find() {
    return Meteor.users.find(
      { _id: this.userId, "status.online": true },
      { fields: { _id: 1, isolation_group: 1, "status.legacy": 1 } }
    );
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "show_users") || !!user.status.legacy)
          return Meteor.users.find({ _id: "0" });
        else {
          return Meteor.users.find(
            {
              $and: [
                { "status.online": true },
                { "status.legacy": { $ne: true } },
                { _id: { $ne: user._id } },
                { isolation_group: user.isolation_group }
              ]
            },
            { fields: viewable_logged_on_user_fields }
          );
        }
      }
    },
    {
      find(user) {
        if (!user.status.legacy) return LegacyUsersCollection.find({ _id: "0" });
        return LegacyUsersCollection.find();
      }
    }
  ]
});
