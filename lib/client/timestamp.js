import { Meteor } from "meteor/meteor";
import { TimestampServer, TimestampClient } from "../Timestamp";
import { Logger } from "./Logger";
import { UserStatus } from "meteor/mizzao:user-status";
import { TimeSync } from "meteor/mizzao:timesync";

let protocol;

let server;
let client;

export function getMilliseconds() {
  return server.getMilliseconds();
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

  server = new TimestampServer(
    new Logger("client/timestamp_js"),
    "client/timestamp",
    (key, msg) => {
      protocol.send(key, msg);
    },
    () => {
      console.log("We are lagging!");
    },
    60
  );

  //
  client = new TimestampClient(
    new Logger("client/timestamp_js"),
    "client/timestamp_js",
    (key, msg) => {
      protocol.send(key, msg);
    }
  );

  Tracker.autorun(() => {
    const loggedIn = !!TimeSync.isSynced() && !!Meteor.userId();
    if (loggedIn) UserStatus.startMonitor();
    else if (UserStatus.isMonitoring()) UserStatus.stopMonitor();
  });
});
