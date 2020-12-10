import _ from "lodash";

export const dynamicLeftSideBarStyles = {
  mainDiv: props => {
    const css = _.get(props, "leftSideBarCss", {});
    return css.mainDiv;
  },
  sidebarUserImg: props => {
    const css = _.get(props, "leftSideBarCss", {});
    return css.sidebarUserImg;
  },
  fliphSidebarUserImg: {
    marginTop: "6rem"
  },
  sidebarUsername: props => {
    const css = _.get(props, "leftSideBarCss", {});
    return css.sidebarUsername;
  }
};
