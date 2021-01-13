const leftSideBarCss = {
  type: "leftSideBar",
  sidebarUserImg: {
    width: "3.2rem",
    height: "3.2rem",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey"
  },
  sidebarUserImgFliphed: {
    width: "2.2rem",
    height: "2.2rem",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey",
    position: "relative",
    right: "3px"
  },
  sidebarUsername: {
    color: "#fff",
    textAlign: "left !important",
    paddingLeft: "1rem",
    maxWidth: "100px",
    overflow: "hidden",
    display: "inline-block",
    verticalAlign: "middle",
    textOverflow: "ellipsis"
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
    position: "relative"
  }
};

export default leftSideBarCss;
