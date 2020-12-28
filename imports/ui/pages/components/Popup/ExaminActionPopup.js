import React, { Component } from "react";
import { translate } from "../../../HOCs/translate";

class ExaminActionPopup extends Component {
  render() {
    const { action, translate, examinActionCloseHandler, cssManager } = this.props;

    const style = {
      width: "385px",
      height: "auto",
      borderRadius: "15px",
      background: "#ffffff",
      position: "fixed",
      zIndex: "99",
      left: "0px",
      right: "25%",
      margin: "0px auto",
      top: "27%",
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ccc",
      boxShadow: "#0000004d"
    };
    if (action === "complain") {
      return (
        <div style={style}>
          <div className="popup_inner">
            <div>
              <label>{translate("email")}</label>
              <input type="text" name="email" />
            </div>
            <div>
              <label>{translate("complaint")}</label>
              <textarea name="complaint" rows="4" cols="35" />
            </div>
            <div>
              <button
                onClick={() => examinActionCloseHandler()}
                style={cssManager.innerPopupMain()}
              >
                {translate("submit")}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (action === "emailgame") {
      return (
        <div style={style}>
          <div className="popup_inner">
            <div>
              <label>{translate("email")}</label>
              <input type="text" name="email" />
            </div>

            <div>
              <button
                onClick={() => examinActionCloseHandler()}
                style={cssManager.innerPopupMain()}
              >
                {translate("submit")}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default translate("Common.ExaminActionPopup")(ExaminActionPopup);
