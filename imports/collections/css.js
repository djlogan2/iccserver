import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

const mongoCss = new Mongo.Collection("css");

Meteor.startup(() => {
  mongoCss.rawCollection().ensureIndex({ cssKey: 1 }, { unique: 1 });
});

Meteor.publishComposite("css", {
  find() {
    return Meteor.users.find({ _id: Meteor.userId() }, { fields: { board_css: 1 } });
  },
  children: [
    {
      find(user) {
        if (!!mongoCss.find({ cssKey: user.board_css }).count())
          return mongoCss.find({ cssKey: user.board_css });
        else return mongoCss.find({ cssKey: "default" });
      }
    }
  ]
});

export default mongoCss;
