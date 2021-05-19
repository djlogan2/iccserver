import { get } from "lodash";

export const dynamicStyles = {
  roomBlock: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlock;
  },
  roomBlockHead: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockHead;
  },
  roomBlockTitle: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockTitle;
  },
  roomBlockList: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockList;
  },
  roomBlockListItem: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockListItem;
  },
  roomBlockListItemActive: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockListItemActive;
  },
  roomBlockCreateButton: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockCreateButton;
  },
  roomBlockPlus: (props) => {
    const css = get(props, "css.communityBlockCss", {});
    return css.roomBlockPlus;
  },
};
