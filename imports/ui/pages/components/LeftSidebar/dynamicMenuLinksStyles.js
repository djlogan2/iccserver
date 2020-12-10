import _ from "lodash";

export const dynamicMenuLinksStyles = {
  menuLinks: props => {
    const css = _.get(props, "menuLinksCss", {});
    return css.menuLinks;
  },
  menuLinkItem: props => {
    const css = _.get(props, "menuLinksCss", {});
    return css.menuLinkItem;
  },
  menuItemText: props => {
    const css = _.get(props, "menuLinksCss", {});
    return css.menuItemText;
  },
  active: props => {
    const css = _.get(props, "menuLinksCss", {});
    return css.active;
  },
  rowStyle: props => {
    const css = _.get(props, "menuLinksCss", {});
    return css.rowStyle;
  }
};
