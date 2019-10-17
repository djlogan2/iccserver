import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";

import firstRunUsers from "../imports/startup/server/firstRunUsers";
import firstRunCSS from "../imports/startup/server/firstRunCss";

import "../imports/collections/css";
import "../imports/collections/users";
import "../lib/server/timestamp";

let log = new Logger("server/main_js");

const bound = Meteor.bindEnvironment(callback => {
  callback();
});

process.on("uncaughtException", err => {
  bound(() => {
    log.error("Server Crashed!", err);
    console.error(err.stack);
    process.exit(7);
  });
});

Meteor.startup(() => {
  firstRunCSS();
  firstRunUsers();
});
