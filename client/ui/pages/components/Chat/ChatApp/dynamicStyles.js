import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.chatAppCss", {});
    return css.main;
  },
  listWrap: (props) => {
    const css = get(props, "css.chatAppCss", {});
    return css.listWrap;
  },
  messageList: (props) => {
    const css = get(props, "css.chatAppCss", {});
    return css.messageList;
  },
  inputBar: (props) => {
    const css = get(props, "css.chatAppCss", {});
    return css.inputBar;
  },
};
