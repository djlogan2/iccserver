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
    developer_debug(userId, msg) {
        send(userId, 'debug', msg);
    },
    game_start(userId1, userId2, whitePlayer, whiteRating, blackPlayer, blackRating, whiteTime, blackTime, startingFen) {

    },
    game_end(userId1, userId2) {

    },
    game_moveOnBoard(userId, algebraic, smith, time) {

    },
    game_takeback(userId, count) {

    },
    send_error(userId, errorValue) {

    }
};

export {RealTime};