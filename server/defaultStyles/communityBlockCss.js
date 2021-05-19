const communityBlockCss = {
  type: "communityBlock",
  roomBlock: {
    paddingBottom: "1.6rem",
    borderBottom: "1px solid #e5e5e7",
  },
  roomBlockHead: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.8rem 2.2rem",
  },
  roomBlockTitle: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "500",
    fontSize: "16px",
    lineHeight: "19px",
    margin: 0,
  },
  roomBlockList: {
    padding: 0,
    listStyle: "none",
  },
  roomBlockListItem: {
    padding: "0.8rem 2.2rem",
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "16px",
    lineHeight: "19px",
    cursor: "pointer",
  },
  roomBlockListItemActive: {
    background: "rgba(91, 103, 133, 0.07)",
    color: "#1565c0",
    fontWeight: "bold",
  },
  roomBlockCreateButton: {
    position: "relative",
    top: "15px",
    width: "80%",
    left: "10%",
  },
  roomBlockPlus: {
    border: "none",
    background: "none",
    fontSize: "2rem",
    lineHeight: "2rem",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0,
    paddingLeft: 0,
    "&:hover": {
      outline: "1px solid rgba(0, 0, 0, .3) !important",
      backgroundColor: "transparent",
      color: "#000000",
    },
  },
};

export default communityBlockCss;
