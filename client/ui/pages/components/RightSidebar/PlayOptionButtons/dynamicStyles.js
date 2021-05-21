import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.container;
  },
  top: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.top;
  },
  topDisabled: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.topDisabled;
  },
  topButton: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.topButton;
  },
  bottom: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.bottom;
  },
  buttonBig: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.buttonBig;
  },
  buttonBigDisabled: (props) => {
    const css = get(props, "css.playOptionButtonsCss", {});
    return css.buttonBigDisabled;
  },
};
