import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.examineSidebarTopCss", {});
    return css.main;
  },
  tabPlane: (props) => {
    const css = get(props, "css.examineSidebarTopCss", {});
    return css.tabPlane;
  },
  renderMoveWrapper: (props) => {
    const css = get(props, "css.examineSidebarTopCss", {});
    return css.renderMoveWrapper;
  },
  renderMove: (props) => {
    const css = get(props, "css.examineSidebarTopCss", {});
    return css.renderMove;
  },
};
