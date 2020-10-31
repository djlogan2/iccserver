import { DynamicRatings } from "./DynamicRatings";
import { Migrations } from "meteor/patelutsav:meteor-migrations";
import { Logger } from "../lib/server/Logger";

const log = new Logger("server/migrations");

function migrationLogger(opts) {
  switch (opts.level) {
    case "info":
      log.info(opts.message);
      break;
    case "warn":
      log.warn(opts.message);
      break;
    case "error":
      log.error(opts.message);
      break;
    case "debug":
      log.debug(opts.message);
      break;
    default:
      log.error("Unknown opts.level", opts);
      break;
  }
}

Meteor.startup(() => {
  Migrations.config({
    logger: migrationLogger,
    log: true,
    logIfLatest: true,
    stopIfOldVersionScriptAdded: true,
    stopIfOldVersionScriptUpdated: true
  });
  Migrations.add({
    version: "0.2.0_1",
    name: "Remove rated/unrated from dynamic_ratings table",
    run: () => {
      DynamicRatings.collection.update({}, { $unset: { rated: 1, unrated: 1 } }, { multi: true });
    }
  });
  Migrations.migrateTo("latest");
});