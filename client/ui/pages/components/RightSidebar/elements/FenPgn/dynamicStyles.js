import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.fenPgnCss", {});
    return css.main;
  },
  content: (props) => {
    const css = get(props, "css.fenPgnCss", {});
    return css.content;
  },
  bottom: (props) => {
    const css = get(props, "css.fenPgnCss", {});
    return css.bottom;
  },
  button: (props) => {
    const css = get(props, "css.fenPgnCss", {});
    return css.button;
  },
};
