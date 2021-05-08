import { get } from "lodash";

export const dynamicLeftSideBarStyles = {
  mainDiv: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.mainDiv;
  },
  sidebarUserImg: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebarUserImg;
  },
  sidebarUserImgFliphed: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebarUserImgFliphed;
  },
  fliphSidebarUserImg: {
    marginTop: "6rem",
  },
  sidebarUsername: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebarUsername;
  },
  sidebarUsernameNone: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebarUsernameNone;
  },
  statusLabel: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.statusLabel;
  },
};
