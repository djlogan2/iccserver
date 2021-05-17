const editorRightSidebarCss = {
  type: "editorRightSidebar",
  main: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    background: "white",
    height: "100%",
  },
  head: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "8px 23px",
  },
  backButton: {
    background: "#1565C0",
    borderRadius: "8px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "14px",
    color: "#fff",
  },
  title: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "19px",
    color: "#1565C0",
    margin: 0,
    padding: 0,
    marginLeft: "16px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "35px 23px",
    borderTop: "1px solid #EFF0F3",
  },
  colorBlock: {
    display: "flex",
  },
  castling: {
    marginTop: "40px",
  },
  name: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "19px",
    color: "#4F4F4F",
    margin: 0,
    padding: 0,
    marginBottom: "4px",
  },
  castlingWrap: {
    display: "flex",
    flexDirection: "row",
    marginTop: "16px",
  },
  block: {
    display: "flex",
    flexDirection: "row",
    width: "50%",
  },
  checkName: {
    paddingRight: "11px",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "19px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  },
  buttonList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: "85px",
  },
  button: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "25px",
    paddingLeft: "30px",
    border: "none",
  },
  buttonStartingPos: {
    background: "url('images/starting-position.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
    "&:active": {
      background: "url('images/starting-position.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:hover": {
      background: "url('images/starting-position.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:focus": {
      background: "url('images/starting-position.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
  },
  buttonClear: {
    background: "url('images/clear.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
    "&:active": {
      background: "url('images/clear.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:hover": {
      background: "url('images/clear.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:focus": {
      background: "url('images/clear.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
  },
  buttonFlip: {
    background: "url('images/flip.svg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
    "&:active": {
      background: "url('images/flip.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:hover": {
      background: "url('images/flip.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
    "&:focus": {
      background: "url('images/flip.svg')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
    },
  },
  fenBlock: {
    display: "flex",
    flexDirection: "column",
    marginTop: "auto",
  },
};

export default editorRightSidebarCss;
