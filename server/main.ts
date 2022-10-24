import { Meteor } from "meteor/meteor";
import { Logger } from "../lib/server/Logger";
import "../imports/server/PgnExport";
import "../imports/server/local_engine_manager";
import "../imports/server/Book";
import "../imports/server/PgnImport";

import fs from "fs";

import "../imports/server/Chat";
import "../imports/server/Game";
import "../imports/server/GameRequest";
import "../imports/collections/css";
import "../imports/collections/clientInternationalization";
import "../imports/collections/users";
import "../lib/server/timestamp";
import "../imports/server/migrations";
import "../server/clientCollection";
import "../lib/server/userfiles";
import "../lib/server/mugshots";
import "../imports/server/okendpoint";
import "../imports/server/api";
//??
import { current_release } from "../imports/startup/release";
import firstRunUsers from "../imports/startup/server/firstRunUsers";
import firstRunCSS from "../imports/startup/server/firstRunCss";
import firstRunClientInternationalization from "../imports/startup/server/firstRunClientInternationalization";
import firstRunEcocodes from "../imports/startup/server/firstRunEcocodes";
import firstRunStatics from "../imports/startup/server/firstRunStatics";

const log = new Logger("server/main_js");

if (!Meteor.isTest && !Meteor.isAppTest) {
  const bound = Meteor.bindEnvironment((callback: () => void) => {
    callback();
  });

  process.on("uncaughtExceptionMonitor", (err: Error, origin) => {
    bound(() => {
      fs.writeSync(process.stderr.fd, `Uncaught exception: ${err}\nException origin: ${origin}`);
      // eslint-disable-next-line no-console
      console.log(`Uncaught exception: ${err}\nException origin: ${origin}`);
      log.error(`Uncaught exception: ${err}\nException origin: ${origin}`);
      //process.exit(7);
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    bound(() => {
      fs.writeSync(process.stderr.fd, `Uncaught rejection: ${promise}\nReason: ${reason}`);
      // eslint-disable-next-line no-console
      console.log(`Uncaught rejection: ${promise}\nReason: ${reason}`);
      log.error(`Uncaught rejection: ${promise}\nReason: ${reason}`);
      //process.exit(7);
    });
  });
  /*
  process.on("multipleResolves", (type, promise, reason) => {
    bound(() => {
      fs.writeSync(
        process.stderr.fd,
        `Uncaught multiple resolve: ${type}\nPromise: ${promise}\nReason: ${reason}`
      );
      // eslint-disable-next-line no-console
      console.log(`Uncaught multiple resolve: ${type}\nPromise: ${promise}\nReason: ${reason}`);
      log.error(`Uncaught multiple resolve: ${type}\nPromise: ${promise}\nReason: ${reason}`);
      //process.exit(7);
    });
  });
*/
  process.on("warning", (warning: Error) => {
    bound(() => {
      fs.writeSync(
        process.stderr.fd,
        `Node emitted warning, name: ${warning.name}\nMessage: ${warning.message}\nStack: ${warning.stack}`
      );
      // eslint-disable-next-line no-console
      console.log(
        `Node emitted warning, name: ${warning.name}\nMessage: ${warning.message}\nStack: ${warning.stack}`
      );
      log.error(
        `Node emitted warning, name: ${warning.name}\nMessage: ${warning.message}\nStack: ${warning.stack}`
      );
      //process.exit(7);
    });
  });
}

Meteor.startup(() => {
  firstRunCSS();
  firstRunUsers();
  firstRunClientInternationalization();
  firstRunEcocodes();
  firstRunStatics();

  Meteor.methods({
    current_release: () => current_release.release,
    current_commit: () => current_release.commit,
  });
});
