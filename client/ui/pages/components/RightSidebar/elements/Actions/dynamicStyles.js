import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.actionsCss", {});
    return css.main;
  },
  link: (props) => {
    const css = get(props, "css.actionsCss", {});
    return css.link;
  },
  element: (props) => {
    const css = get(props, "css.actionsCss", {});
    return css.element;
  },
};
