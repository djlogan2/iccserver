import { Mongo } from "meteor/mongo";

const realtime_messages = new Mongo.Collection("realtime_messages");

export default realtime_messages;
