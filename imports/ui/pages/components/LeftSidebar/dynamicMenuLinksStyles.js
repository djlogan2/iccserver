import { get } from "lodash";

export const dynamicMenuLinksStyles = {
  menuLinks: (props) => {
    const css = get(props, "menuLinksCss.menuLinksCss", {});
    return css.menuLinks;
  },
  menuLinkItem: (props) => {
    const css = get(props, "menuLinksCss.menuLinksCss", {});
    return css.menuLinkItem;
  },
  menuItemText: (props) => {
    const css = get(props, "menuLinksCss.menuLinksCss", {});
    return css.menuItemText;
  },
  active: (props) => {
    const css = get(props, "menuLinksCss.menuLinksCss", {});
    return css.active;
  },
  rowStyle: (props) => {
    const css = get(props, "menuLinksCss.menuLinksCss", {});
    return css.rowStyle;
  },
};
