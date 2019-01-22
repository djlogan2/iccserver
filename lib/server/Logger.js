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

    static _log(clientserver, identifier, level, message, data, userid) {
        check(clientserver, String);
        check(identifier, String);
        check(level, Number);
        check(message, String);
        check(userid, Match.Maybe(String));

        let cache = [];
        const duplicateChecker = (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    //console.log('Removing duplicate entry on debug: ' + key + ':' + value);
                    try {
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        //console.log('Error thrown in duplicate checker: ' + key + ':' + value + ': ');
                        return;
                    }
                }
                cache.push(value);
            }
            return value;
        };

        let now = new Date();
        let msg = '[' + clientserver + ']' + now.toString() + ' [' + valid_levels[level] + '] ' + identifier + ': ' + message;

        if(userid)
            msg += ' [' + userid + ']';

        if(data)
            try {
                msg += ': data=' + JSON.stringify(data, duplicateChecker);
            } catch(e) {
                console.log(e);
            }

        msg += '\n';

        fs.appendFile(`${Logger._formatDate(now)}`, msg, function(){});
    }

    // noinspection JSUnusedGlobalSymbols
    fatal(message, data, userid) {
        Logger._log('SERVER', this.identifier, message, data, userid);
    }

    static _check(clientserver, identifier, level, message, data, userid) {
        var lvl = loggers[identifier] || loggers.root;
        if(lvl >= level)
            Logger._log(clientserver, identifier, lvl, message, data, userid);
    }

    // noinspection JSUnusedGlobalSymbols
    error(message, data, userid) {Logger._check('SERVER', this.identifier, 1, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    warn(message, data, userid) {Logger._check('SERVER', this.identifier, 2, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    info(message, data, userid) {Logger._check('SERVER', this.identifier, 3, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    debug(message, data, userid) {Logger._check('SERVER', this.identifier, 4, message, data, userid);}
    // noinspection JSUnusedGlobalSymbols
    trace(message, data, userid) {Logger._check('SERVER', this.identifier, 5, message, data, userid);}
}

class SetupLogger {
    constructor() {}

    // noinspection JSUnusedGlobalSymbols
    static addLogger(identifier, level) {
        if(valid_levels.indexOf(level.toUpperCase()) === -1)
            throw new Error('Level must be: ' + valid_levels);
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
    log_to_file: function(identifier, level, message, data, userid) {
        check(identifier, String);
        check(level,  Number);
        check(message, String);
        check(data, Match.Any);
        check(userid, Match.Maybe(String));
        Logger._check('CLIENT', identifier, level, message, data, userid);
    }
});
export {Logger, SetupLogger};
