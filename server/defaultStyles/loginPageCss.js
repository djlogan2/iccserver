const loginPageCss = {
  type: "loginPage",
  modalShow: {
    display: "block",
    position: "fixed",
    zIndex: 9999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    outline: 0,
  },
  modalDialog: {
    position: "relative",
    width: "auto",
    margin: "10px",
  },
  modalContent: {
    position: "relative",
    backgroundColor: "#fff",
    backgroundClip: "padding-box",
    border: "1px solid rgba(0,0,0,.2)",
    borderRadius: "6px",
    outline: 0,
    boxShadow: "0 3px 9px rgba(0,0,0,.5)",
  },
  modalHeader: {
    padding: "15px",
    borderBottom: "1px solid #e5e5e5",
  },
  modalBody: {
    position: "relative",
    padding: "15px",
  },
  modalFooter: {
    padding: "15px",
    textAlign: "right",
    borderTop: 0,
  },
  textCenter: {
    textAlign: "center",
  },
  centerBlock: {
    display: "block",
    marginRight: "auto",
    marginLeft: "auto",
  },
  formGroup: {
    marginBottom: "15px",
  },
};

export default loginPageCss;
