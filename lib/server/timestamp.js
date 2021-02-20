import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Logger } from "./Logger";
import { TimestampClient, TimestampServer } from "../Timestamp";
import { Users } from "../../imports/collections/users";
import { Singular } from "../../server/singular";

const log = new Logger("server/timestamp_js");
export const Timestamp = {};

const pingCollection = new Mongo.Collection("pingtable");
const connections = {};

Meteor.publishComposite("developer_pingtable", {
  find() {
    return Meteor.users.find({ _id: this.userId });
  },
  children: [
    {
      find(user) {
        if (!Users.isAuthorized(user, "developer")) return this.ready();
        return pingCollection.find();
      }
    }
  ]
});

Meteor.startup(() => {
  Meteor.setInterval(() => {
    const dt = new Date();
    dt.setMinutes(dt.getMinutes() - 5);
    pingCollection.remove({ last: { $lt: dt } });
    const remainder = pingCollection
      .find({ connection_id: { $in: Object.keys(connections) } }, { fields: { connection_id: 1 } })
      .fetch();
    for (const connection_id in connections) {
      if (!remainder.some(rec => rec.connection_id === connection_id)) {
        log.error("Left over ping array being deleted, connection_id=" + connection_id);
        connections[connection_id].server.end();
        delete connections[connection_id].server;
        delete connections[connection_id].client;
        delete connections[connection_id];
        Users.tryLogout(connection_id);
      }
    }
  }, 60000);

  Singular.addTask(() => {
    Meteor.setInterval(() => {
      const connection_id_array = pingCollection
        .find({}, { fields: { connection_id: 1 } })
        .fetch()
        .map(rec => rec.connection_id);
      Users.checkLoggedOnUsers(connection_id_array);
    }, 60000);
  });
});

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
