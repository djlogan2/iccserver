import { get } from "lodash";

export const dynamicStyles = {
  mainDiv: props => {
    const css = get(props, "commandsCss.commandsCss", {});
    return css.mainDiv;
  }
};
