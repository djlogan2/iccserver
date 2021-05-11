import { get } from "lodash";

export const dynamicStyles = {
  roomBlock: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlock;
  },
  roomBlockHead: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockHead;
  },
  roomBlockTitle: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockTitle;
  },
  roomBlockList: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockList;
  },
  roomBlockListItem: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockListItem;
  },
  roomBlockListItemActive: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockListItemActive;
  },
  roomBlockCreateButton: (props) => {
    const css = get(props, "css.communityRightBlockCss", {});
    return css.roomBlockCreateButton;
  },
};
