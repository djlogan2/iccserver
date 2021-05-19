import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.container;
  },
  head: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.head;
  },
  list: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.list;
  },
  listItem: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.listItem;
  },
  movePiecesButton: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.movePiecesButton;
  },
  movePiecesButtonActive: (props) => {
    const css = get(props, "css.examineOwnerTabBlockCss", {});
    return css.movePiecesButtonActive;
  },
};
