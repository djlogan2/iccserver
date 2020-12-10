import { leftSideBarCss, systemcss, usercss, menuLinksCss } from "../../../server/developmentcss";
import mongoCss from "../../collections/css";
import { Meteor } from "meteor/meteor";

export default function firstRunCSS() {
  if (!Meteor.isTest && !Meteor.isAppTest && mongoCss.find().count() === 0) {
    mongoCss.insert(systemcss);
    mongoCss.insert(usercss);
  }

  if (!Meteor.isTest && !Meteor.isAppTest && mongoCss.find({ type: "leftSideBar" }).count() === 0) {
    mongoCss.insert(leftSideBarCss);
  }

  if (!Meteor.isTest && !Meteor.isAppTest && mongoCss.find({ type: "menuLinks" }).count() === 0) {
    mongoCss.insert(menuLinksCss);
  }
}
