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

function startConnection(connection_id) {
  if (!connections[connection_id]) {
    const ts_server = new TimestampServer(
      (key, msg) => {
        protocol.send(key, msg, connection_id);
      },
      null,
      60
    );
    const ts_client = new TimestampClient((key, msg) => {
      protocol.send(key, msg, connection_id);
    });
    connections[connection_id] = { server: ts_server, client: ts_client };
    Meteor.defer(() => {
      pingCollection.upsert(
        { connection_id: connection_id },
        { $set: { client_pings: [], server_pings: [], last: new Date() } }
      );
    });
  } else log.error("Starting already started connection " + connection_id);
}

function stopConnection(connection_id) {
  if (!!connections[connection_id]) {
    connections[connection_id].server.end();
    delete connections[connection_id].server;
    delete connections[connection_id].client;
    delete connections[connection_id];
  } else log.error("Stopping non-existent connection " + connection_id);
  Users.tryLogout(connection_id);
}

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
        log.error("Left over ping array needs to be deleted, connection_id=" + connection_id);
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
  if (!user_or_connection_id || user_or_connection_id === "computer") return 0;
  let pingRecord = pingCollection.findOne({ connection_id: user_or_connection_id });
  if (!pingRecord) {
    const users_connection_id = Users.getConnectionFromUser(user_or_connection_id);
    pingRecord = pingCollection.findOne({ connection_id: users_connection_id });
    if (!pingRecord) {
      log.error("Unable to retrieve average lag for connection " + user_or_connection_id);
      return 0;
    }
  }
  const last60 = pingRecord.server_pings.slice(Math.max(pingRecord.server_pings.length - 60, 0));
  if (!last60.length) return 0;
  return Math.round(last60.reduce((a, b) => a + b, 0) / last60.length);
};

Timestamp.pingTime = function(user_or_connection_id) {
  check(user_or_connection_id, String);
  if (!user_or_connection_id || user_or_connection_id === "computer") return 0;
  let pingRecord = pingCollection.findOne({ connection_id: user_or_connection_id });
  if (!pingRecord) {
    const users_connection_id = Users.getConnectionFromUser(user_or_connection_id);
    pingRecord = pingCollection.findOne({ connection_id: users_connection_id });
    if (!pingRecord) {
      log.error("Unable to retrieve ping time for connection " + user_or_connection_id);
      return 0;
    }
  }
  return pingRecord.server_pings[pingRecord.server_pings.length - 1];
};

// eslint-disable-next-line no-undef
const protocol = JsonProtocol.getInstance();

Meteor.startup(function() {
  protocol.on(
    "ping",
    Meteor.bindEnvironment((message, connection_id) => {
      if (!connections[connection_id]) startConnection(connection_id);
      connections[connection_id].client.pingArrived(message);
    })
  );

  protocol.on(
    "pong",
    Meteor.bindEnvironment((message, connection_id) => {
      if (!connections[connection_id]) startConnection(connection_id);
      const result = connections[connection_id].server.pongArrived(message);
      Meteor.defer(() => {
        pingCollection.upsert(
          { connection_id: connection_id },
          { $push: { server_pings: result.delay }, $set: { last: new Date() } }
        );
      });
    })
  );

  protocol.on(
    "pingresult",
    Meteor.bindEnvironment((message, connection_id) => {
      Meteor.defer(() => {
        pingCollection.upsert(
          { connection_id: connection_id },
          { $push: { client_pings: message.delay }, $set: { last: new Date() } }
        );
      });
    })
  );

  Meteor.onConnection(function(connection) {
    startConnection(connection.id);
    connection.onClose(function() {
      stopConnection(connection.id);
      pingCollection.remove({ connection_id: connection.id });
    });
  });
});
