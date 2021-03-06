const leftSideBarCss = {
  type: "leftSideBar",
  main: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: "170px",
    zIndex: 999,
    height: "100%",
    minHeight: "100vh",
    backgroundColor: "#1565c0",
    transition: "all 0.5s ease-in-out",
    position: "relative",
  },
  sidebarUserImg: {
    width: "3.2rem",
    height: "3.2rem",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey",
  },
  sidebarUserImgFliphed: {
    width: "2.2rem",
    height: "2.2rem",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey",
    position: "relative",
    right: "3px",
  },
  sidebarUsername: {
    color: "#fff",
    textAlign: "left !important",
    paddingLeft: "1rem",
    maxWidth: "75px",
    overflow: "hidden",
    display: "inline-block",
    verticalAlign: "middle",
    textOverflow: "ellipsis",
  },
  sidebarUsernameNone: {
    color: "#fff",
    textAlign: "left !important",
    paddingLeft: "1rem",
    maxWidth: "100px",
    overflow: "hidden",
    display: "inline-block",
    verticalAlign: "middle",
    textOverflow: "ellipsis",
  },
  statusLabel: {
    color: "#ffffff",
    background: "#4F4F4F",
    padding: "2px 4px",
    borderRadius: "4px",
    float: "right",
    position: "relative",
    top: "0.3rem",
  },
  mainDiv: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: "170px",
    zIndex: 999,
    height: "100%",
    minHeight: "100vh",
    backgroundColor: "#1565c0",
    transition: "all 0.5s ease-in-out",
    position: "relative",
  },
  imageLogo: {
    display: "flex",
    flexShrink: 0,
    marginLeft: "1rem",
    width: "11rem",
    height: "4rem",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  fliphImageLogo: {
    width: "4rem",
    marginLeft: "0.5rem",
  },
  burgerButton: {
    background: "url('images/menu-button-of-three-lines.svg') no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    border: "none",
    outline: "none",
    flex: "1 1 0%",
    textAlign: "center",
    position: "absolute",
    right: "1rem",
    top: "1.6rem",
    width: "2.6rem",
    height: "3rem",
    overflow: "hidden",
    zIndex: 99,
    "&:focus": {
      outline: "1px solid rgba(0, 0, 0, .3) !important",
    },
  },
  fliphBurgerButton: {
    top: "5rem",
    right: "1.3rem",
  },
  sidebarUser: {
    padding: "0.8rem",
    background: "rgba(10, 10, 10, 0.1)",
    borderRadius: ".5rem",
    width: "calc(100% - 2rem)",
    marginLeft: "1rem",
    cursor: "pointer",
  },
  fliphSidebarUser: {
    marginTop: "6rem",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: "170px",
    zIndex: 999,
    height: "100%",
    minHeight: "100vh",
    backgroundColor: "#1565c0",
    transition: "all 0.5s ease-in-out",
    position: "relative",
  },
  fliphSidebar: {
    width: "52px",
    transition: "all 0.5s ease-in-out",
    overflow: "hidden",
    zIndex: 999,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    minHeight: "100vh",
    backgroundColor: "#1565c0",
    position: "relative",
  },
};

export default leftSideBarCss;
