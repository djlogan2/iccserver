import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { translate } from "../../../HOCs/translate";

class GameNotificationPopup extends Component {
  removeAcknowledgeMessage(messageId) {
    Meteor.call("acknowledge.client.message", messageId);
  }

  render() {
    const { title, mid, translate, cssManager } = this.props;

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
      boxShadow: "#0000004d",
    };

    return (
      <div style={style}>
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
            onClick={() => this.removeAcknowledgeMessage(mid)}
            style={cssManager.innerPopupMain()}
          >
            {translate("close")}
          </button>
        </div>
      </div>
    );
  }
}

export default translate("Common.GamenotificationPopup")(GameNotificationPopup);
