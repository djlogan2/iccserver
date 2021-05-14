import { get } from "lodash";

export const dynamicStyles = {
  appWrapper: (props) => {
    const css = get(props, "css.appWrapperCss", {});
    return css.appWrapper;
  },
  appWrapperRow: (props) => {
    const css = get(props, "css.appWrapperCss", {});
    return css.appWrapperRow;
  },
};
