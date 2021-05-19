import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.messageItemCss", {});
    return css.main;
  },
  name: (props) => {
    const css = get(props, "css.messageItemCss", {});
    return css.name;
  },
  text: (props) => {
    const css = get(props, "css.messageItemCss", {});
    return css.text;
  },
};
