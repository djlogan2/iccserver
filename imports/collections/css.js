import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCss = new Mongo.Collection("css");

Meteor.publish("css", function() {
  // const cssKey = mongoCurrentCss.findOne();
  const user = Meteor.user();

  if (!user) {
    return this.ready();
  }

  return mongoCss.find({ cssKey: user.board_css });
});

export default mongoCss;
