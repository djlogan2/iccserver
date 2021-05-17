import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "systemCss.editorCss", {});
    return css.main;
  },
  rightSideBarWrapper: (props) => {
    const css = get(props, "systemCss.editorCss", {});
    return css.rightSideBarWrapper;
  },
};
