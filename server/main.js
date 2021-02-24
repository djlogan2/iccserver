import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";
import "./PgnExport";
import "./engine_manager";
//import "./awsmanager";
import "./Book";
import "./PgnImport";

import fs from "fs";

import "../server/Chat";
import "../server/Game";
import "../server/GameRequest";
import "../imports/collections/css";
import "../imports/collections/clientInternationalization";
import "../imports/collections/users";
import "../lib/server/timestamp";
import "../server/Chat";
import "../server/migrations";
import "../server/clientCollection";
//??
import current_release from "../imports/startup/release";
import firstRunUsers from "../imports/startup/server/firstRunUsers";
import firstRunCSS from "../imports/startup/server/firstRunCss";
import firstRunClientInternationalization from "../imports/startup/server/firstRunClientInternationalization";

const log = new Logger("server/main_js");

const bound = Meteor.bindEnvironment(callback => {
  callback();
});

process.on("uncaughtException", (err, origin) => {
  bound(() => {
    fs.writeSync(process.stderr.fd, `Caught exception: ${err}\nException origin: ${origin}`);
    // eslint-disable-next-line no-console
    console.log(`Caught exception: ${err}\nException origin: ${origin}`);
    log.error(`Caught exception: ${err}\nException origin: ${origin}`);
    process.exit(7);
  });
});

Meteor.startup(() => {
  firstRunCSS();
  firstRunUsers();
  firstRunClientInternationalization();

  Meteor.methods({
    current_release: () => current_release.current_release.release,
    current_commit: () => current_release.current_release.commit
  });

});
