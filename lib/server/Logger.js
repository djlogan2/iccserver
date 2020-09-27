import fs from "fs";
import { Match, check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

let loggers = {
  root: 6
};

const valid_levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

const mongoLogger = new Mongo.Collection("logger");

Meteor.publish("logger", function() {
  return mongoLogger.find({ type: "config" });
});

export default mongoLogger;

class Logger {
  constructor(identifier) {
    check(identifier, String);
    this.identifier = identifier;
  }

  static _formatDate(date) {
    let d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }

  static _log(clientserver, identifier, level, message, data, userid) {
    check(clientserver, String);
    check(identifier, String);
    check(level, Number);
    check(message, String);
    check(userid, Match.Maybe(String));

    let cache = [];
    const duplicateChecker = (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (error) {
            return;
          }
        }
        cache.push(value);
      }
      return value;
    };

    if (!valid_levels[level]) level = valid_levels.length - 1;
    let now = new Date();
    let msg =
      "[" + clientserver + "]" + now.toString() + " [" + valid_levels[level] + "] " + identifier;

    if (userid) msg += " [" + userid + "]";

    msg += " " + message;

    if (data)
      try {
        msg += ": data=" + JSON.stringify(data, duplicateChecker);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }

    msg += "\n";

    fs.appendFile(`${Logger._formatDate(now)}`, msg, function() {});
    mongoLogger.insert({ date: now, msg: msg });

    // eslint-disable-next-line no-console
    if (Meteor.absoluteUrl() === "http://localhost:3000/" && !Meteor.isTest && !Meteor.isAppTest)
      console.log(msg);
  }

  // noinspection JSUnusedGlobalSymbols
  fatal(message, data, userid) {
    Logger._log("SERVER", this.identifier, 0, message, data, userid);
  }

  static _check(clientserver, identifier, level, message, data, userid) {
    let lvl = loggers[identifier] || loggers.root;
    if (lvl >= level) Logger._log(clientserver, identifier, level, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  error(message, data, userid) {
    Logger._check("SERVER", this.identifier, 1, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  warn(message, data, userid) {
    Logger._check("SERVER", this.identifier, 2, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  info(message, data, userid) {
    Logger._check("SERVER", this.identifier, 3, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  debug(message, data, userid) {
    Logger._check("SERVER", this.identifier, 4, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  trace(message, data, userid) {
    Logger._check("SERVER", this.identifier, 5, message, data, userid);
  }
}

class SetupLogger {
  // noinspection JSUnusedGlobalSymbols
  static addLogger(identifier, level) {
    if (valid_levels.indexOf(level.toUpperCase()) === -1)
      throw new Error("Level must be: " + valid_levels);
    loggers[identifier] = valid_levels.indexOf(level.toUpperCase());
    mongoLogger.upsert({ source: identifier }, { $set: { type: "config", level: level } });
  }

  // noinspection JSUnusedGlobalSymbols
  static addLoggers(map) {
    for (let k in map) {
      if (map.hasOwnProperty(k) && valid_levels.indexOf(map[k]) === -1)
        throw new Error("Level must be " + valid_levels + " for " + k);
    }
    for (let k in map) {
      if (map.hasOwnProperty(k)) {
        const lvl = valid_levels.indexOf(map[k].toUpperCase());
        loggers[k] = lvl;
        mongoLogger.upsert({ source: k }, { $set: { type: "config", level: lvl } });
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  static removeLogger(identifier) {
    if (identifier === "root") throw new Error("Cannot remove root level identifier");
    if (!loggers[identifier]) throw new Error(identifier + " is not currently a logger");
    delete loggers[identifier];
    mongoLogger.remove({ source: identifier });
  }

  // noinspection JSUnusedGlobalSymbols
  static getLogger(identifier) {
    if (!loggers[identifier]) throw new Error(identifier + " is not currently a logger");
    return valid_levels[loggers[identifier]];
  }

  // noinspection JSUnusedGlobalSymbols
  static getAllLoggers() {
    let map = {};
    for (let k in loggers) map[k] = valid_levels[loggers[k]];
    return map;
  }
}

Meteor.methods({
  log_to_file: function(identifier, level, message, data, userid) {
    check(identifier, String);
    check(level, Number);
    check(message, Match.Any); // Errors coming in from the client can be objects!
    check(data, Match.Any);
    check(userid, Match.Maybe(String));
    Logger._check("CLIENT", identifier, level, JSON.stringify(message), data, userid);
  }
});

export { Logger, SetupLogger };

Meteor.startup(() => {
  mongoLogger.remove({});
  mongoLogger.upsert({ source: "root" }, { $set: { type: "config", level: loggers.root } });
  // eslint-disable-next-line no-undef
  let json = Assets.getText("logger_configuration.json");
  if (json) {
    let parsed = JSON.parse(json);
    SetupLogger.addLoggers(parsed);
  }
  mongoLogger.find().observe({
    changed(newdoc) {
      loggers[newdoc.source] = newdoc.level;
    }
  });
});
