import { Meteor } from "meteor/meteor";
import { TimestampServer, TimestampClient } from "../Timestamp";
import { UserStatus } from "meteor/mizzao:user-status";
import { TimeSync } from "meteor/mizzao:timesync";

let protocol;

let server;
let client;

export function getMilliseconds() {
  return server.getMilliseconds();
}

export function serverTS() {
  return server;
}
export function clientTS() {
  return client;
}

Meteor.startup(function() {
  // eslint-disable-next-line no-undef
  protocol = JsonProtocol.getInstance();

  protocol.on("ping", function(data) {
    client.pingArrived(data);
  });
  protocol.on("pong", function(data) {
    server.pongArrived(data);
  });
  protocol.on("pingresult", function(data) {
    client.resultArrived(data);
  });

  server = new TimestampServer((key, msg) => {
    protocol.send(key, msg);
  }, 60);

  //
  client = new TimestampClient((key, msg) => {
    protocol.send(key, msg);
  });

  Tracker.autorun(() => {
    const loggedIn = !!TimeSync.isSynced() && !!Meteor.userId();
    if (loggedIn && !UserStatus.isMonitoring()) UserStatus.startMonitor();
    else if (!loggedIn && UserStatus.isMonitoring()) UserStatus.stopMonitor();

    if (Meteor.status().connected) {
      server.connected();
    } else {
      server.disconnected();
    }
  });
});
