import fs from "fs";
import {Match, check} from "meteor/check";

let loggers = {
    root: 1
};

const valid_levels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

class Logger {
    constructor(identifier) {
        check(identifier, String);
        this.identifier = identifier;
    }

    static _formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    _log(level, message, data, userid) {
        check(level, Number);
        check(message, String);
        check(userid, Match.Maybe(String));

        let now = new Date();
        let msg = now.toString() + ' [' + valid_levels[level] + '] ' + message;
        if(userid)
            msg += ' [' + userid + ']';
        if(data)
            msg += ' data=' + JSON.stringify(data);

        msg += '\n';

        fs.appendFile(`${Logger._formatDate(now)}`, msg, function(){});
    }

    // noinspection JSUnusedGlobalSymbols
    fatal(message, data, userid) {
        this._log(message, data, userid);
    }

    _check(level, message, data, userid) {
        var lvl = loggers[this.identifier] || loggers.root;
        if(lvl >= level)
            this._log(lvl, message, data, userid);
    }

    // noinspection JSUnusedGlobalSymbols
    error(message, data, userid) {this._check(1, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    warn(message, data, userid) {this._check(2, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    info(message, data, userid) {this._check(3, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    debug(message, data, userid) {this._check(4, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    trace(message, data, userid) {this._check(5, message, data, userid);}
}

class SetupLogger {
    constructor() {}

    // noinspection JSUnusedGlobalSymbols
    static addLogger(identifier, level) {
        if(valid_levels.indexOf(level.toUpperCase()) === -1)
            throw new Error('Level must be: ', valid_levels);
        loggers[identifier] = valid_levels.indexOf(level.toUpperCase());
    }

    // noinspection JSUnusedGlobalSymbols
    static addLoggers(map) {
        for(let k in map) {
            if(map.hasOwnProperty(k) && valid_levels.indexOf(map[k]) === -1)
                throw new Error('Level must be ' + valid_levels + ' for ' + k);
        }
        for(let k in map) {
            if(map.hasOwnProperty(k))
                loggers[k] = valid_levels.indexOf(map[k].toUpperCase());
        }
    }

    // noinspection JSUnusedGlobalSymbols
    static removeLogger(identifier) {
        if(identifier === 'root')
            throw new Error('Cannot remove root level identifier');
        if(!loggers[identifier])
            throw new Error(identifier + ' is not currently a logger');
        delete loggers[identifier];
    }

    // noinspection JSUnusedGlobalSymbols
    static getLogger(identifier) {
        if(!loggers[identifier])
            throw new Error(identifier + ' is not currently a logger');
        return valid_levels[loggers[identifier]];
    }

    // noinspection JSUnusedGlobalSymbols
    static getAllLoggers() {
        let map = {};
        for(let k in loggers)
            map[k] = valid_levels[loggers[k]];
        return map;
    }
}

let json = Assets.getText('logger_configuration.json');
if(json) {
    let parsed = JSON.parse(json);
    SetupLogger.addLoggers(parsed);
}

Meteor.methods({
    log_to_file: function() {}
});
export {Logger};

//
// { "configuration": { "status": "error", "name": "RoutingTest",
//                      "packages": "org.apache.logging.log4j.test",
//       "properties": {
//         "property": { "name": "filename",
//                       "value" : "target/rolling1/rollingtest-$${sd:type}.log" }
//       },
//     "ThresholdFilter": { "level": "debug" },
//     "appenders": {
//       "Console": { "name": "STDOUT",
//         "PatternLayout": { "pattern": "%m%n" },
//         "ThresholdFilter": { "level": "debug" }
//       },
//       "Routing": { "name": "Routing",
//         "Routes": { "pattern": "$${sd:type}",
//           "Route": [
//             {
//               "RollingFile": {
//                 "name": "Rolling-${sd:type}", "fileName": "${filename}",
//                 "filePattern": "target/rolling1/test1-${sd:type}.%i.log.gz",
//                 "PatternLayout": {"pattern": "%d %p %c{1.} [%t] %m%n"},
//                 "SizeBasedTriggeringPolicy": { "size": "500" }
//               }
//             },
//             { "AppenderRef": "STDOUT", "key": "Audit"}
//           ]
//         }
//       }
//     },
//     "loggers": {
//       "logger": { "name": "EventLogger", "level": "info", "additivity": "false",
//                   "AppenderRef": { "ref": "Routing" }},
//       "root": { "level": "error", "AppenderRef": { "ref": "STDOUT" }}
//     }
//   }
// }