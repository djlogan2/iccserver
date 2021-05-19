import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.playRightSideBarCss", {});
    return css.main;
  },
  flexDiv: (props) => {
    const css = get(props, "css.playRightSideBarCss", {});
    return css.flexDiv;
  },
  bottom: (props) => {
    const css = get(props, "css.playRightSideBarCss", {});
    return css.bottom;
  },
};
