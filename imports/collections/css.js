import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCss = new Mongo.Collection("css");

Meteor.startup(() => {
  mongoCss.rawCollection().createIndex({ cssKey: 1 }, { unique: 1 });
});

Meteor.publish(null, () => {
  return mongoCss.find();
});

export default mongoCss;
