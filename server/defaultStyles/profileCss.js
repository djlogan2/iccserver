const profileCss = {
  type: "profile",
  card: {
    position: "relative",
    top: "2rem",
    left: "2rem",
    width: "calc(100% - 4rem)",
    height: "48%"
  },
  bodyStyle: {
    height: " 100%"
  },
  mainDiv: {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "center"
  },
  changePasswordDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "25%",
    height: "40%",
    justifyContent: "space-around"
  },
  formUsernameDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "25%",
    height: "45%",
    justifyContent: "space-around"
  },
  changeUsernameDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    height: "100%",
    width: "100%"
  },
  errorTitle: {
    color: "#bc0000"
  },
  avatarChangeDiv: {
    display: "flex",
    flexDirection: "column",
    width: "50%",
    height: "70%",
    alignItems: "center",
    justifyContent: "space-around"
  },
  avatar: {
    width: "min(15vh, 15vw)",
    height: "min(15vh, 15vw)",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey"
  }
};

export default profileCss;
