import {Logger, SetupLogger} from "../lib/server/Logger";

const CLIENT_REALTIME_RECORDS_TO_KEEP = 1000;
const realtime_publish_map = {};

let log = new Logger('server/RealTime_js');

// TODO: Do we have to queue up messages if the user isn't in the list? If he's not in the list, he's not logged on. But it could be because he's temporarily gone
// TODO: Keep a timestamp record of when we send a game move for calculating lag
// TODO: If we aren't sending game moves, send 1s interval pings for calculating lag
// TODO: Have the client respond to game-moves and pings, for calculating lag
function send(userId, type, message) {
    log.debug('RealTime::send', {type: type, message: message});
    const pub = realtime_publish_map[userId];
    if (pub) {
        if (pub.prm_id >= CLIENT_REALTIME_RECORDS_TO_KEEP)
            pub.publish.removed('realtime_messages', (pub.prm_id - CLIENT_REALTIME_RECORDS_TO_KEEP).toString());
        pub.publish.added('realtime_messages', (pub.prm_id).toString(), {
            nid: pub.prm_id,
            type: type,
            message: message
        });
        pub.publish.ready();
        pub.prm_id++;
    }
}

Meteor.publish('realtime_messages', function () {
    const self = this;
    log.debug('publishing realtime_messages');
    realtime_publish_map[this.userId] = {
        publish: self,
        prm_id: 0
    };
    this.onStop(function () {
        log.debug('ending publication realtime_messages');
        delete realtime_publish_map[self.userId];
    });

    send(self.userId, 'setup_logger', SetupLogger.getAllLoggers());
});

const RealTime = {
    /*
    * @param {Id} userId1
    * @param {Id} userId2
    * @param {string} whitePlayer
    * @param {Number} whiteRating
    * @param {string} blackPlayer
    * @param {Number} blackRating
    * @param {Number} whiteTime
    * @param {Number} blackTime
    * @param {string} startingFen
    */
    game_start(userId1, userId2, whitePlayer, whiteRating, blackPlayer, blackRating, startingFen) {
        const msg = {
            white: {
                name: whitePlayer,
                rating: whiteRating
            },
            black: {
                name: blackPlayer,
                rating: blackRating
            }
        };
        if (startingFen)
            msg.startingFen = startingFen;
        send(userId1, 'game_start', msg);
        send(userId2, 'game_start', msg);
    },

    /**
     *
     * @param userId1
     * @param userId2
     */
    game_end(userId1, userId2) {
        send(userId1, 'game_end');
        send(userId2, 'game_end');
    },

    /**
     *
     * @param userId
     * @param algebraic
     */
    game_moveOnBoard(userId, algebraic) {
        send(userId, 'game_move', {algebraic: algebraic});
    },

    /**
     *
     * @param userId
     * @param count
     */
    game_takeback(userId, count) {
        send(userId, 'game_takeback', count);
    },

    /**
     *
     * @param userId {String} The user id that is getting the clock update
     * @param color {String} The color of the side to move. 'w' or 'b'
     * @param msec {Number} The number of milliseconds on the clock
     * @param startclock {Boolean} True to start this clock, false to not start this users clock
     */
    update_game_clock(userId, color, msec, startclock) {
        send(userId, 'update_game_clock', {millis: msec, color: color, startclock: startclock});
    },
    /**
     *
     * @param userId
     * @param errorValue
     */
    send_error(userId, errorValue) {
        send(userId, 'error', errorValue);
    }
};

export {RealTime};