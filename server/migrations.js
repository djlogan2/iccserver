import { DynamicRatings } from "./DynamicRatings";
import { Migrations } from "meteor/patelutsav:meteor-migrations";
import { Logger } from "../lib/server/Logger";
import { GameHistory } from "./Game";
import { english } from "./defaultInternationalization/english";
import mongoClientInternationalization from "../imports/collections/clientInternationalization";
import clientInternationalization from "../imports/collections/clientInternationalization";
import mongoCss from "../imports/collections/css";
import leftSideBarCss from "./defaultStyles/leftSideBarCss";
import challengeNotificationCss from "./defaultStyles/challengeNotificationCss";
import profileCss from "./defaultStyles/profileCss";
import userManagementCss from "./defaultStyles/userManagementCss";
import commandsCss from "./defaultStyles/commandsCss";
import { templateCollection } from "./tournament/Tournament";

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
    stopIfOldVersionScriptUpdated: true,
  });
  Migrations.add({
    version: "0.2.0_1",
    name: "Remove rated/unrated from dynamic_ratings table",
    run: () => {
      DynamicRatings.collection.update({}, { $unset: { rated: 1, unrated: 1 } }, { multi: true });
    },
  });
  Migrations.add({
    version: "0.2.0_2",
    name: "Update ratings from game history",
    run: () => {
      const games = GameHistory.collection
        .find({ rated: true }, { sort: { "actions.date": 1 } })
        .fetch();
      games.forEach((game) => Game.updateUserRatings(game, game.result, game.status2));
    },
  });
  Migrations.add({
    version: "0.2.0_3",
    name: "Create index for Template collection",
    run: () => {
      templateCollection.rawCollection().createIndex({ "record.name": 1, "record.scope": 1 });
    },
  });
  Migrations.add({
    version: "0.2.0_4",
    name: "Update client i18n for en locales",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_5",
    name: "Update client i18n for en locales v 0.2",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_6",
    name: "Update client i18n for en locales v 0.3",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_7",
    name: "Update client i18n for en locales v 0.4",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_8",
    name: "Update client i18n for en locales v 0.5",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_9",
    name: "Update client i18n for en locales v 0.6",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_10",
    name: "Update client css for left side bar",
    run: () => {
      mongoCss.update({ type: "leftSideBar" }, { $set: leftSideBarCss });
    },
  });

  Migrations.add({
    version: "0.2.0_11",
    name: "Update client i18n for en locales v 0.7",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_12",
    name: "Update client i18n for en locales v 0.8",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_13",
    name: "Update client i18n for en locales v 0.9",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_14",
    name: "Add client css for challenge notifications",
    run: () => {
      mongoCss.update(
        { cssKey: "default" },
        { challengeNotificationCss: challengeNotificationCss }
      );
    },
  });

  Migrations.add({
    version: "0.2.0_15",
    name: "Update client i18n for en locales v 0.10",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_16",
    name: "Add client css for game status",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { leftSideBarCss: leftSideBarCss });
    },
  });

  Migrations.add({
    version: "0.2.0_17",
    name: "Update client i18n for en locales v 0.10",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.2.0_18",
    name: "Update client css for challenge notifications",
    run: () => {
      mongoCss.update(
        { cssKey: "default" },
        { challengeNotificationCss: challengeNotificationCss }
      );
    },
  });

  Migrations.add({
    version: "0.3.2_1",
    name: "Update client css for profile",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { profileCss: profileCss });
    },
  });

  Migrations.add({
    version: "0.3.2_2",
    name: "Update client i18n for en locales v 0.11",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.2_3",
    name: "Update client i18n for en locales v 0.12",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.2_4",
    name: "Update client css for user management",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { userManagementCss });
    },
  });

  Migrations.add({
    version: "0.3.2_5",
    name: "Update client i18n for en locales v 0.13",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.2_6",
    name: "Update client i18n for en locales v 0.14",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.2_7",
    name: "Update client css for user management",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { userManagementCss });
    },
  });

  Migrations.add({
    version: "0.3.2_8",
    name: "Update client i18n for en locales v 0.15",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.2_9",
    name: "Update client css for user management",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { userManagementCss });
    },
  });

  Migrations.add({
    version: "0.3.4_1",
    name: "Update client css default key",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { $set: { cssKey: "development" } });
    },
  });

  Migrations.add({
    version: "0.3.16_1",
    name: "Update client css default key",
    run: () => {
      clientInternationalization.update(
        {},
        {
          $set: {
            "i18n.Common.menuLinkLabel.last_ping": "Last ping",
            "i18n.Common.menuLinkLabel.average_lag": "Average lag",
          },
        }
      );
    },
  });

  Migrations.add({
    version: "0.3.16_2",
    name: "Update client css for commands ui",
    run: () => {
      mongoCss.update({ cssKey: "default" }, { commandsCss });
    },
  });

  Migrations.add({
    version: "0.3.16_3",
    name: "Update client i18n for en locales v 0.16",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.16_4",
    name: "Update client i18n for en locales v 0.17",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.16_5",
    name: "Update client i18n for en locales v 0.18",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.16_6",
    name: "Update client i18n for en locales v 0.19",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.16_7",
    name: "Update client i18n for en locales v 0.20",
    run: () => {
      mongoClientInternationalization.update({ locale: "en-us" }, { $set: { i18n: english } });
    },
  });

  Migrations.add({
    version: "0.3.30_1",
    name: "Remove ecocodes from game and game_history collection",
    run: () => {
      Game.GameCollection.update({ status: "playing" }, { $unset: { "variations.ecocodes": 1 } });
      Game.GameCollection.update({ status: "examining" }, { $unset: { "variations.ecocodes": 1 } });
      GameHistory.collection.update({}, { $unset: { "variations.ecocodes": 1 } });
    },
  });
  /*
  Migrations.add({
    version: "",
    name: "",
    run: () => {
      const chess = new Chess();


      function addSmithToMove(variations, cmi) {
        const move = variations.movelist[cmi];
        const next = variations.movelist[cmi].variations;
        const result = chess.move(move.move);
        variations.movelist[cmi].smith = { piece: result.piece, color: result.color, from: result.from, to: result.to, promotion: result.promotion };

        for(let x = 0 ; x < next.length ; x++) {
          addSmithToMove(variations, next);
          chess.undo();
        }
      }
    }
  });
*/
  Migrations.unlock();

  Migrations.migrateTo("latest");
});
