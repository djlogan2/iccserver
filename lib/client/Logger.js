import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";

let loggers = {
  root: 1
};

const valid_levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

class Logger {
  constructor(identifier) {
    check(identifier, String);
    this.identifier = identifier;
  }

  static _log(identifier, level, message, data, userid) {
    userid = userid || Meteor.userId();
    Meteor.call("log_to_file", identifier, level, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  fatal(message, data, userid) {
    Logger._log(this.identifier, message, data, userid);
  }

  static _check(identifier, level, message, data, userid) {
    var lvl = loggers[identifier] || loggers.root;
    if (lvl >= level) Logger._log(identifier, lvl, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  error(message, data, userid) {
    Logger._check(this.identifier, 1, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  warn(message, data, userid) {
    Logger._check(this.identifier, 2, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  info(message, data, userid) {
    Logger._check(this.identifier, 3, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  debug(message, data, userid) {
    Logger._check(this.identifier, 4, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  trace(message, data, userid) {
    Logger._check(this.identifier, 5, message, data, userid);
  }
}

// noinspection JSUnusedGlobalSymbols
class SetupLogger {
  /* noinspection JSUnusedGlobalSymbols*/
  static addLogger(identifier, level) {
    if (valid_levels.indexOf(level.toUpperCase()) === -1)
      throw new Error("Level must be: " + valid_levels);
    loggers[identifier] = valid_levels.indexOf(level.toUpperCase());
  }

  /* noinspection JSUnusedGlobalSymbols*/
  static addLoggers(map) {
    for (let k in map) {
      if (map.hasOwnProperty(k) && valid_levels.indexOf(map[k]) === -1)
        throw new Error("Level must be " + valid_levels + " for " + k);
    }
    for (let k in map) {
      if (map.hasOwnProperty(k))
        loggers[k] = valid_levels.indexOf(map[k].toUpperCase());
    }
  }

  // noinspection JSUnusedGlobalSymbols
  static removeLogger(identifier) {
    if (identifier === "root")
      throw new Error("Cannot remove root level identifier");
    if (!loggers[identifier])
      throw new Error(identifier + " is not currently a logger");
    delete loggers[identifier];
  }

  // noinspection JSUnusedGlobalSymbols
  static getLogger(identifier) {
    if (!loggers[identifier])
      throw new Error(identifier + " is not currently a logger");
    return valid_levels[loggers[identifier]];
  }

  // noinspection JSUnusedGlobalSymbols
  static getAllLoggers() {
    let map = {};
    for (let k in loggers) map[k] = valid_levels[loggers[k]];
    return map;
  }
}

// noinspection JSUnusedGlobalSymbols
export { Logger, SetupLogger };
