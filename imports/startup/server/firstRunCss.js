import { Meteor } from "meteor/meteor";
import leftSideBarCss from "../../../server/defaultStyles/leftSideBarCss";
import menuLinksCss from "../../../server/defaultStyles/menuLinksCss";
import systemCss from "../../../server/defaultStyles/systemCss";
import userCss from "../../../server/defaultStyles/userCss";
import mongoCss from "../../collections/css";
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
import playRightSideBarCss from "../../../server/defaultStyles/playRightSideBarCss";
import chatAppCss from "../../../server/defaultStyles/chatAppCss";
import editorCss from "../../../server/defaultStyles/editorCss";
import editorRightSidebarCss from "../../../server/defaultStyles/editorRightSidebarCss";
import examineRightSidebarCss from "../../../server/defaultStyles/examineRightSidebarCss";
import examineSidebarTopCss from "../../../server/defaultStyles/examineSidebarTopCss";
import actionsCss from "../../../server/defaultStyles/actionsCss";
import messengerCss from "../../../server/defaultStyles/messengerCss";
import messageItemCss from "../../../server/defaultStyles/messageItemCss";
import chatInputCss from "../../../server/defaultStyles/chatInputCss";
import childChatInputCss from "../../../server/defaultStyles/childChatInputCss";
import playWithFriendCss from "../../../server/defaultStyles/playWithFriendCss";
import playFriendOptionsCss from "../../../server/defaultStyles/playFriendOptionsCss";
import playChooseBotCss from "../../../server/defaultStyles/playChooseBotCss";
import notFoundCss from "../../../server/defaultStyles/notFoundCss";
import examineOwnerTabBlockCss from "../../../server/defaultStyles/examineOwnerTabBlockCss";
import examineObserverTabBlockCss from "../../../server/defaultStyles/examineObserverTabBlockCss";
import boardWrapperCss from "../../../server/defaultStyles/boardWrapperCss";
import examineObserveTabCss from "../../../server/defaultStyles/examineObserveTabCss";
import observeBlockCss from "../../../server/defaultStyles/observeBlockCss";
import examineRightSidebarBottomCss from "../../../server/defaultStyles/examineRightSidebarBottomCss";
import playOptionButtonsCss from "../../../server/defaultStyles/playOptionButtonsCss";
import gameControlBlockCss from "../../../server/defaultStyles/gameControlBlockCss";
import fenPgnCss from "../../../server/defaultStyles/fenPgnCss";
import mugshotCss from "../../../server/defaultStyles/mugshotCss";
import middleSectionPlayerCss from "../../../server/defaultStyles/middleSectionPlayerCss";
import { isEqual } from "lodash";

export default function firstRunCSS() {
  if (Meteor.isTest || Meteor.isAppTest) {
    return;
  }

  const data = mongoCss.find({ cssKey: "default" });
  const columns = data.count() ? data.fetch()[0] : null;
  const styles = {
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
    playRightSideBarCss,
    chatAppCss,
    editorCss,
    editorRightSidebarCss,
    examineRightSidebarCss,
    examineSidebarTopCss,
    actionsCss,
    messengerCss,
    messageItemCss,
    chatInputCss,
    childChatInputCss,
    playWithFriendCss,
    playFriendOptionsCss,
    playChooseBotCss,
    notFoundCss,
    examineOwnerTabBlockCss,
    examineObserverTabBlockCss,
    boardWrapperCss,
    examineObserveTabCss,
    observeBlockCss,
    examineRightSidebarBottomCss,
    playOptionButtonsCss,
    gameControlBlockCss,
    fenPgnCss,
    mugshotCss,
    middleSectionPlayerCss,
  };
  if (!columns || Object.keys(styles).some((key) => !isEqual(columns[key], styles[key]))) {
    mongoCss.update({ cssKey: "default" }, { $set: { ...styles } }, { upsert: true });
  }
}
