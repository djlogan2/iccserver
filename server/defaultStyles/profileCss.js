const profileCss = {
  type: "profile",
  card: {
    position: "relative",
    margin: "2rem",
    height: "auto",
    width: "100%",
  },
  bodyStyle: {},
  mainDiv: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  changePasswordDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "25%",
    justifyContent: "space-around",
  },
  formUsernameDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "25%",
    height: "45%",
    justifyContent: "space-around",
  },
  changeUsernameDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    padding: "1rem",
  },
  errorTitle: {
    color: "#bc0000",
  },
  avatarChangeDiv: {
    display: "flex",
    flexDirection: "column",
    width: "50%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  avatar: {
    width: "min(15vh, 15vw)",
    height: "min(15vh, 15vw)",
    borderRadius: "50%",
    overflow: "hidden",
    background: "grey",
  },
};

export default profileCss;
