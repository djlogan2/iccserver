import { get } from "lodash";

export const dynamicLeftSideBarStyles = {
  mainDiv: props => {
    const css = get(props, "leftSideBarCss", {});
    return css.mainDiv;
  },
  sidebarUserImg: props => {
    const css = get(props, "leftSideBarCss", {});
    return css.sidebarUserImg;
  },
  sidebarUserImgFliphed: props => {
    const css = get(props, "leftSideBarCss", {});
    return css.sidebarUserImgFliphed;
  },
  fliphSidebarUserImg: {
    marginTop: "6rem"
  },
  sidebarUsername: props => {
    const css = get(props, "leftSideBarCss", {});
    return css.sidebarUsername;
  }
};
