import { Meteor } from "meteor/meteor";
import { TimestampServer, TimestampClient } from "../Timestamp";
import { UserStatus } from "meteor/mizzao:user-status";
import { TimeSync } from "meteor/mizzao:timesync";

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
  // Meteor.directStream.onMessage(function messageHandler(message, sessionId, userId, connectionId, connection) {
  //   console.log(`message=${message}`);
  // });
  //protocol = JsonProtocol.getInstance();

  // protocol.on("ping", function(data) {
  //   client.pingArrived(data);
  // });
  // protocol.on("pong", function(data) {
  //   server.pongArrived(data);
  // });
  // protocol.on("pingresult", function(data) {
  //   client.resultArrived(data);
  // });

  server = new TimestampServer((key, msg) => {
    // console.log(`sending/1=${JSON.stringify({ key, msg })}`);
    // Meteor.directStream.send(JSON.stringify({ key, msg }));
  }, 60);

  client = new TimestampClient((key, msg) => {
    // console.log(`sending/1=${JSON.stringify({ key, msg })}`);
    // Meteor.directStream.send(JSON.stringify({ key, msg }));
  });
  //

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
