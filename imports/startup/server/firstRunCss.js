import { systemcss, usercss } from "../../../server/developmentcss";
import mongoCss from "../../collections/css";
import { Meteor } from "meteor/meteor";

export default function firstRunCSS() {
  if (!Meteor.isTest && !Meteor.isAppTest && mongoCss.find().count() === 0) {
    mongoCss.insert(systemcss);
    mongoCss.insert(usercss);
  }
}
