import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.examineRightSidebarCss", {});
    return css.main;
  },
};
