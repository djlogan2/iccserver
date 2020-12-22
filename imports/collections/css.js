import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCss = new Mongo.Collection("css");

Meteor.publish("css", function() {
  return mongoCss.find({
    type: { $in: ["system", "board", "leftSideBar", "menuLinks", "playNotifications"] }
  });
});

export default mongoCss;
