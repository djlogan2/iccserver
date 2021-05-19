import { get } from "lodash";

export const dynamicLeftSideBarStyles = {
  main: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.main;
  },
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
  imageLogo: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.imageLogo;
  },
  fliphImageLogo: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.fliphImageLogo;
  },
  burgerButton: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.burgerButton;
  },
  fliphBurgerButton: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.fliphBurgerButton;
  },
  sidebarUser: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebarUser;
  },
  fliphSidebarUser: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.fliphSidebarUser;
  },
  sidebar: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.sidebar;
  },
  fliphSidebar: (props) => {
    const css = get(props, "leftSideBarCss.leftSideBarCss", {});
    return css.fliphSidebar;
  },
};
