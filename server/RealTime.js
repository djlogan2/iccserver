const realtime_publish_map = {};

Meteor.publish('realtime_messages', function(){
    const self = this;
    console.log('publishing realtime_messages for ' + this.userId);
    realtime_publish_map[this.userId] = {
        publish: self,
        prm_id: 0
    };
    this.onStop(function(){
        console.log('ending publication realtime_messages for ' + this.userId);
        delete realtime_publish_map[self.userId];
    });
});

// TODO: Do we have to queue up messages if the user isn't in the list? If he's not in the list, he's not logged on. But it could be because he's temporarily gone
function send(userId, type, message) {
    console.log('RealToime::send ' + userId + ', ' + type + ', ' + JSON.stringify(message));
    const pub = realtime_publish_map[userId];
    if(pub) {
        if(pub.prm_id >= 100)
            pub.publish.removed('realtime_messages', (pub.prm_id - 100).toString());
        pub.publish.added('realtime_messages', (pub.prm_id).toString(), {nid: pub.prm_id, type: type, message: message});
        pub.publish.ready();
        pub.prm_id++;
    }
}

const RealTime = {
    /**
     *
     * @param userId
     * @param msg
     */
    developer_debug(userId, msg) {
        send(userId, 'debug', msg);
    },

    /**
     *
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
    game_start(userId1, userId2, whitePlayer, whiteRating, blackPlayer, blackRating, whiteTime, blackTime, startingFen) {
        const msg = {
            white: {
                name: whitePlayer,
                rating: whiteRating,
                time: whiteTime
            },
            black: {
                name: blackPlayer,
                rating: blackRating,
                time: blackTime
            }
        };
        if(startingFen)
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
     * @param smith
     * @param seconds
     */
    game_moveOnBoard(userId, algebraic, smith, time) {
        send(userId, 'game_move', {algebraic: algebraic, smith: smith, seconds: time});
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
     * @param userId
     * @param errorValue
     */
    send_error(userId, errorValue) {
        send(userId, 'error', errorValue);
    }
};

export {RealTime};