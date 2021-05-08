import { get } from "lodash";

export const dynamicRequestNotificationsStyles = {
  mainDiv: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.mainDiv;
  },
  imageAvatar: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.imageAvatar;
  },
  detailsDiv: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.detailsDiv;
  },
  actionsDiv: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.actionsDiv;
  },
  declineButton: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.declineButton;
  },
  acceptButton: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.acceptButton;
  },
  divTitle: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.divTitle;
  },
  cancelSeekButton: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.cancelSeekButton;
  },
  seekSearchDiv: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.seekSearchDiv;
  },
  gameSeekSearchingDiv: (props) => {
    const css = get(props, "challengeNotificationCss.challengeNotificationCss", {});
    return css.gameSeekSearchingDiv;
  },
};
