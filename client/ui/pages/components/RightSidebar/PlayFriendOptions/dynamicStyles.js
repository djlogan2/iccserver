import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.playFriendOptionsCss", {});
    return css.main;
  },
  head: (props) => {
    const css = get(props, "css.playFriendOptionsCss", {});
    return css.head;
  },
  nameTitle: (props) => {
    const css = get(props, "css.playFriendOptionsCss", {});
    return css.nameTitle;
  },
  incDelayWrap: (props) => {
    const css = get(props, "css.playFriendOptionsCss", {});
    return css.incDelayWrap;
  },
};
