import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.observeBlockCss", {});
    return css.container;
  },
};
