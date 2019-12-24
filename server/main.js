import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";
import { GameRequests } from "./GameRequest";

import firstRunUsers from "../imports/startup/server/firstRunUsers";
import firstRunCSS from "../imports/startup/server/firstRunCss";
import firstAddI18nMessage from "../imports/startup/server/firstI18nMessage";
import fs from "fs";

import "../imports/collections/css";
import "../imports/collections/users";
import "../lib/server/timestamp";

let log = new Logger("server/main_js");

const bound = Meteor.bindEnvironment(callback => {
  callback();
});

process.on("uncaughtException", (err, origin) => {
  bound(() => {
    fs.writeSync(process.stderr.fd, `Caught exception: ${err}\n` + `Exception origin: ${origin}`);
    console.log(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
    log.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
    process.exit(7);
  });
});

Meteor.startup(() => {
  firstRunCSS();
  firstRunUsers();
  firstAddI18nMessage();
});
