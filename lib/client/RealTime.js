
const realtime_subscription = Meteor.subscribe('realtime_messages');
const realtime_messages = new Mongo.Collection('realtime_messages');

const RealTime = {
    collection: realtime_messages
};

export {RealTime};