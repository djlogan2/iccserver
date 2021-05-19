import { get } from "lodash";

export const dynamicStyles = {
  container: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.container;
  },
  head: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.head;
  },
  name: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.name;
  },
  nameImg: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.nameImg;
  },
  nameTitle: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.nameTitle;
  },
  list: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.list;
  },
  ownerListItem: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.ownerListItem;
  },
  observerListItem: (props) => {
    const css = get(props, "css.examineObserverTabBlockCss", {});
    return css.observerListItem;
  },
};
