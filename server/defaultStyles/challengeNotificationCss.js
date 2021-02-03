const challengeNotificationCss = {
  type: "challengeNotification",
  mainDiv: {
    display: "flex"
  },
  imageAvatar: {
    width: "3.2rem",
    height: "3.2rem",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey",
    marginRight: "8px",
    marginTop: "6px"
  },
  detailsDiv: {
    color: "#8C8C8C"
  },
  actionsDiv: {
    textAlign: "right"
  },
  declineButton: {
    border: "0px",
    color: "#E39335",
    fontWeight: 500,
    fontSize: "14px",
    textTransform: "uppercase"
  },
  acceptButton: {
    border: "0px",
    color: "#1565C0",
    fontWeight: 500,
    fontSize: "14px",
    textTransform: "uppercase"
  },
  divTitle: {
    fontWeight: 500,
    fontSize: "16px",
    color: "#5b6785"
  },
  cancelSeekButton: {
    backgroundColor: "#1565C0",
    color: "#ffffff"
  },
  seekSearchDiv: {
    display: "flex",
    justifyContent: "space-between"
  },
  gameSeekSearchingDiv: {
    marginTop: "0.5rem"
  }
};

export default challengeNotificationCss;
