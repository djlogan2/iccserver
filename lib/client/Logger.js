import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Tracker } from "meteor/tracker";

const axios = require("axios");

const FATAL = 0;
const ERROR = 1;
const WARN = 2;
const INFO = 3;
const DEBUG = 4;
const TRACE = 5;
let loggers = {};
const mongoLogger = new Mongo.Collection("logger");

Meteor.startup(() => {
  Tracker.autorun(() => {
    const records = mongoLogger.find().fetch();
    records.forEach((r) => {
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
    Meteor.defer(() => Meteor.call("log_to_file", identifier, level, message, data, userid));
  }

  // noinspection JSUnusedGlobalSymbols
  fatal(message, data, userid) {
    Logger._log(this.identifier, FATAL, message, data, userid);
  }

  static _check(identifier, level, message, data, userid) {
    var lvl = loggers[identifier] || loggers.root || DEBUG;
    if (lvl >= level) Logger._log(identifier, level, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  error(message, data, userid) {
    Logger._check(this.identifier, ERROR, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  warn(message, data, userid) {
    Logger._check(this.identifier, WARN, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  info(message, data, userid) {
    Logger._check(this.identifier, INFO, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  debug(message, data, userid) {
    Logger._check(this.identifier, DEBUG, message, data, userid);
  }

  // noinspection JSUnusedGlobalSymbols
  trace(message, data, userid) {
    Logger._check(this.identifier, TRACE, message, data, userid);
  }
}

// noinspection JSUnusedGlobalSymbols
export { Logger };
