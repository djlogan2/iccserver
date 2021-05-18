const messengerCss = {
  type: "messenger",
  main: {
    display: "flex",
    flexGrow: 1,
    height: "100vh",
    minHeight: "100%",
    flexDirection: "column",
  },
  head: {
    display: "flex",
    padding: "2.4rem 2.5rem",
    borderBottom: "1px solid #e5e5e7",
  },
  name: {
    display: "flex",
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: "1.6rem",
    lineHeight: "1.9rem",
    margin: 0,
  },
  listWrap: {
    display: "block",
    alignItems: "flex-end",
    height: "calc(100% - 4.8rem)",
    overflow: "auto",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    padding: "0.8rem 2.4rem",
  },
  inputBar: {
    display: "flex",
    flexShrink: 0,
    padding: ".8rem 2.4rem",
    height: "4.8rem",
    borderTop: "1px solid  #EFF0F3",
  },
};

export default messengerCss;
