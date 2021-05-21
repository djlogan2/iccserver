const playOptionButtonsCss = {
  type: "playOptionButtons",
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    minHeight: "88vh",
  },
  top: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    width: "60rem",
    height: "10rem",
    maxWidth: "90%",
    columnGap: "2.4rem",
    rowGap: "2.4rem",
  },
  topDisabled: {
    display: "none",
    width: "60rem",
    height: "10rem",
    maxWidth: "90%",
  },
  topButton: {
    color: "#ffffff",
    height: "100%",
    background: "#1565C0",
    borderRadius: "6px",
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    width: "60rem",
    maxWidth: "90%",
  },
  buttonBig: {
    padding: "2.4rem",
    height: "auto",
    background: "#EFF0F3",
    marginTop: "2.4rem",
    fontSize: "18px",
    fontWeight: 500,
    borderRadius: "8px",
  },
  buttonBigDisabled: {
    display: "none",
    padding: "2.4rem",
    height: "auto",
    background: "#EFF0F3",
    marginTop: "2.4rem",
    fontSize: "18px",
    fontWeight: 500,
    borderRadius: "8px",
  },
};

export default playOptionButtonsCss;
