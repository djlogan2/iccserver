import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.examineRightSidebarBottomCss", {});
    return css.container;
  },
  game: (props) => {
    const css = get(props, "css.examineRightSidebarBottomCss", {});
    return css.game;
  },
};
