import leftSideBarCss from "../../../server/defaultStyles/leftSideBarCss";
import menuLinksCss from "../../../server/defaultStyles/menuLinksCss";
import systemCss from "../../../server/defaultStyles/systemCss";
import userCss from "../../../server/defaultStyles/userCss";
import mongoCss from "../../collections/css";
import { Meteor } from "meteor/meteor";
import playNotificationsCss from "../../../server/defaultStyles/playNotificationsCss";
import primaryButtonCss from "../../../server/defaultStyles/primaryButtonCss";
import challengeNotificationCss from "../../../server/defaultStyles/challengeNotificationCss";
import profileCss from "../../../server/defaultStyles/profileCss";
import userManagementCss from "../../../server/defaultStyles/userManagementCss";
import commandsCss from "../../../server/defaultStyles/commandsCss";
import homeCss from "../../../server/defaultStyles/homeCss";
import loginPageCss from "../../../server/defaultStyles/loginPageCss";
import signupPageCss from "../../../server/defaultStyles/signupPageCss";
import appWrapperCss from "../../../server/defaultStyles/appWrapper";
import communityCss from "../../../server/defaultStyles/communityCss";
import communityBlockCss from "../../../server/defaultStyles/communityBlockCss";
import communityRightBlockCss from "../../../server/defaultStyles/communityRightBlockCss";
import playModalCss from "../../../server/defaultStyles/playModalCss";

export default function firstRunCSS() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  if (!mongoCss.find({ cssKey: "default" }).count()) {
    mongoCss.insert({
      cssKey: "default",
      systemCss,
      userCss,
      leftSideBarCss,
      menuLinksCss,
      playNotificationsCss,
      primaryButtonCss,
      challengeNotificationCss,
      profileCss,
      userManagementCss,
      commandsCss,
      homeCss,
      loginPageCss,
      signupPageCss,
      appWrapperCss,
      communityCss,
      communityBlockCss,
      communityRightBlockCss,
      playModalCss,
    });
  }
}
