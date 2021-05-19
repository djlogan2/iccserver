const chatAppCss = {
  type: "chatApp",
  main: {
    display: "flex",
    flexGrow: 1,
    height: "100%",
    flexDirection: "column",
  },
  listWrap: {
    display: "flex",
    height: "calc(100% - 4.8rem)",
    overflow: "auto",
  },
  messageList: {
    padding: ".8rem 2.4rem",
  },
  inputBar: {
    display: "flex",
    flexShrink: 0,
    padding: ".8rem 2.4rem",
    height: "4.8rem",
    borderTop: "1px solid  #EFF0F3",
  },
};

export default chatAppCss;
