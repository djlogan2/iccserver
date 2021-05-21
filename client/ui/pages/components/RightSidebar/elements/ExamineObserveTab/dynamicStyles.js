import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.examineObserveTabCss", {});
    return css.container;
  },
  observeSearch: (props) => {
    const css = get(props, "css.examineObserveTabCss", {});
    return css.observeSearch;
  },
};
