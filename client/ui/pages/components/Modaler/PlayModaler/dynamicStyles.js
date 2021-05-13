import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.main;
  },
  userOne: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.userOne;
  },
  userTwo: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.userTwo;
  },
  userImg: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.userImg;
  },
  username: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.username;
  },
  mainCenter: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.mainCenter;
  },
  buttonBlock: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.buttonBlock;
  },
  buttonPrimary: (props) => {
    const css = get(props, "css.playModalCss", {});
    return css.buttonPrimary;
  },
};
