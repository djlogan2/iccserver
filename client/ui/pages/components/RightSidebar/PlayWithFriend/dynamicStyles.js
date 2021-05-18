import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.main;
  },
  head: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.head;
  },
  nameTitle: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.nameTitle;
  },
  header: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.header;
  },
  list: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.list;
  },
  listItem: (props) => {
    const css = get(props, "css.playWithFriendCss", {});
    return css.listItem;
  },
};
