import { get } from "lodash";

export const dynamicStyles = {
  main: (props) => {
    const css = get(props, "css.playChooseBotCss", {});
    return css.main;
  },
  head: (props) => {
    const css = get(props, "css.playChooseBotCss", {});
    return css.head;
  },
  startGameButton: (props) => {
    const css = get(props, "css.playChooseBotCss", {});
    return css.startGameButton;
  },
  nameTitle: (props) => {
    const css = get(props, "css.playChooseBotCss", {});
    return css.nameTitle;
  },
  incDelayWrap: (props) => {
    const css = get(props, "css.playChooseBotCss", {});
    return css.incDelayWrap;
  },
};
