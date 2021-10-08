import { get } from "lodash";

export const dynamicStyles = {
  userInfo: (props) => {
    const css = get(props, "css.middleSectionPlayerCss", {});
    return css.userInfo;
  },
};
