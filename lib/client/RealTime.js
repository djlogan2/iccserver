/*
const realtime_subscription = Meteor.subscribe('realtime_messages');
const realtime_messages = new Mongo.Collection('realtime_messages');

const RealTime = {
    collection: realtime_messages
};

export {RealTime};*/

import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

//const  RealTime= new Mongo.Collection('realtime_messages');

const realtime_subscription = Meteor.subscribe("realtime_messages");
const RealTime = new Mongo.Collection("realtime_messages");

export default RealTime;
