const playerClockCss = {
  type: "playerClock",
  "@keyframes blinking": {
    from: {
      background: "#ff0000",
      boxShadow: "0 0px 5px 5px #ff0000",
    },
    to: {
      background: "#810000",
      boxShadow: "0 0px 5px 5px #810000",
    },
  },
  lowTime: {
    animation: "$blinking .5s infinite",
  },
  regular: {
    borderRadius: "3px",
    fontSize: `1.5vw`,
    color: "#fff",
    paddingLeft: "5px",
    paddingRight: "5px",
    fontWeight: "700",
    transition: "0.3s",
  },
  pointer: {
    cursor: "pointer",
  },
  myTurn: {
    background: "#1890ff",
  },
  notMyTurn: {
    background: "#333333",
  },
};

export default playerClockCss;
