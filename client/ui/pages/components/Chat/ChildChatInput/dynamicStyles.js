import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.childChatInputCss", {});
    return css.main;
  },
};
