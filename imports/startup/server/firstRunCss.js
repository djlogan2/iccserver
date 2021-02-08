import leftSideBarCss from "../../../server/defaultStyles/leftSideBarCss";
import menuLinksCss from "../../../server/defaultStyles/menuLinksCss";
import systemCss from "../../../server/defaultStyles/systemCss";
import userCss from "../../../server/defaultStyles/userCss";
import mongoCss from "../../collections/css";
import mongoCurrentCss from "../../collections/currentCss";
import { Meteor } from "meteor/meteor";
import playNotificationsCss from "../../../server/defaultStyles/playNotificationsCss";
import { DEFAULT_CSS_KEY } from "../../constants/systemConstants";
import primaryButtonCss from "../../../server/defaultStyles/primaryButtonCss";
import challengeNotificationCss from "../../../server/defaultStyles/challengeNotificationCss";
import profileCss from "../../../server/defaultStyles/profileCss";

export default function firstRunCSS() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoCurrentCss.find().count()) {
    mongoCurrentCss.insert({ value: DEFAULT_CSS_KEY });
  }

  if (!mongoCss.find({ cssKey: "default" }).count()) {
    mongoCss.insert({
      cssKey: "default",
      systemCss: systemCss,
      userCss: userCss,
      leftSideBarCss: leftSideBarCss,
      menuLinksCss: menuLinksCss,
      playNotificationsCss: playNotificationsCss,
      primaryButtonCss: primaryButtonCss,
      challengeNotificationCss: challengeNotificationCss,
      profileCss: profileCss
    });
  }
}
