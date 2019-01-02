export class NodeUser {

    constructor() {
        this.messages_s = Meteor.subscribe('messages');
        this.messages_m = Mongo.Collection('messages');
    }

    shutdown() {
        this.messages_s.stop();
    }

    messages() {
        return this.messages_m;
    }

    sendmessage(towhom, themessage) {
        Meteor.call('sendmessage', towhom, themessage);
    }
}