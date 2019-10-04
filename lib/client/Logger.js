import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Tracker } from "meteor/tracker";

const valid_levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
let loggers;
const mongoLogger = new Mongo.Collection("logger");

Meteor.startup(() => {
  Meteor.subscribe("logger");
  Tracker.autorun(() => {
    const records = mongoLogger.find().fetch();
    loggers = {};
    records.forEach(r => {
      loggers[r.source] = r.level;
    });
  });
});

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
export { Logger };
