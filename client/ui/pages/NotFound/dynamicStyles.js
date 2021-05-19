import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.notFoundCss", {});
    return css.container;
  },
};
