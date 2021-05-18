import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.main;
  },
  head: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.head;
  },
  name: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.name;
  },
  listWrap: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.listWrap;
  },
  messageList: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.messageList;
  },
  inputBar: (props) => {
    const css = get(props, "css.messengerCss", {});
    return css.inputBar;
  },
};
