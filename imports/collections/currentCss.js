import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCurrentCss = new Mongo.Collection("current_css");

Meteor.publish("currentCss", function() {
  return mongoCurrentCss.findOne();
});

export default mongoCurrentCss;
