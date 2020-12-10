import { leftSideBarCss, systemcss, usercss, menuLinksCss } from "../../../server/developmentcss";
import mongoCss from "../../collections/css";
import { Meteor } from "meteor/meteor";

export default function firstRunCSS() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoCss.find().count()) {
    mongoCss.insert(systemcss);
    mongoCss.insert(usercss);
  }

  if (!mongoCss.find({ type: "leftSideBar" }).count()) {
    mongoCss.insert(leftSideBarCss);
  }

  if (!mongoCss.find({ type: "menuLinks" }).count()) {
    mongoCss.insert(menuLinksCss);
  }
}
