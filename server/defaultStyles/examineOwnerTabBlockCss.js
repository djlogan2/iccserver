const examineOwnerTabBlockCss = {
  type: "examineOwnerTabBlock",
  container: {
    padding: "0.8rem 2.4rem",
  },
  head: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  list: {
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: ".8rem 0",
    margin: 0,
    borderBottom: "1px solid rgba(91, 103, 133, 0.5)",
    listStyle: "none",
    fontFamily: "Roboto, sans-serif",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "1.6rem",
    lineHeight: "1.9rem",
    color: "#000000",
    textTransform: "capitalize",
  },
  movePiecesButton: {
    background: "url(images/move-icon.svg)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    border: 0,
    height: "2rem",
    width: "3rem",
    outline: "none",
  },
  movePiecesButtonActive: {
    background: "url(images/move-icon-active.svg)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    border: 0,
    height: "2rem",
    width: "3rem",
  },
};

export default examineOwnerTabBlockCss;
