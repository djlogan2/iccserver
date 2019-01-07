const realtime_publish_map = {};

console.log('RealTime published');
const publish_realtime_messages = Meteor.publish('realtime_messages', function(){
    const self = this;
    console.log('Starting realtime publish for ' + this.userId);
    realtime_publish_map[this.userId] = this;
    this.onStop(function(){
        console.log('Stopping publish for ' + self.userId);
        delete realtime_publish_map[self.userId];
    });
});

let prm_id = 0;

const RealTime = {
    //startup: function() {
    //
    //},
    send(userId, type, message) {
        const pub = realtime_publish_map[userId];
        if(pub) {
            pub.added('realtime_messages', (prm_id++).toString(), {type: type, message: message});
            pub.ready();
        }
    }
};

export {RealTime};