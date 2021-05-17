import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.main;
  },
  head: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.head;
  },
  backButton: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.backButton;
  },
  title: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.title;
  },
  content: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.content;
  },
  colorBlock: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.colorBlock;
  },
  castling: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.castling;
  },
  name: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.name;
  },
  castlingWrap: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.castlingWrap;
  },
  block: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.block;
  },
  checkName: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.checkName;
  },
  buttonList: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.buttonList;
  },
  button: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.button;
  },
  buttonStartingPos: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.buttonStartingPos;
  },
  buttonClear: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.buttonClear;
  },
  buttonFlip: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.buttonFlip;
  },
  fenBlock: (props) => {
    const css = get(props, "css.editorRightSidebarCss", {});
    return css.fenBlock;
  },
};
