import { DynamicRatings } from "./DynamicRatings";
import { Migrations } from "meteor/patelutsav:meteor-migrations";
import { Logger } from "../lib/server/Logger";
import { Game, GameHistory } from "./Game";
import { templateCollection } from "./Tournament";
import { english } from "./defaultInternationalization/english";
import mongoClientInternationalization from "../imports/collections/clientInternationalization";
import mongoCss from "../imports/collections/css";
import leftSideBarCss from "./defaultStyles/leftSideBarCss";

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
  Migrations.add({
    version: "0.2.0_2",
    name: "Update ratings from game history",
    run: () => {
      const games = GameHistory.collection
        .find({ rated: true }, { sort: { "actions.date": 1 } })
        .fetch();
      games.forEach(game => Game.updateUserRatings(game, game.result, game.status2));
    }
  });
  Migrations.add({
    version: "0.2.0_3",
    name: "Create index for Template collection",
    run: () => {
      templateCollection.rawCollection().createIndex({ "record.name": 1, "record.scope": 1 });
    }
  });
  Migrations.add({
    version: "0.2.0_4",
    name: "Update client i18n for en locales",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_5",
    name: "Update client i18n for en locales v 0.2",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_6",
    name: "Update client i18n for en locales v 0.3",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_7",
    name: "Update client i18n for en locales v 0.4",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_8",
    name: "Update client i18n for en locales v 0.5",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_9",
    name: "Update client i18n for en locales v 0.6",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_10",
    name: "Update client css for left side bar",
    run: () => {
      mongoCss.update({ type: "leftSideBar" }, { $set: leftSideBarCss });
    }
  });

  Migrations.add({
    version: "0.2.0_11",
    name: "Update client i18n for en locales v 0.7",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_12",
    name: "Update client i18n for en locales v 0.8",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.add({
    version: "0.2.0_13",
    name: "Update client i18n for en locales v 0.9",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    }
  });

  Migrations.unlock();

  Migrations.migrateTo("latest");
});
