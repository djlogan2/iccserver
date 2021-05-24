const gameControlBlockCss = {
  type: "gameControlBlock",
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTop: "1px solid #EFF0F3",
    padding: "0 1rem",
  },
  actionControlsItem: {
    display: "flex",
    border: "none",
    backgroundColor: "#fff",
    height: "4rem",
    width: "4rem",
    cursor: "pointer",
  },
  locationControlsItemImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    display: "block",
    margin: "auto auto",
  },
  locationControlItem: {
    display: "flex",
    border: "none",
    backgroundColor: "#fff",
    height: "4rem",
    width: "4rem",
    cursor: "pointer",
  },
  locationControls: {
    display: "flex",
  },
  actionControls: {
    display: "flex",
  },
};

export default gameControlBlockCss;
