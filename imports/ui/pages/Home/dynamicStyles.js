import { get } from "lodash";

export const dynamicStyles = {
  image: (props) => {
    const css = get(props, "css.homeCss", {});
    return css.image;
  },
};
