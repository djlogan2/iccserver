import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.boardWrapperCss", {});
    return css.container;
  },
};
