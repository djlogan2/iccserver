import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import mongoCurrentCss from "./currentCss";

const mongoCss = new Mongo.Collection("css");

Meteor.publish("css", function() {
  const cssKey = mongoCurrentCss.findOne();
  return mongoCss.find({ cssKey: cssKey.value });
});

export default mongoCss;
