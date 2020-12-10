import _ from "lodash";

export const dynamicMenuLinksStyles = {
  menuLinks: props => {
    const css = _.get(props, "menuLinksCss", {});
    console.log(props);
    return css.menuLinks;
  }
};
