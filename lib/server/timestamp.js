import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Logger } from "./Logger";
import { TimestampClient, TimestampServer } from "../Timestamp";
import { Users } from "../../imports/collections/users";

const log = new Logger("server/timestamp_js");
export const Timestamp = {};

const pingCollection = new Mongo.Collection("pingtable");
const connections = {};

Timestamp.averageLag = function(user_or_connection_id) {
  check(user_or_connection_id, String);
  if (!connections[user_or_connection_id]) {
    const users_connection_id = Users.getConnectionFromUser(user_or_connection_id);
    if (!connections[users_connection_id]) {
      log.error("Unable to retrieve average lag for connection " + user_or_connection_id);
      return 0;
    }
    return connections[users_connection_id].server.averageLag() | 0;
  }
  return connections[user_or_connection_id].server.averageLag() | 0;
};

Timestamp.pingTime = function(user_or_connection_id) {
  check(user_or_connection_id, String);
  if (user_or_connection_id === "computer") return 0;
  if (!connections[user_or_connection_id]) {
    const users_connection_id = Users.getConnectionFromUser(user_or_connection_id);
    if (!connections[users_connection_id]) {
      log.error("Unable to retrieve ping time for connection " + user_or_connection_id);
      return 0;
    }
    return connections[users_connection_id].server.lastPing();
  }
  return connections[user_or_connection_id].server.lastPing();
};

// eslint-disable-next-line no-undef
const protocol = JsonProtocol.getInstance();

Meteor.startup(function() {
  protocol.on(
    "ping",
    Meteor.bindEnvironment((message, connection_id) => {
      if (!connections[connection_id]) return;
      connections[connection_id].client.pingArrived(message);
    })
  );

  protocol.on(
    "pong",
    Meteor.bindEnvironment((message, connection_id) => {
      if (!connections[connection_id]) return;
      connections[connection_id].server.pongArrived(message);
    })
  );

  protocol.on(
    "pingresult",
    Meteor.bindEnvironment((message, connection_id) => {
      Meteor.defer(() => {
        pingCollection.upsert(
          { connection_id: connection_id },
          { $push: { pings: message.delay }, $set: { last: new Date() } }
        );
      });
    })
  );

  Meteor.onConnection(function(connection) {
    log.debug("connection established for connection id " + connection.id);
    const ts_server = new TimestampServer(
      new Logger("server/timestamp_js"),
      "server/timestamp",
      (key, msg) => {
        protocol.send(key, msg, connection.id);
      },
      null,
      60
    );
    const ts_client = new TimestampClient(
      new Logger("server/timestamp_js"),
      "lib/server",
      (key, msg) => {
        protocol.send(key, msg, connection.id);
      }
    );
    connections[connection.id] = { server: ts_server, client: ts_client };
    connection.onClose(function() {
      log.debug("connection closed for connection id " + connection.id);
      connections[connection.id].server.end();
      delete connections[connection.id].server;
      delete connections[connection.id].client;
      delete connections[connection.id];
      pingCollection.remove({ connection_id: connection.id });
      Users.tryLogout(connection.id);
    });
  });
});
