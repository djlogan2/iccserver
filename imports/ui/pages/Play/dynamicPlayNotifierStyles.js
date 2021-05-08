import { get } from "lodash";

export const dynamicPlayNotifierStyles = {
  notification: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.notification;
  },
  titleText: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.titleText;
  },
  titleIcon: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.titleIcon;
  },
  titleDiv: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.titleDiv;
  },
  descriptionButton: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.descriptionButton;
  },
  checkedIcon: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.checkedIcon;
  },
  closeIcon: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.closeIcon;
  },
  mainDiv: (props) => {
    const css = get(props, "systemCss.playNotificationsCss", {});
    return css.mainDiv;
  },
};
