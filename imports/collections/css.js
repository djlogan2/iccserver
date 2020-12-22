import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCss = new Mongo.Collection("css");

Meteor.publish("css", function() {
  return mongoCss.find({
    // TODO: I am not sure where you are doing here, but I am a little worried. I am not sure it's going to work.
    //       The idea is this:
    //       Administrator set a system variable, like "css-in-use" to something like "css-2020-12-25"
    //       Client loads CSS labelled "css-2020-12-25", which has all of the required elements.
    //       After Christmas, they copy "css-2020-12-25", make changes.
    //       Administrator changes his own "system css" variable from nothing to "css-after-christmas", which
    //       loads the new CSS, just for him.
    //       when he likes it, it changes the system variable "css-in-use" to "css-after-christmas", and now
    //       everyone starts using it.
    //       The type: "x" was designed to be used like this. "system" was ALL of the system CSS
    //       "board" was ALL of the board CSS
    //       If you are going to change how type is used, you need to add another field that implements the
    //       above, like "name" or something.
    type: { $in: ["system", "board", "leftSideBar", "menuLinks", "playNotifications"] }
  });
});

export default mongoCss;
