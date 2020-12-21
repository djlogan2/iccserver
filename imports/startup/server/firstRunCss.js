import leftSideBarCss from "../../../server/defaultStyles/leftSideBarCss";
import menuLinksCss from "../../../server/defaultStyles/menuLinksCss";
import systemCss from "../../../server/defaultStyles/systemCss";
import userCss from "../../../server/defaultStyles/userCss";
import mongoCss from "../../collections/css";
import { Meteor } from "meteor/meteor";
import playNotificationsCss from "../../../server/defaultStyles/playNotificationsCss";

export default function firstRunCSS() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoCss.find({ type: "system" }).count()) {
    mongoCss.insert(systemCss);
  }

  if (!mongoCss.find({ type: "board" }).count()) {
    mongoCss.insert(userCss);
  }

  if (!mongoCss.find({ type: "leftSideBar" }).count()) {
    mongoCss.insert(leftSideBarCss);
  }

  if (!mongoCss.find({ type: "menuLinks" }).count()) {
    mongoCss.insert(menuLinksCss);
  }

  if (!mongoCss.find({ type: "playNotifications" }).count()) {
    mongoCss.insert(playNotificationsCss);
  }
}
