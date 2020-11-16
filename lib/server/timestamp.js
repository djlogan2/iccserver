import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Users } from "../../imports/collections/users";
import { Logger } from "./Logger";
import { TimestampClient, TimestampServer } from "../Timestamp";

const log = new Logger("server/timestamp_js");
let sessions = {};
let users = {};
export const Timestamp = {};

const pingCollection = new Mongo.Collection("pingtable");

const savePing = Meteor.defer(ping => {
  pingCollection.insert(ping);
});

Timestamp.averageLag = function(userid) {
  check(userid, String);
  if (!users[userid]) {
    log.error("Unable to retrieve average lag for user " + userid);
    return 0;
  }

  const sessionid = users[userid];
  if (!sessions[sessionid]) {
    log.error("Unable to retrieve average lag for user " + userid);
    return 0;
  }
  return sessions[sessionid].server.averageLag() | 0;
};

Timestamp.pingTime = function(userid) {
  check(userid, String);
  if (userid === "computer") return 0;
  if (!users[userid]) {
    log.error("Unable to retrieve average lag for user " + userid);
    return 0;
  }

  const sessionid = users[userid];
  if (!sessions[sessionid]) {
    log.error("Unable to retrieve ping time for user " + userid);
    return 0;
  }
  return sessions[sessionid].server.lastPing();
};

function deleteUser(userId) {
  log.debug("Deleting user " + userId);
  if (userId === "computer") return;
  if (!users[userId]) {
    log.error("We cannot find a user for timestamp logout hook: " + userId);
    return;
  }
  const sessionid = users[userId];
  if (!sessionid) {
    log.error("We cannot find a session id for timestamp logout hook: " + userId);
    return;
  }
  if (!sessions[sessionid]) {
    log.error("We cannot find a session object for timestamp logout hook: " + userId);
    return;
  }
  savePing({
    type: "logout",
    userid: userId,
    sessionId: sessionid,
    mark: new Date()
  });
  sessions[sessionid].server.end();
  delete sessions[sessionid].server;
  delete sessions[sessionid].client;
  delete sessions[sessionid];
  delete users[userId];
}

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  const protocol = JsonProtocol.getInstance();

  protocol.on(
    "ping",
    Meteor.bindEnvironment((message, sessionId) => {
      if (!sessions[sessionId]) return;
      savePing({
        type: "ping",
        sessionId: sessionId,
        message: message,
        mark: new Date()
      });
      sessions[sessionId].client.pingArrived(message);
    })
  );

  protocol.on(
    "pong",
    Meteor.bindEnvironment((message, sessionId) => {
      if (!sessions[sessionId]) return;
      savePing({
        type: "pong",
        sessionId: sessionId,
        message: message,
        mark: new Date()
      });
      sessions[sessionId].server.pongArrived(message);
    })
  );

  protocol.on(
    "pingresult",
    Meteor.bindEnvironment((message, sessionId) => {
      savePing({
        type: "pingresult",
        sessionId: sessionId,
        message: message,
        mark: new Date()
      });
    })
  );

  Users.addLoginHook(function(user, connection) {
    //
    // A user may already be logged in but changes session id by way of hitting browser reload/refresh.
    // Don't completely redo this, just change the session id
    //
    if (users[user._id]) {
      const new_session = connection.id;
      const old_session = users[user._id];
      savePing({
        type: "reconnect",
        userid: user._id,
        sessionId: new_session,
        old_session: old_session,
        mark: new Date()
      });
      sessions[new_session] = sessions[old_session];
      delete sessions[old_session];
      users[user._id] = new_session;
      return;
    }

    users[user._id] = connection;
    savePing({
      type: "login",
      userid: user._id,
      sessionId: connection,
      mark: new Date()
    });
    const ts_server = new TimestampServer(
      new Logger("server/timestamp_js"),
      "server/timestamp",
      (key, msg) => {
        try {
          protocol.send(key, msg, users[user._id]);
        } catch (e) {
          log.error(e.toString());
          if (sessions[connection]) {
            if (sessions[connection].server) {
              sessions[connection].server.end();
              delete sessions[connection].server;
            }
            if (sessions[connection].client) delete sessions[connection].client;
            delete sessions[connection];
          }
        }
      },
      () => log.debug("User " + user._id + " is lagging!"),
      60
    );
    const ts_client = new TimestampClient(
      new Logger("server/timestamp_js"),
      "lib/server",
      (key, msg) => {
        protocol.send(key, msg, users[user._id]);
      }
    );
    sessions[connection] = { server: ts_server, client: ts_client };
  });

  Users.addLogoutHook(function(userId) {
    deleteUser(userId);
  });
});
