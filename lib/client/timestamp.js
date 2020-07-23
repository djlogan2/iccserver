import { Meteor } from "meteor/meteor";
import { TimestampServer, TimestampClient } from "../Timestamp";
import { Logger } from "./Logger";

let protocol;

let server;
let client;

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
});
