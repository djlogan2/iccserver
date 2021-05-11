import React, { Component } from "react";
import { translate } from "../../../HOCs/translate";

class GameResignedPopup extends Component {
  render() {
    const { title, resignNotificationCloseHandler, cssManager, translate } = this.props;

    return (
      <div
        style={{
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
          boxShadow: "#0000004d",
        }}
      >
        <div className="popup_inner">
          <h3
            style={{
              margin: "10px 0px 20px",
              color: "#000",
              fontSize: "17px",
            }}
          >
            {title}
          </h3>
          <button
            onClick={() => resignNotificationCloseHandler()}
            style={cssManager.innerPopupMain()}
          >
            {translate("close")}
          </button>
        </div>
      </div>
    );
  }
}

export default translate("Common.GameResignedPopup")(GameResignedPopup);
