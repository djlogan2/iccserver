import { get } from "lodash";

export const dynamicStyles = {
  sidebar: (props) => {
    const css = get(props, "css.communityCss", {});
    return css.sidebar;
  },
  messenger: (props) => {
    const css = get(props, "css.communityCss", {});
    return css.messenger;
  },
  messengerWithRightMenu: (props) => {
    const css = get(props, "css.communityCss", {});
    return css.messengerWithRightMenu;
  },
  rightBlock: (props) => {
    const css = get(props, "css.communityCss", {});
    return css.rightBlock;
  },
};
