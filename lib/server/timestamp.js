import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Users } from "../../imports/collections/users";
import { Logger } from "./Logger";
import { TimestampClient, TimestampServer } from "../Timestamp";

let log = new Logger("server/timestamp_js");
let sessions = {};
let users = {};
export const Timestamp = {};

Timestamp.averageLag = function(userid) {
  check(userid, String);
  if (!users[userid])
    throw new Meteor.Error("Unable to retrieve average lag for user " + userid, "User not found");

  const sessionid = users[userid];
  if (!sessions[sessionid])
    throw new Meteor.Error(
      "Unable to retrieve average lag for user " + userid,
      "Session not found"
    );
  // DOUBT: In the object of sessions[sessionid], there is not direct function of averageLag but it is inside either of client
  // or server, you can look at the below log (I HAVE WRITTEN 'console.log' since 'log.debug' is not working here)
  // so, I have changed you function calling 'sessions[sessionid].server.averageLag()' instead of 'sessions[sessionid].averageLag()'
  //console.log(sessions[sessionid]);
  return sessions[sessionid].server.averageLag();
};

Timestamp.pingTime = function(userid) {
  check(userid, String);
  if (!users[userid])
    throw new Meteor.Error("Unable to retrieve average lag for user " + userid, "User not found");

  const sessionid = users[userid];
  if (!sessions[sessionid])
    throw new Meteor.Error(
      "Unable to retrieve average lag for user " + userid,
      "Session not found"
    );
  // DOUBT: In the object of sessions[sessionid], there is not direct function of averageLag but it is inside either of client
  // or server, you can look at the below log (I HAVE WRITTEN 'console.log' since 'log.debug' is not working here)
  // so, I have changed you function calling 'sessions[sessionid].server.lastPing()' instead of 'sessions[sessionid].lastPing()'
  //console.log(sessions[sessionid]);
  return sessions[sessionid].server.lastPing();
};

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  const protocol = JsonProtocol.getInstance();

  protocol.on(
    "ping",
    Meteor.bindEnvironment((message, sessionId) => {
      if (!sessions[sessionId]) throw new Meteor.Error("Unable to find session id");
      sessions[sessionId].client.pingArrived(message);
    })
  );

  protocol.on(
    "pong",
    Meteor.bindEnvironment((message, sessionId) => {
      if (!sessions[sessionId]) throw new Meteor.Error("Unable to find session id");
      sessions[sessionId].server.pongArrived(message);
    })
  );

  protocol.on(
    "pingresult",
    Meteor.bindEnvironment(message => {
//      console.log("ping result");
//      console.log(message);
    })
  );

  Users.addLoginHook(function(user, connection) {
    const sessionid = connection.id;
    users[user._id] = sessionid;
    const ts_server = new TimestampServer(
      (key, msg) => {
        protocol.send(key, msg, sessionid);
      },
      () => {
        log.error("User " + user._id + " is lagging!");
      },
      60
    );
    const ts_client = new TimestampClient((key, msg) => {
      protocol.send(key, msg, sessionid);
    });
    sessions[sessionid] = { server: ts_server, client: ts_client };
  });

  Users.addLogoutHook(function(userId) {
    if (!users[userId]) throw new Meteor.Error("We cannot find a user for timestamp logout hook");
    const sessionid = users[userId];
    if (!sessionid) throw new Meteor.Error("We cannot find a session id for timestamp logout hook");
    sessions[sessionid].server.end();
    delete sessions[sessionid].server;
    delete sessions[sessionid].client;
    delete sessions[sessionid];
    delete users[userId];
  });
});
